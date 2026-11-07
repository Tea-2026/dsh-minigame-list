import readline from 'node:readline';

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  const text = line.trim();
  if (text === 'uci') {
    process.stdout.write('id name FakeEngine\nid author test\nuciok\n');
  } else if (text === 'isready') {
    process.stdout.write('readyok\n');
  } else if (text.startsWith('go')) {
    setTimeout(() => process.stdout.write('bestmove e2e4 ponder e7e5\n'), 10);
  } else if (text === 'quit') {
    process.exit(0);
  }
});
