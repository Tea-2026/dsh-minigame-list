import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadManifest } from '../lib/engine-store.mjs';
import { startSidecar } from '../sidecar.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'client.js'), 'utf8');
const logic = src.slice(src.indexOf('const XQ_W = 9;'), src.indexOf('/* ---- Go ---- */'));
const ai = src.slice(src.indexOf('const XQ_SETTINGS_KEY'), src.indexOf('function XiangqiGame('));
const xq = vm.runInNewContext(
  logic + ai + '\n;({ xqNew, xqFen, xqUciMove, xqLegalMoves, xqColor })',
  { Math, Object, Array, Set },
);

const { engines, warnings } = loadManifest(root);
for (const warning of warnings) console.warn('warning:', warning);
if (!engines.xiangqi) throw new Error('xiangqi engine missing from engines.json');

const side = await startSidecar({
  port: 38699,
  idleMs: 600000,
  dir: root,
  engines,
  log: (level, message, error) => console.log('[side]', level, message, error && error.message ? error.message : ''),
});
const base = 'http://127.0.0.1:' + side.port;
const post = async (pathname, body) => {
  const res = await fetch(base + pathname, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error || 'HTTP ' + res.status);
  return json;
};

try {
  let board = xq.xqNew();
  let color = 'b';
  for (let ply = 0; ply < 8; ply += 1) {
    const fen = xq.xqFen(board, color);
    const result = await post('/move', { id: 'xiangqi', fen, level: 'easy' });
    const best = result.bestmove || result.move;
    const move = xq.xqUciMove(best);
    if (!move) throw new Error('unparseable engine move: ' + best);
    if (!board[move.from] || xq.xqColor(board[move.from]) !== color) {
      throw new Error('engine moved a piece that is not ' + color + ': ' + best);
    }
    if (!xq.xqLegalMoves(board, move.from).includes(move.to)) {
      throw new Error('engine move is not legal: ' + best);
    }
    console.log('ply', ply, color, 'engine', best, '->', move);
    board = board.slice();
    board[move.to] = board[move.from];
    board[move.from] = '';
    color = color === 'r' ? 'b' : 'r';
  }
  console.log('xiangqi engine checks passed');
} finally {
  await side.close();
}
