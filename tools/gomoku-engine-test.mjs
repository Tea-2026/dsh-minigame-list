/* Real Rapfi path: install (7z, ~37 MB), warm over Gomocup, play one move.
 * Slow on purpose: it exercises the GitHub asset download and 7z extraction. */
import { loadManifest } from '../lib/engine-store.mjs';
import { startSidecar } from '../sidecar.mjs';

const { engines, warnings } = loadManifest(process.cwd());
for (const warning of warnings) console.warn('warning:', warning);
if (!engines.gomoku) throw new Error('gomoku engine missing from engines.json');

const side = await startSidecar({
  port: 38693,
  idleMs: 600000,
  engines,
  log: (level, message, error) => console.log('[side]', level, message, error && error.message ? error.message : ''),
});
const base = 'http://127.0.0.1:' + side.port;
const call = async (path, body) => {
  const res = await fetch(base + path, body
    ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }
    : undefined);
  return { status: res.status, json: await res.json() };
};

try {
  const install = await call('/install', { id: 'gomoku' });
  if (install.status !== 200) throw new Error('install failed: ' + JSON.stringify(install));
  console.log('installed', JSON.stringify(install.json));
  const warm = await call('/warm', { id: 'gomoku' });
  if (warm.json.state !== 'ready') throw new Error('warm failed: ' + JSON.stringify(warm.json));
  const move = await call('/move', {
    id: 'gomoku', size: 15, color: 2, stones: [[7, 7, 1], [7, 8, 2]], level: 'easy',
  });
  if (!/^\d+,\d+$/.test(move.json.move || '')) throw new Error('bad move: ' + JSON.stringify(move.json));
  console.log('gomoku engine checks passed', move.json.move);
} finally {
  await side.close();
}
