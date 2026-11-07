/* One UCI engine process: lazy start, serialised search, idle shutdown.
 * The supervisor owns the process; the service owns the supervisor map. */
import { spawn } from 'node:child_process';

const HANDSHAKE_TIMEOUT = 15000;
const SEARCH_TIMEOUT = 15000;

export class EngineSupervisor {
  constructor(options) {
    this.id = options.id;
    this.spec = options.spec || {};
    this.idleMs = options.idleMs || 10 * 60 * 1000;
    this.log = options.log || (() => {});
    this.proc = null;
    this.state = 'stopped';
    this.buffer = '';
    this.waiters = [];
    this.queue = Promise.resolve();
    this.idleTimer = 0;
    this.starting = null;
    this.stderr = [];
  }

  setState(state) {
    this.state = state;
  }

  write(line) {
    if (!this.proc) return;
    try {
      this.proc.stdin.write(line + '\n');
    } catch (error) {
      /* the pipe can close between a check and a write */
    }
  }

  touch() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      this.stop().catch((error) => this.log('warn', 'idle stop failed', error));
    }, this.idleMs);
  }

  expect(pattern, timeoutMs, label) {
    return new Promise((resolve, reject) => {
      const waiter = { pattern, resolve, reject };
      waiter.timer = setTimeout(() => {
        this.waiters = this.waiters.filter((item) => item !== waiter);
        reject(new Error((label || 'engine') + ' timed out'));
      }, timeoutMs || HANDSHAKE_TIMEOUT);
      this.waiters.push(waiter);
    });
  }

  feed(line) {
    for (const waiter of this.waiters.slice()) {
      if (!waiter.pattern.test(line)) continue;
      clearTimeout(waiter.timer);
      this.waiters = this.waiters.filter((item) => item !== waiter);
      waiter.resolve(line);
    }
  }

  rejectWaiters(error) {
    for (const waiter of this.waiters) {
      clearTimeout(waiter.timer);
      waiter.reject(error);
    }
    this.waiters = [];
  }

  kill() {
    const proc = this.proc;
    this.proc = null;
    if (!proc) return;
    try {
      proc.kill();
    } catch (error) {
      /* already gone */
    }
  }

  start() {
    if (this.proc) return Promise.resolve();
    if (this.starting) return this.starting;
    this.starting = (async () => {
      this.setState('starting');
      const proc = spawn(this.spec.exe, this.spec.args || [], { stdio: ['pipe', 'pipe', 'pipe'] });
      this.proc = proc;
      proc.stdout.setEncoding('utf8');
      proc.stdout.on('data', (chunk) => {
        this.buffer += chunk;
        let index = this.buffer.indexOf('\n');
        while (index >= 0) {
          const line = this.buffer.slice(0, index).trim();
          this.buffer = this.buffer.slice(index + 1);
          if (line) this.feed(line);
          index = this.buffer.indexOf('\n');
        }
      });
      proc.stderr.setEncoding('utf8');
      proc.stderr.on('data', (chunk) => {
        const text = String(chunk).trim();
        if (text) {
          this.stderr.push(text);
          if (this.stderr.length > 20) this.stderr.shift();
        }
      });
      proc.on('error', (error) => {
        this.proc = null;
        this.setState('error');
        this.rejectWaiters(error);
        this.log('error', 'engine ' + this.id + ' failed to spawn', error);
      });
      proc.on('exit', (code) => {
        const wasRunning = Boolean(this.proc);
        this.proc = null;
        this.rejectWaiters(new Error('engine exited'));
        this.setState('stopped');
        if (wasRunning) this.log('warn', 'engine ' + this.id + ' exited', { code });
      });

      const uciOk = this.expect(/^uciok/, HANDSHAKE_TIMEOUT, 'uciok');
      this.write('uci');
      await uciOk;
      if (this.spec.variant) this.write('setoption name UCI_Variant value ' + this.spec.variant);
      const readyOk = this.expect(/^readyok/, HANDSHAKE_TIMEOUT, 'readyok');
      this.write('isready');
      await readyOk;
      this.setState('ready');
      this.touch();
      this.log('info', 'engine ' + this.id + ' ready');
    })().catch((error) => {
      this.setState('error');
      this.log('error', 'engine ' + this.id + ' start failed', error);
      if (this.stderr.length) this.log('error', 'engine ' + this.id + ' stderr', this.stderr.join('\n'));
      this.kill();
      throw error;
    }).finally(() => {
      this.starting = null;
    });
    return this.starting;
  }

  async ensure() {
    if (this.proc && this.state === 'ready') {
      this.touch();
      return;
    }
    if (this.starting) {
      await this.starting;
      this.touch();
      return;
    }
    await this.start();
    this.touch();
  }

  async move(fen, moves, movetime) {
    const run = async () => {
      await this.ensure();
      this.touch();
      this.setState('thinking');
      const best = this.expect(/^bestmove/, SEARCH_TIMEOUT, 'bestmove');
      const position = fen === 'startpos' ? 'position startpos' : 'position fen ' + String(fen || '');
      this.write(position + (moves && moves.length ? ' moves ' + moves.join(' ') : ''));
      this.write('go movetime ' + Math.max(20, Math.min(10000, Number(movetime) || 300)));
      let line;
      try {
        line = await best;
      } finally {
        if (this.state === 'thinking') this.setState('ready');
      }
      this.touch();
      return line.split(/\s+/)[1] || null;
    };
    const result = this.queue.then(run, run);
    this.queue = result.catch(() => {});
    return result;
  }

  async stop() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = 0;
    }
    const proc = this.proc;
    if (!proc) {
      this.setState('stopped');
      return;
    }
    this.write('quit');
    await new Promise((resolve) => {
      const timer = setTimeout(() => {
        try {
          proc.kill();
        } catch (error) {
          /* already gone */
        }
        resolve();
      }, 3000);
      proc.once('exit', () => {
        clearTimeout(timer);
        resolve();
      });
    });
    this.proc = null;
    this.setState('stopped');
  }

  dispose() {
    return this.stop();
  }
}
