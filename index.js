/* Host half: starts the local engine sidecar. The Client UI discovers it on
 * 127.0.0.1 (ports 38651..38661) and drives engine install/warm/stop over HTTP. */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startSidecar } from './sidecar.mjs';

const here = dirname(fileURLToPath(import.meta.url));

function loadManifest() {
  const file = join(here, 'engines.json');
  if (!existsSync(file)) return {};
  try {
    const raw = JSON.parse(readFileSync(file, 'utf8'));
    const engines = {};
    for (const [id, spec] of Object.entries(raw.engines || {})) {
      engines[id] = { ...spec, exe: join(here, 'engines', id, 'engine.exe') };
    }
    return engines;
  } catch (error) {
    console.error('[minigame] bad engines.json', error);
    return {};
  }
}

export function apply() {
  startSidecar({ dir: here, engines: loadManifest() })
    .then(({ port }) => {
      console.log('[minigame] engine sidecar listening on 127.0.0.1:' + port);
    })
    .catch((error) => {
      console.error('[minigame] engine sidecar failed', error);
    });
}
