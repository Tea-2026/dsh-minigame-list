import { startSidecar } from '../sidecar.mjs';

const port = 38690;
const side = await startSidecar({
  port,
  idleMs: 400,
  engines: {
    fake: { exe: process.execPath, args: ['tools/fake-uci.mjs'], game: 'xiangqi' },
  },
});
const base = 'http://127.0.0.1:' + side.port;
const call = async (path, body) => {
  const res = await fetch(base + path, body
    ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }
    : undefined);
  return res.json();
};

const health = await call('/health');
if (!health.ok) throw new Error('health failed');
const warm = await call('/warm', { id: 'fake' });
if (warm.state !== 'ready') throw new Error('warm failed: ' + JSON.stringify(warm));
const move = await call('/move', { id: 'fake', fen: 'startpos', moves: [], movetime: 100 });
if (move.bestmove !== 'e2e4') throw new Error('move failed: ' + JSON.stringify(move));
const stop = await call('/stop', { id: 'fake' });
if (stop.state !== 'stopped') throw new Error('stop failed');
await call('/warm', { id: 'fake' });
await new Promise((resolve) => setTimeout(resolve, 700));
const list = await call('/engines');
if (list.engines[0].state !== 'stopped') throw new Error('idle timeout failed: ' + JSON.stringify(list));
side.close();
console.log('sidecar checks passed');
