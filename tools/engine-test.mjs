import { readFileSync } from 'node:fs';
import { startSidecar } from '../sidecar.mjs';

const raw = JSON.parse(readFileSync('engines.json', 'utf8'));
const engines = {};
for (const [id, spec] of Object.entries(raw.engines)) {
  engines[id] = { ...spec, exe: 'engines/' + id + '/engine.exe' };
}

const side = await startSidecar({ port: 38692, idleMs: 600000, dir: process.cwd(), engines });
const base = 'http://127.0.0.1:' + side.port;
const call = async (path, body) => {
  const res = await fetch(base + path, body
    ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }
    : undefined);
  return res.json();
};

const install = await call('/install', { id: 'xiangqi' });
if (!install.bytes) throw new Error('install failed: ' + JSON.stringify(install));
console.log('installed', install.tag, install.bytes, 'bytes');
const warm = await call('/warm', { id: 'xiangqi' });
if (warm.state !== 'ready') throw new Error('warm failed: ' + JSON.stringify(warm));
const move = await call('/move', { id: 'xiangqi', fen: 'startpos', moves: [], movetime: 300 });
console.log('bestmove', move.bestmove);
if (!/^[a-i][0-9][a-i][0-9]$/.test(move.bestmove)) throw new Error('bad move: ' + JSON.stringify(move));
const stop = await call('/stop', { id: 'xiangqi' });
console.log('state', stop.state);
side.close();
console.log('real engine checks passed');
