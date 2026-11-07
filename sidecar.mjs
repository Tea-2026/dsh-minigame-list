/* Local engine sidecar: an HTTP surface on 127.0.0.1 plus UCI process supervision.
 * The Client UI talks to this over fetch; engine processes are started lazily and
 * released after an idle timeout or when the Harness exits. */
import http from 'node:http';
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const IDLE_MS = 10 * 60 * 1000;
const CURL = process.platform === 'win32' ? ['curl', '--ssl-no-revoke'] : ['curl'];
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
  }

  emit(state) {
    this.state = state;
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
    proc.stdin.write('uci\n');
    await this.expect(/^uciok/);
    if (this.spec.variant) proc.stdin.write('setoption name UCI_Variant value ' + this.spec.variant + '\n');
    proc.stdin.write('isready\n');
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
      const proc = this.proc;
      const position = fen === 'startpos' ? 'position startpos' : 'position fen ' + fen;
      proc.stdin.write(position + (moves && moves.length ? ' moves ' + moves.join(' ') : '') + '\n');
      proc.stdin.write('go movetime ' + Math.max(20, Math.min(10000, movetime || 300)) + '\n');
      const line = await this.expect(/^bestmove/, 15000);
      this.emit('ready');
      this.touch();
      return line.split(/\s+/)[1] || null;
    };
    const result = this.queue.then(run, run);
    this.queue = result.catch(() => {});
    return result;
  }

  async stop() {
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
    this.emit('stopped');
  }
}

export function startSidecar(options = {}) {
  const idleMs = options.idleMs || IDLE_MS;
  const specs = options.engines || {};
  const root = options.dir || '.';
  const engineMap = new Map();
  const getEngine = (id) => {
    if (!specs[id]) throw new Error('unknown engine ' + id);
    if (!engineMap.has(id)) engineMap.set(id, new Engine(id, specs[id], idleMs));
    return engineMap.get(id);
  };
  const installed = (id) => existsSync(join(root, 'engines', id, 'engine.exe'));

  const install = async (id) => {
    const spec = specs[id];
    if (!spec || !spec.repo) throw new Error('engine not installable');
    const dir = join(root, 'engines', id);
    mkdirSync(dir, { recursive: true });
    /* Use the system curl so TLS goes through the OS trust store (VPN/proxy safe). */
    const release = JSON.parse(execFileSync(CURL[0], [...CURL.slice(1), '-sL', '-H', 'user-agent: dsh-minigame-list', 'https://api.github.com/repos/' + spec.repo + '/releases/latest'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }));
    const pattern = new RegExp(spec.asset || 'x86-64.*\\.exe$');
    const asset = (release.assets || []).find((item) => pattern.test(item.name));
    if (!asset) throw new Error('no matching release asset');
    const target = join(dir, 'engine.exe');
    execFileSync(CURL[0], [...CURL.slice(1), '-sL', '-o', target, asset.browser_download_url], { stdio: 'pipe', maxBuffer: 8 * 1024 * 1024 });
    const bytes = statSync(target).size;
    if (!bytes) throw new Error('download failed');
    return { id, bytes, tag: release.tag_name };
  };

  const remove = async (id) => {
    if (!specs[id]) throw new Error('unknown engine ' + id);
    const engine = engineMap.get(id);
    if (engine) await engine.stop();
    rmSync(join(root, 'engines', id), { recursive: true, force: true });
    return { id, installed: false };
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
            label: specs[id].label || id,
            installed: installed(id),
            state: engineMap.get(id)?.state || 'stopped',
          })),
        });
        return;
      }
      if (req.method === 'POST' && url.pathname === '/install') {
        const body = await parseBody(req);
        send(200, await install(body.id));
        return;
      }
      if (req.method === 'POST' && url.pathname === '/remove') {
        const body = await parseBody(req);
        send(200, await remove(body.id));
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
        await engine.stop();
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
      send(500, { error: String((error && error.message) || error) });
    }
  });

  const close = () => {
    for (const engine of engineMap.values()) engine.stop();
    server.close();
  };
  process.once('exit', close);
  process.once('SIGINT', close);
  process.once('SIGTERM', close);

  return new Promise((resolve, reject) => {
    const base = options.port || 38651;
    let attempt = 0;
    const listen = () => {
      server.listen(base + attempt, '127.0.0.1', () => {
        resolve({ port: base + attempt, close, server });
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


