/* Local engine sidecar: a loopback HTTP surface in front of the UCI
 * supervisors. The client discovers it on 127.0.0.1:38651–38661 and drives
 * install / warm / stop / move through it. */
import http from 'node:http';
import { dirname } from 'node:path';
import { EngineSupervisor } from './lib/engine-supervisor.mjs';
import { createEngineStore } from './lib/engine-store.mjs';

export const PROTOCOL = 'dsh-minigame-sidecar/1';
const BODY_LIMIT = 64 * 1024;
const LOCAL_ORIGIN = /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i;
/* The desktop app renders its UI from dsh-app://app (see app.asar lib/main.js),
 * so its fetches carry that origin instead of the web server's http origin. */
const APP_ORIGIN = 'dsh-app://app';
const allowedOrigin = (origin) => !origin || origin === APP_ORIGIN || LOCAL_ORIGIN.test(origin);

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > BODY_LIMIT) {
        req.destroy();
        reject(new Error('request body is too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(new Error('request body is not valid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function bodyId(body) {
  const id = String((body && body.id) || '');
  if (!id) {
    const error = new Error('missing engine id');
    error.code = 'bad-request';
    throw error;
  }
  return id;
}

export function startSidecar(options = {}) {
  const root = options.dir || '.';
  const engines = options.engines || {};
  const idleMs = options.idleMs || 10 * 60 * 1000;
  const log = options.log || (() => {});
  const store = createEngineStore({ root, engines, log });
  const supervisors = new Map();
  let actualPort = 0;
  let closing = false;

  const supervisor = (id) => {
    if (!engines[id]) {
      const error = new Error('unknown engine ' + id);
      error.code = 'unknown-engine';
      throw error;
    }
    if (!supervisors.has(id)) {
      const exe = store.resolveExe(id);
      const args = store.argsFor(id);
      const base = engines[id].dir;
      const cwd = !base ? undefined
        : (exe && dirname(exe) === base ? base : (exe ? dirname(exe) : base));
      supervisors.set(id, new EngineSupervisor({
        id,
        spec: engines[id],
        exe,
        args,
        cwd,
        idleMs,
        log,
      }));
    }
    return supervisors.get(id);
  };

  const server = http.createServer(async (req, res) => {
    const origin = req.headers.origin;
    if (!allowedOrigin(origin)) {
      log('warn', 'origin rejected: ' + origin);
      res.writeHead(403, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'origin not allowed', code: 'origin' }));
      return;
    }
    const cors = origin
      ? { 'access-control-allow-origin': origin, vary: 'origin' }
      : {};
    const send = (code, data) => {
      res.writeHead(code, Object.assign({
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
      }, cors));
      res.end(JSON.stringify(data));
    };

    if (req.method === 'OPTIONS') {
      res.writeHead(204, Object.assign({
        'access-control-allow-methods': 'GET, POST, OPTIONS',
        'access-control-allow-headers': 'content-type',
        'access-control-max-age': '600',
      }, cors));
      res.end();
      return;
    }

    const url = new URL(req.url, 'http://127.0.0.1');
    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        send(200, {
          ok: true,
          protocol: PROTOCOL,
          version: 2,
          pid: process.pid,
          port: actualPort,
          uptime: Math.round(process.uptime()),
        });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/engines') {
        const list = Object.keys(engines).map((id) => {
          const spec = engines[id];
          const info = store.installed(id);
          const sup = supervisors.get(id);
          return {
            id,
            game: spec.game || '',
            label: spec.label || id,
            tier: spec.tier || 'strong',
            license: spec.license || '',
            size: spec.size || '',
            protocol: spec.protocol || 'uci',
            installed: info.installed,
            bytes: info.bytes,
            state: sup ? sup.state : 'stopped',
          };
        });
        send(200, { engines: list, service: { protocol: PROTOCOL, port: actualPort } });
        return;
      }

      if (req.method === 'POST') {
        const body = await readBody(req);
        if (url.pathname === '/install') {
          const id = bodyId(body);
          if (supervisors.has(id)) {
            await supervisors.get(id).stop();
            supervisors.delete(id);
          }
          send(200, await store.install(id));
          return;
        }
        if (url.pathname === '/remove') {
          const id = bodyId(body);
          if (supervisors.has(id)) {
            await supervisors.get(id).stop();
            supervisors.delete(id);
          }
          send(200, await store.remove(id));
          return;
        }
        if (url.pathname === '/warm') {
          const id = bodyId(body);
          const sup = supervisor(id);
          await sup.ensure();
          send(200, { id, state: sup.state });
          return;
        }
        if (url.pathname === '/stop') {
          const id = bodyId(body);
          const sup = supervisors.get(id);
          if (sup) await sup.stop();
          send(200, { id, state: sup ? sup.state : 'stopped' });
          return;
        }
        if (url.pathname === '/move') {
          const sup = supervisor(bodyId(body));
          const result = await sup.move(body);
          send(200, Object.assign({ id: bodyId(body) }, result));
          return;
        }
      }

      send(404, { error: 'not found', code: 'not-found' });
    } catch (error) {
      const code = error && error.code ? error.code : 'engine-error';
      const status = code === 'unknown-engine' ? 404 : code === 'bad-request' ? 400
        : code === 'archive-unsupported' || code === 'asset-not-found' ? 409 : 500;
      log('error', 'sidecar request ' + req.method + ' ' + url.pathname + ' failed', error);
      send(status, { error: String((error && error.message) || error), code });
    }
  });

  const close = async () => {
    if (closing) return;
    closing = true;
    await Promise.all([...supervisors.values()].map((sup) => sup.dispose().catch(() => {})));
    supervisors.clear();
    await new Promise((resolve) => server.close(() => resolve()));
  };

  const killAll = () => {
    for (const sup of supervisors.values()) sup.kill();
  };
  process.once('exit', killAll);

  const listen = (base, attempt) => new Promise((resolve, reject) => {
    const onError = (error) => {
      server.removeListener('error', onError);
      if (error.code === 'EADDRINUSE' && attempt < 10) {
        listen(base, attempt + 1).then(resolve, reject);
      } else {
        reject(error);
      }
    };
    server.once('error', onError);
    server.listen(base + attempt, '127.0.0.1', () => {
      server.removeListener('error', onError);
      actualPort = base + attempt;
      log('info', 'sidecar listening on 127.0.0.1:' + actualPort);
      resolve({ port: actualPort, close, server });
    });
  });

  return listen(options.port || 38651, 0);
}
