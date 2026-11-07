/* Local engine sidecar: an HTTP surface on 127.0.0.1 plus UCI process supervision.
 * The Client UI talks to this over fetch; engine processes are started lazily and
 * released after an idle timeout or when the Harness exits. */
import http from 'node:http';
import { spawn } from 'node:child_process';

const IDLE_MS = 10 * 60 * 1000;
const PROTOCOL = 'dsh-minigame-sidecar/1';

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 64 * 1024) reject(new Error('body too large'));
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

class Engine {
  constructor(id, spec, idleMs) {
    this.id = id;
    this.spec = spec;
    this.idleMs = idleMs;
    this.proc = null;
    this.state = 'stopped';
    this.buffer = '';
    this.waiters = [];
    this.queue = Promise.resolve();
    this.idleTimer = 0;
    this.onState = null;
  }

  emit(state, detail) {
    this.state = state;
    if (this.onState) this.onState(this.id, state, detail);
  }

  touch() {
    clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => this.stop('idle'), this.idleMs);
  }

  expect(pattern, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.waiters = this.waiters.filter((w) => w.resolve !== resolve);
        reject(new Error('engine timeout waiting for ' + pattern));
      }, timeoutMs);
      this.waiters.push({ pattern, resolve, reject, timer });
    });
  }

  feed(line) {
    for (const waiter of this.waiters.slice()) {
      if (waiter.pattern.test(line)) {
        clearTimeout(waiter.timer);
        this.waiters = this.waiters.filter((w) => w !== waiter);
        waiter.resolve(line);
      }
    }
  }

  async start() {
    if (this.proc) return;
    this.emit('starting');
    const proc = spawn(this.spec.exe, this.spec.args || [], { stdio: ['pipe', 'pipe', 'pipe'] });
    this.proc = proc;
    proc.stdout.setEncoding('utf8');
    proc.stdout.on('data', (chunk) => {
      this.buffer += chunk;
      let at = this.buffer.indexOf('\n');
      while (at >= 0) {
        const line = this.buffer.slice(0, at).trim();
        this.buffer = this.buffer.slice(at + 1);
        if (line) this.feed(line);
        at = this.buffer.indexOf('\n');
      }
    });
    proc.stderr.setEncoding('utf8');
    proc.stderr.on('data', () => {});
    proc.on('exit', () => {
      this.proc = null;
      this.waiters.forEach((w) => {
        clearTimeout(w.timer);
        w.reject(new Error('engine exited'));
      });
      this.waiters = [];
      this.emit('stopped');
    });
    const api = (line) => proc.stdin.write(line + '\n');
    this.send = api;
    api('uci');
    await this.expect(/^uciok/);
    if (this.spec.variant) api('setoption name UCI_Variant value ' + this.spec.variant);
    api('isready');
    await this.expect(/^readyok/);
    this.emit('ready');
    this.touch();
  }

  async ensure() {
    if (this.proc && this.state === 'ready') {
      this.touch();
      return;
    }
    if (!this.proc) await this.start();
    else await this.expect(/^readyok/);
  }

  async move(fen, moves, movetime) {
    const run = async () => {
      await this.ensure();
      this.touch();
      this.emit('thinking');
      const api = (line) => this.proc.stdin.write(line + '\n');
      api('position fen ' + fen + (moves && moves.length ? ' moves ' + moves.join(' ') : ''));
      api('go movetime ' + Math.max(20, Math.min(10000, movetime || 300)));
      const line = await this.expect(/^bestmove/, 15000);
      this.emit('ready');
      this.touch();
      return line.split(/\s+/)[1] || null;
    };
    const result = this.queue.then(run, run);
    this.queue = result.catch(() => {});
    return result;
  }

  async stop(reason) {
    clearTimeout(this.idleTimer);
    const proc = this.proc;
    if (!proc) {
      this.state = 'stopped';
      return;
    }
    try {
      proc.stdin.write('quit\n');
    } catch (error) {
      /* already gone */
    }
    await new Promise((resolve) => {
      const timer = setTimeout(() => {
        try { proc.kill(); } catch (error) { /* ignore */ }
        resolve();
      }, 3000);
      proc.once('exit', () => {
        clearTimeout(timer);
        resolve();
      });
    });
    this.proc = null;
    this.emit('stopped', reason || 'manual');
  }
}

export function startSidecar(options = {}) {
  const idleMs = options.idleMs || IDLE_MS;
  const specs = options.engines || {};
  const engineMap = new Map();
  const getEngine = (id) => {
    if (!specs[id]) throw new Error('unknown engine ' + id);
    if (!engineMap.has(id)) engineMap.set(id, new Engine(id, specs[id], idleMs));
    return engineMap.get(id);
  };

  const server = http.createServer(async (req, res) => {
    const send = (code, data) => {
      res.writeHead(code, {
        'content-type': 'application/json; charset=utf-8',
        'access-control-allow-origin': req.headers.origin || '*',
        'access-control-allow-headers': 'content-type, x-dsh-minigame',
        'cache-control': 'no-store',
      });
      res.end(JSON.stringify(data));
    };
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'access-control-allow-origin': req.headers.origin || '*',
        'access-control-allow-methods': 'GET, POST, OPTIONS',
        'access-control-allow-headers': 'content-type, x-dsh-minigame',
      });
      res.end();
      return;
    }
    const url = new URL(req.url, 'http://127.0.0.1');
    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        send(200, { ok: true, protocol: PROTOCOL });
        return;
      }
      if (req.method === 'GET' && url.pathname === '/engines') {
        send(200, {
          engines: Object.keys(specs).map((id) => ({
            id,
            game: specs[id].game,
            state: engineMap.get(id)?.state || 'stopped',
          })),
        });
        return;
      }
      if (req.method === 'POST' && url.pathname === '/warm') {
        const body = await parseBody(req);
        const engine = getEngine(body.id);
        await engine.ensure();
        send(200, { id: body.id, state: engine.state });
        return;
      }
      if (req.method === 'POST' && url.pathname === '/stop') {
        const body = await parseBody(req);
        const engine = getEngine(body.id);
        await engine.stop('manual');
        send(200, { id: body.id, state: engine.state });
        return;
      }
      if (req.method === 'POST' && url.pathname === '/move') {
        const body = await parseBody(req);
        const engine = getEngine(body.id);
        const best = await engine.move(String(body.fen || ''), body.moves || [], body.movetime);
        send(200, { id: body.id, bestmove: best });
        return;
      }
      send(404, { error: 'not found' });
    } catch (error) {
      send(500, { error: String(error && error.message || error) });
    }
  });

  const close = () => {
    for (const engine of engineMap.values()) engine.stop('shutdown');
    server.close();
  };
  process.once('exit', close);
  process.once('SIGINT', close);
  process.once('SIGTERM', close);

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    const base = options.port || 38651;
    let attempt = 0;
    const listen = () => {
      const port = base + attempt;
      server.listen(port, '127.0.0.1', () => {
        resolve({ port, close, server });
      });
      server.once('error', (error) => {
        if (error.code === 'EADDRINUSE' && attempt < 10) {
          attempt += 1;
          server.removeAllListeners('error');
          listen();
        } else {
          reject(error);
        }
      });
    };
    listen();
  });
}
