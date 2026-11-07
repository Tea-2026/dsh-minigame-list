/* Minimal Gomocup engine for protocol tests: answers BEGIN with 7,7. */
process.stdin.setEncoding('utf8');
let buffer = '';
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  let index = buffer.indexOf('\n');
  while (index >= 0) {
    const line = buffer.slice(0, index).trim();
    buffer = buffer.slice(index + 1);
    if (line === 'BEGIN') process.stdout.write('7,7\n');
    else if (line === 'ABOUT') process.stdout.write('name="fake-gomocup"\n');
    index = buffer.indexOf('\n');
  }
});
