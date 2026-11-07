import { startSidecar } from '../sidecar.mjs';

const port = 38690;
const side = await startSidecar({
  port,
  idleMs: 400,
  engines: {
    fake: { exe: process.execPath, args: ['tools/fake-uci.mjs'], game: 'xiangqi', label: 'Fake USB' },
    fakemoku: {
      exe: process.execPath, args: ['tools/fake-gomocup.mjs'], game: 'gomoku', protocol: 'gomocup', label: 'Fake Gomoku',
    },
  },
});
const base = 'http://127.0.0.1:' + side.port;
const call = async (path, body, headers) => {
  const res = await fetch(base + path, body
    ? { method: 'POST', headers: Object.assign({ 'content-type': 'application/json' }, headers), body: JSON.stringify(body) }
    : { headers });
  return { status: res.status, acao: res.headers.get('access-control-allow-origin'), json: await res.json() };
};

const health = await call('/health');
if (!health.json.ok) throw new Error('health failed');

const blocked = await call('/health', null, { origin: 'https://example.com' });
if (blocked.status !== 403) throw new Error('origin guard failed: ' + blocked.status);
const local = await call('/health', null, { origin: 'http://127.0.0.1:53716' });
if (local.status !== 200) throw new Error('local origin blocked');
if (local.acao !== 'http://127.0.0.1:53716') throw new Error('cors header missing');

const desktop = await call('/health', null, { origin: 'dsh-app://app' });
if (desktop.status !== 200) throw new Error('desktop origin blocked: ' + desktop.status);
if (desktop.acao !== 'dsh-app://app') throw new Error('desktop cors header missing');
const preflight = await fetch(base + '/warm', {
  method: 'OPTIONS',
  headers: {
    origin: 'dsh-app://app',
    'access-control-request-method': 'POST',
    'access-control-request-headers': 'content-type',
  },
});
if (preflight.status !== 204) throw new Error('desktop preflight failed: ' + preflight.status);
if (preflight.headers.get('access-control-allow-origin') !== 'dsh-app://app') throw new Error('desktop preflight cors missing');

const warm = await call('/warm', { id: 'fake' });
if (warm.json.state !== 'ready') throw new Error('warm failed: ' + JSON.stringify(warm.json));
const move = await call('/move', { id: 'fake', fen: 'startpos', moves: [], movetime: 100 });
if (move.json.bestmove !== 'e2e4') throw new Error('move failed: ' + JSON.stringify(move.json));
const stop = await call('/stop', { id: 'fake' });
if (stop.json.state !== 'stopped') throw new Error('stop failed');

const gomoku = await call('/move', {
  id: 'fakemoku', size: 15, color: 2, stones: [[7, 6, 1], [8, 8, 2]], level: 'easy',
});
if (gomoku.json.move !== '7,7') throw new Error('gomocup move failed: ' + JSON.stringify(gomoku.json));

const list = await call('/engines');
if (!list.json.engines.length) throw new Error('engine list empty');
if (list.json.engines[0].game !== 'xiangqi') throw new Error('engine metadata missing');
if (list.json.engines[0].label !== 'Fake USB') throw new Error('engine label missing');

await call('/warm', { id: 'fake' });
await new Promise((resolve) => setTimeout(resolve, 700));
const idle = await call('/engines');
if (idle.json.engines[0].state !== 'stopped') throw new Error('idle timeout failed: ' + JSON.stringify(idle.json));

const unknown = await call('/warm', { id: 'nope' });
if (unknown.status !== 404) throw new Error('unknown engine should 404');

side.close();
console.log('sidecar checks passed');
