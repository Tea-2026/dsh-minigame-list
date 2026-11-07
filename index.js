/* Host half: load the engine catalogue and start the loopback sidecar.
 * The client discovers the service on 127.0.0.1:38651–38661. */
import { appendFileSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadManifest } from './lib/engine-store.mjs';
import { startSidecar } from './sidecar.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const LOG_LIMIT = 512 * 1024;

function createLogger(dir) {
  const enginesDir = join(dir, 'engines');
  const file = join(enginesDir, 'sidecar.log');
  try {
    mkdirSync(enginesDir, { recursive: true });
    if (existsSync(file) && statSync(file).size > LOG_LIMIT) writeFileSync(file, '');
  } catch (error) {
    /* a read-only install can still log to the console */
  }
  return (level, message, error) => {
    const detail = error ? ' :: ' + String((error && (error.stack || error.message)) || error) : '';
    if (level === 'error') console.error('[minigame]', message, error || '');
    else if (level === 'warn') console.warn('[minigame]', message, error || '');
    else console.log('[minigame]', message);
    try {
      appendFileSync(file, new Date().toISOString() + ' ' + level + ' ' + message + detail + '\n');
    } catch (writeError) {
      /* logging must never break the host */
    }
  };
}

export function apply(ctx) {
  const log = createLogger(here);
  const { engines, warnings } = loadManifest(here);
  for (const warning of warnings) log('warn', warning);
  log('info', 'engine catalogue: ' + (Object.keys(engines).join(', ') || 'empty'));

  let handle = null;
  let disposed = false;
  const boot = () => {
    startSidecar({ dir: here, engines, log }).then((started) => {
      if (disposed) {
        started.close();
        return;
      }
      handle = started;
    }).catch((error) => {
      log('error', 'engine sidecar did not start', error);
    });
  };

  if (ctx && typeof ctx.effect === 'function') {
    ctx.effect(() => {
      boot();
      return () => {
        disposed = true;
        if (handle) handle.close();
      };
    }, 'minigame: engine sidecar');
  } else {
    boot();
  }
}
