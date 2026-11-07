/* Engine catalogue and on-disk installs. Downloads go through the system curl
 * because the host runtime's fetch can be behind a corporate TLS interceptor.
 * Archives are unpacked with the platform tools (tar for zip, 7z for 7z). */
import { createHash } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import {
  createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, unlinkSync,
} from 'node:fs';
import { dirname, extname, join } from 'node:path';

const CURL = process.platform === 'win32' ? ['curl', '--ssl-no-revoke'] : ['curl'];
const API_TIMEOUT = 30000;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const DOWNLOAD_TIMEOUT = 1800000;
const ARCHIVE = /\.(7z|zip|tar\.gz|tgz|exe)$/i;

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
    if (!spec.protocol) warnings.push(id + ': missing protocol');
    if (spec.asset) {
      try {
        new RegExp(spec.asset);
      } catch (error) {
        warnings.push(id + ': invalid asset pattern');
      }
    }
    const dir = join(root, 'engines', id);
    const exeName = spec.exeName || 'engine.exe';
    const exeCandidates = Array.isArray(spec.exeCandidates) && spec.exeCandidates.length
      ? spec.exeCandidates
      : [exeName];
    engines[id] = Object.assign({}, spec, {
      dir,
      exeName,
      exeCandidates,
      exe: spec.exe || join(dir, exeCandidates[0]),
      levels: spec.levels || {},
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

function findFile(dir, test) {
  if (!existsSync(dir)) return '';
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch (error) {
      continue;
    }
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && test(entry.name, full)) return full;
    }
  }
  return '';
}

function dirSize(dir) {
  if (!existsSync(dir)) return 0;
  let total = 0;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch (error) {
      continue;
    }
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) {
        try {
          total += statSync(full).size;
        } catch (error) {
          /* file disappeared mid-scan */
        }
      }
    }
  }
  return total;
}

function find7z() {
  const candidates = ['7z', '7za', '7zr'];
  if (process.platform === 'win32') {
    const home = process.env.USERPROFILE || '';
    candidates.push(
      join(home, 'scoop', 'shims', '7z.exe'),
      'C:\\Program Files\\7-Zip\\7z.exe',
      'C:\\Program Files (x86)\\7-Zip\\7z.exe',
    );
  }
  for (const candidate of candidates) {
    try {
      execFileSync(candidate, ['i'], { stdio: 'ignore', timeout: 10000 });
      return candidate;
    } catch (error) {
      /* try the next one */
    }
  }
  const error = new Error('unpacking .7z needs 7z on PATH (install 7-Zip or add 7z.exe)');
  error.code = 'archive-tool-missing';
  throw error;
}

async function extractArchive(archive, file, dir) {
  if (archive === '7z') {
    const sevenZip = find7z();
    await run(sevenZip, ['x', '-y', '-o' + dir, file], { timeoutMs: DOWNLOAD_TIMEOUT });
    return;
  }
  if (process.platform === 'win32' || process.platform === 'darwin') {
    await run('tar', ['-xf', file, '-C', dir], { timeoutMs: DOWNLOAD_TIMEOUT });
  } else {
    await run('unzip', ['-o', file, '-d', dir], { timeoutMs: DOWNLOAD_TIMEOUT });
  }
}

export function createEngineStore(options) {
  const root = options.root;
  const engines = options.engines || {};
  const log = options.log || (() => {});
  const api = (path) => 'https://api.github.com' + path;

  const resolveExe = (id) => {
    const spec = engines[id];
    if (!spec) return '';
    if (spec.exe && existsSync(spec.exe)) return spec.exe;
    const candidates = spec.exeCandidates || [spec.exeName];
    for (const candidate of candidates) {
      const found = findFile(spec.dir, (name) => name.toLowerCase() === candidate.toLowerCase());
      if (found) {
        spec.exe = found;
        return found;
      }
    }
    return spec.exe;
  };

  const resolveModel = (id) => {
    const spec = engines[id];
    if (!spec || !spec.model) return '';
    const found = findFile(spec.dir, (name) => /\.(bin|txt)\.gz$/i.test(name));
    if (found) spec.modelPath = found;
    return spec.modelPath || '';
  };

  const installed = (id) => {
    const file = resolveExe(id);
    if (!file || !existsSync(file)) return { installed: false, bytes: 0 };
    try {
      return { installed: true, bytes: dirSize(engines[id].dir) || statSync(file).size };
    } catch (error) {
      return { installed: false, bytes: 0 };
    }
  };

  const releaseFor = async (spec) => {
    const headers = ['-sL', '-H', 'user-agent: dsh-minigame-list'];
    const fetchRelease = async (path) => JSON.parse(await curl([...headers, api(path)], { capture: true, timeoutMs: API_TIMEOUT }));
    let candidates = [];
    if (spec.releaseTag) candidates = [await fetchRelease('/repos/' + spec.repo + '/releases/tags/' + spec.releaseTag)];
    else {
      candidates = [await fetchRelease('/repos/' + spec.repo + '/releases/latest')];
      const pattern = new RegExp(spec.asset || 'x86[_-]64.*\\.exe$', 'i');
      if (!(candidates[0].assets || []).some((asset) => pattern.test(asset.name))) {
        candidates = await fetchRelease('/repos/' + spec.repo + '/releases?per_page=30');
      }
    }
    const pattern = new RegExp(spec.asset || 'x86[_-]64.*\\.exe$', 'i');
    for (const release of candidates) {
      const asset = (release.assets || []).find((item) => pattern.test(item.name));
      if (asset) return { release, asset };
    }
    const error = new Error('no release asset matches ' + pattern);
    error.code = 'asset-not-found';
    throw error;
  };

  const downloadAsset = async (asset, target) => {
    const args = ['-sL', '--fail', '-A', UA, '-H', 'Accept: application/octet-stream', '-o', target];
    if (asset.digest && /^sha256:/i.test(asset.digest)) {
      args.push('--fail');
    }
    const url = asset.url || asset.browser_download_url;
    await curl([...args, url], { timeoutMs: DOWNLOAD_TIMEOUT });
    if (!existsSync(target) || statSync(target).size === 0) throw new Error('download produced an empty file');
    if (asset.digest && /^sha256:/i.test(asset.digest)) {
      const expected = asset.digest.split(':')[1].toLowerCase();
      const actual = await sha256(target);
      if (actual !== expected) throw new Error('sha256 mismatch for ' + asset.name);
    }
  };

  const install = async (id) => {
    const spec = engines[id];
    if (!spec || !spec.repo) {
      const error = new Error('engine ' + id + ' is not downloadable');
      error.code = 'not-installable';
      throw error;
    }
    const dir = spec.dir;
    mkdirSync(dir, { recursive: true });
    const { release, asset } = await releaseFor(spec);
    log('info', 'engine ' + id + ' downloading ' + asset.name);
    const suffix = extname(asset.name);
    const temp = join(dir, 'download' + suffix);
    try {
      await downloadAsset(asset, temp);
      const archive = (spec.archive || '').toLowerCase();
      const implied = /\.7z$/i.test(asset.name) ? '7z' : (/\.zip$/i.test(asset.name) ? 'zip' : '');
      const kind = archive || implied;
      if (kind) {
        await extractArchive(kind, temp, dir);
        unlinkSync(temp);
      } else {
        const target = join(dir, spec.exeName);
        renameSync(temp, target);
      }
      if (spec.model && spec.model.url) {
        const modelTemp = join(dir, 'model' + extname(spec.model.url));
        log('info', 'engine ' + id + ' downloading model');
        await curl(['-sL', '--fail', '-A', UA, '-o', modelTemp, spec.model.url], { timeoutMs: DOWNLOAD_TIMEOUT });
        if (/\.zip$/i.test(spec.model.url) || spec.model.archive === 'zip') {
          mkdirSync(join(dir, 'model'), { recursive: true });
          await extractArchive('zip', modelTemp, join(dir, 'model'));
          unlinkSync(modelTemp);
        } else {
          renameSync(modelTemp, join(dir, spec.model.nameHint || 'model.bin.gz'));
        }
        resolveModel(id);
      }
      const exe = resolveExe(id);
      if (!exe || !existsSync(exe)) {
        const error = new Error('engine executable not found after unpacking');
        error.code = 'exe-not-found';
        throw error;
      }
      const bytes = statSync(exe).size;
      log('info', 'engine ' + id + ' installed ' + exe + ' (' + bytes + ' bytes, ' + release.tag_name + ')');
      return { id, bytes, tag: release.tag_name, name: asset.name, exe: exe.slice(dir.length + 1) };
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
    rmSync(engines[id].dir, { recursive: true, force: true });
    engines[id].exe = join(engines[id].dir, engines[id].exeName);
    engines[id].modelPath = '';
    log('info', 'engine ' + id + ' removed');
    return { id, installed: false };
  };

  const argsFor = (id) => {
    const spec = engines[id];
    if (!spec) return [];
    const model = resolveModel(id);
    return (spec.args || []).map((arg) => String(arg)
      .replace('{dir}', spec.dir)
      .replace('{model}', model)
      .replace('{exe}', resolveExe(id)));
  };

  return { installed, install, remove, resolveExe, resolveModel, argsFor, engineDir: (id) => engines[id].dir };
}
