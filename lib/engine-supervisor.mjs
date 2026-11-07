/* One engine process: lazy start, serialised searches, idle shutdown.
 * Three protocols are supported: UCI (xiangqi), GTP (KataGo) and the Gomocup
 * text protocol (Rapfi). */
import { spawn } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const HANDSHAKE_TIMEOUT = 60000;
const SEARCH_TIMEOUT = 20000;

function sgfCoord(x, y) {
  return String.fromCharCode(97 + x) + String.fromCharCode(97 + y);
}

function buildSgf(request, size, komi) {
  const black = [];
  const white = [];
  for (const stone of request.stones || []) {
    const [x, y, color] = stone;
    if (color === 1) black.push('[' + sgfCoord(x, y) + ']');
    else if (color === 2) white.push('[' + sgfCoord(x, y) + ']');
  }
  const toPlay = request.color === 2 || request.color === 'W' ? 'W' : 'B';
  return '(;FF[4]GM[1]SZ[' + size + ']KM[' + komi + ']RU[Chinese]'
    + (black.length ? 'AB' + black.join('') : '')
    + (white.length ? 'AW' + white.join('') : '')
    + 'PL[' + toPlay + '])';
}

export class EngineSupervisor {
  constructor(options) {
    this.id = options.id;
    this.spec = options.spec || {};
    this.protocol = this.spec.protocol || 'uci';
    this.exe = options.exe || this.spec.exe;
    this.args = options.args || this.spec.args || [];
    this.cwd = options.cwd || this.spec.dir || process.cwd();
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
    this.size = 0;
    this.komi = 0;
    this.positionFile = join(tmpdir(), 'dsh-minigame-position-' + process.pid + '-' + this.id + '.sgf');
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

  async gtp(command, timeoutMs) {
    const wait = this.expect(/^[=?]/, timeoutMs || SEARCH_TIMEOUT, command.split(/\s+/)[0]);
    this.write(command);
    const line = await wait;
    if (line[0] === '?') throw new Error(line.slice(1).trim() || 'gtp error');
    return line.slice(1).trim();
  }

  start() {
    if (this.proc) return Promise.resolve();
    if (this.starting) return this.starting;
    this.starting = (async () => {
      if (!this.exe || !existsSync(this.exe)) {
        const error = new Error('engine ' + this.id + ' is not installed');
        error.code = 'not-installed';
        throw error;
      }
      this.setState('starting');
      const proc = spawn(this.exe, this.args, { cwd: this.cwd, stdio: ['pipe', 'pipe', 'pipe'] });
      this.proc = proc;
      proc.stdout.setEncoding('utf8');
      proc.stdout.on('data', (chunk) => {
        this.buffer += chunk;
        let index = this.buffer.indexOf('\n');
        while (index >= 0) {
          const line = this.buffer.slice(0, index).replace(/\r$/, '').trim();
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

      if (this.protocol === 'uci') {
        const uciOk = this.expect(/^uciok/, HANDSHAKE_TIMEOUT, 'uciok');
        this.write('uci');
        await uciOk;
        if (this.spec.variant) this.write('setoption name UCI_Variant value ' + this.spec.variant);
        const readyOk = this.expect(/^readyok/, HANDSHAKE_TIMEOUT, 'readyok');
        this.write('isready');
        await readyOk;
      } else if (this.protocol === 'gtp') {
        await this.gtp('name', HANDSHAKE_TIMEOUT);
      }
      this.setState('ready');
      this.touch();
      this.log('info', 'engine ' + this.id + ' ready (' + this.protocol + ')');
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

  levelOptions(request) {
    const levels = this.spec.levels || {};
    return levels[request.level] || levels.normal || {};
  }

  async uciMove(request) {
    await this.ensure();
    this.touch();
    this.setState('thinking');
    const best = this.expect(/^bestmove/, SEARCH_TIMEOUT, 'bestmove');
    const position = request.fen === 'startpos' ? 'position startpos' : 'position fen ' + String(request.fen || '');
    this.write(position + (request.moves && request.moves.length ? ' moves ' + request.moves.join(' ') : ''));
    const options = this.levelOptions(request);
    const movetime = Math.max(20, Math.min(15000, Number(request.movetime || options.movetime || 300)));
    this.write('go movetime ' + movetime);
    let line;
    try {
      line = await best;
    } finally {
      if (this.state === 'thinking') this.setState('ready');
    }
    this.touch();
    return { bestmove: line.split(/\s+/)[1] || null };
  }

  async gtpMove(request) {
    await this.ensure();
    this.touch();
    this.setState('thinking');
    try {
      const size = Number(request.size) || 19;
      const komi = Number(request.komi) || 6.5;
      if (this.size !== size) {
        await this.gtp('boardsize ' + size);
        this.size = size;
      }
      if (this.komi !== komi) {
        await this.gtp('komi ' + komi);
        this.komi = komi;
      }
      const options = this.levelOptions(request);
      const visits = Math.max(1, Math.min(2000, Number(request.maxVisits || options.maxVisits || 40)));
      await this.gtp('kata-set-param maxVisits ' + visits);
      writeFileSync(this.positionFile, buildSgf(request, size, komi), 'utf8');
      await this.gtp('loadsgf ' + this.positionFile);
      const color = request.color === 2 || request.color === 'W' ? 'W' : 'B';
      const reply = await this.gtp('genmove ' + color, SEARCH_TIMEOUT);
      return { move: reply };
    } finally {
      if (this.state === 'thinking') this.setState('ready');
      this.touch();
    }
  }

  async gomocupMove(request) {
    await this.ensure();
    this.touch();
    this.setState('thinking');
    try {
      const size = Number(request.size) || 15;
      const options = this.levelOptions(request);
      const turnTime = Math.max(50, Math.min(15000, Number(request.timeoutTurn || options.timeoutTurn || 800)));
      this.write('START ' + size);
      this.write('INFO game_type 1');
      this.write('INFO rule 1');
      this.write('INFO timeout_turn ' + turnTime);
      this.write('INFO timeout_match 300000');
      this.write('BOARD');
      for (const stone of request.stones || []) {
        this.write(stone[0] + ',' + stone[1] + ',' + stone[2]);
      }
      const wait = this.expect(/^-?\d+,-?\d+/, SEARCH_TIMEOUT, 'gomocup move');
      this.write('DONE');
      const line = await wait;
      return { move: line };
    } finally {
      if (this.state === 'thinking') this.setState('ready');
      this.touch();
    }
  }

  async move(request) {
    const run = async () => {
      if (this.protocol === 'gtp') return this.gtpMove(request);
      if (this.protocol === 'gomocup') return this.gomocupMove(request);
      return this.uciMove(request);
    };
    const result = this.queue.then(run, run);
    const guarded = result.catch((error) => {
      this.rejectWaiters(error);
      this.kill();
      this.setState('stopped');
      throw error;
    });
    this.queue = guarded.catch(() => {});
    return guarded;
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
    this.write(this.protocol === 'gomocup' ? 'END' : 'quit');
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
