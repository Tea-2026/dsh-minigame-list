import { readFileSync } from 'node:fs';
import { loadManifest } from '../lib/engine-store.mjs';
import { startSidecar } from '../sidecar.mjs';

const { engines } = loadManifest(process.cwd());
const side = await startSidecar({ port: 38693, idleMs: 600000, dir: process.cwd(), engines });
const base = 'http://127.0.0.1:' + side.port;
const post = async (path, body) => (await fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })).json();

const rows = ['rnbakabnr', '.........', '.c.....c.', 'p.p.p.p.p', '.........', '.........', 'P.P.P.P.P', '.C.....C.', '.........', 'RNBAKABNR'];
const board = rows.join('').split('').map((c) => (c === '.' ? '' : c));
const fen = rows.join('/') + ' b - - 0 1';
const move = await post('/move', { id: 'xiangqi', fen, movetime: 500 });
console.log('fen', fen, 'bestmove', move.bestmove);
const m = /^([a-i])([0-9])([a-i])([0-9])/.exec(move.bestmove || '');
if (!m) throw new Error('bad move format');
const from = (9 - Number(m[2])) * 9 + (m[1].charCodeAt(0) - 97);
const to = (9 - Number(m[4])) * 9 + (m[3].charCodeAt(0) - 97);
console.log('from', from, board[from], 'to', to, board[to] || 'empty');
if (!board[from] || board[from] === board[from].toUpperCase()) throw new Error('engine moved a non-black piece');
side.close();
console.log('xiangqi fen mapping ok');
