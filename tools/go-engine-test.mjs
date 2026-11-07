/* Real KataGo path: install (zip + model), warm over GTP, play one move. */
import { loadManifest } from '../lib/engine-store.mjs';
import { startSidecar } from '../sidecar.mjs';

const { engines, warnings } = loadManifest(process.cwd());
for (const warning of warnings) console.warn('warning:', warning);
if (!engines.go) throw new Error('go engine missing from engines.json');

const side = await startSidecar({
  port: 38694,
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
  const install = await call('/install', { id: 'go' });
  if (!install.json.installed && install.status !== 200) throw new Error('install failed: ' + JSON.stringify(install));
  console.log('installed', JSON.stringify(install.json).slice(0, 300));

  const warm = await call('/warm', { id: 'go' });
  if (warm.json.state !== 'ready') throw new Error('warm failed: ' + JSON.stringify(warm.json));
  console.log('warm ok');

  const move = await call('/move', {
    id: 'go',
    size: 13,
    komi: 6.5,
    color: 2,
    stones: [[3, 3, 1], [4, 4, 2], [9, 9, 1]],
    level: 'easy',
  });
  console.log('move', JSON.stringify(move.json));
  if (!/^[A-M][1-9]$|^[A-M]1[0-3]$|^(pass|resign)$/i.test(move.json.move || '')) {
    throw new Error('unexpected GTP move: ' + JSON.stringify(move.json));
  }
  console.log('go engine checks passed');
} finally {
  await side.close();
}
