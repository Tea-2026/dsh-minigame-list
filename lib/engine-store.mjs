/* Engine catalogue and on-disk installs. Downloads go through the system curl
 * because the host runtime's fetch can be behind a corporate TLS interceptor. */
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import {
  createReadStream, existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, unlinkSync,
} from 'node:fs';
import { join } from 'node:path';

const CURL = process.platform === 'win32' ? ['curl', '--ssl-no-revoke'] : ['curl'];
const API_TIMEOUT = 30000;
const DOWNLOAD_TIMEOUT = 300000;
const ARCHIVE = /\.(7z|zip|tar\.gz|tgz)$/i;

export function loadManifest(root, file) {
  const manifest = file || join(root, 'engines.json');
  const warnings = [];
  if (!existsSync(manifest)) {
    return { engines: {}, warnings: ['engines.json not found'] };
  }
  let raw;
  try {
    raw = JSON.parse(readFileSync(manifest, 'utf8'));
  } catch (error) {
    return { engines: {}, warnings: ['engines.json is not valid JSON: ' + error.message] };
  }
  const engines = {};
  for (const [id, spec] of Object.entries(raw.engines || {})) {
    if (!spec || typeof spec !== 'object') {
      warnings.push(id + ': engine spec is not an object');
      continue;
    }
    if (!spec.game) warnings.push(id + ': missing game');
    if (spec.asset) {
      try {
        new RegExp(spec.asset);
      } catch (error) {
        warnings.push(id + ': invalid asset pattern');
      }
    }
    engines[id] = Object.assign({}, spec, {
      exe: spec.exe || join(root, 'engines', id, 'engine.exe'),
    });
  }
  return { engines, warnings };
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    let child;
    try {
      child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (error) {
      reject(error);
      return;
    }
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      if (options.capture) stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    const timer = setTimeout(() => {
      try {
        child.kill();
      } catch (error) {
        /* already gone */
      }
      reject(new Error(command + ' timed out'));
    }, options.timeoutMs || API_TIMEOUT);
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(stdout);
      else reject(new Error(String(stderr).trim() || command + ' exited with code ' + code));
    });
  });
}

function curl(args, options) {
  return run(CURL[0], [...CURL.slice(1), ...args], options);
}

function sha256(file) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(file);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

export function createEngineStore(options) {
  const root = options.root;
  const engines = options.engines || {};
  const log = options.log || (() => {});
  const engineDir = (id) => join(root, 'engines', id);
  const engineExe = (id) => {
    const spec = engines[id];
    return (spec && spec.exe) || join(engineDir(id), 'engine.exe');
  };

  const installed = (id) => {
    const file = engineExe(id);
    if (!existsSync(file)) return { installed: false, bytes: 0 };
    try {
      return { installed: true, bytes: statSync(file).size };
    } catch (error) {
      return { installed: false, bytes: 0 };
    }
  };

  const install = async (id) => {
    const spec = engines[id];
    if (!spec || !spec.repo) {
      const error = new Error('engine ' + id + ' is not downloadable');
      error.code = 'not-installable';
      throw error;
    }
    const dir = engineDir(id);
    mkdirSync(dir, { recursive: true });
    const release = JSON.parse(await curl([
      '-sL', '-H', 'user-agent: dsh-minigame-list',
      'https://api.github.com/repos/' + spec.repo + '/releases/latest',
    ], { capture: true, timeoutMs: API_TIMEOUT }));
    const pattern = new RegExp(spec.asset || 'x86[_-]64.*\\.exe$', 'i');
    const asset = (release.assets || []).find((item) => pattern.test(item.name));
    if (!asset) {
      const error = new Error('no release asset matches ' + pattern);
      error.code = 'asset-not-found';
      throw error;
    }
    if (ARCHIVE.test(asset.name)) {
      const error = new Error('archive assets are not unpacked yet: ' + asset.name);
      error.code = 'archive-unsupported';
      throw error;
    }
    const target = engineExe(id);
    const temp = target + '.download';
    log('info', 'engine ' + id + ' downloading ' + asset.name);
    try {
      await curl(['-sL', '-o', temp, asset.browser_download_url], { timeoutMs: DOWNLOAD_TIMEOUT });
      const bytes = statSync(temp).size;
      if (!bytes) throw new Error('download produced an empty file');
      if (asset.digest && /^sha256:/i.test(asset.digest)) {
        const expected = asset.digest.split(':')[1].toLowerCase();
        const actual = await sha256(temp);
        if (actual !== expected) throw new Error('sha256 mismatch for ' + asset.name);
      }
      renameSync(temp, target);
      log('info', 'engine ' + id + ' installed ' + bytes + ' bytes (' + release.tag_name + ')');
      return { id, bytes, tag: release.tag_name, name: asset.name };
    } catch (error) {
      try {
        unlinkSync(temp);
      } catch (cleanup) {
        /* no temp file */
      }
      throw error;
    }
  };

  const remove = async (id) => {
    rmSync(engineDir(id), { recursive: true, force: true });
    log('info', 'engine ' + id + ' removed');
    return { id, installed: false };
  };

  return { installed, install, remove, engineExe };
}
