import deasync from 'deasync';

// // ANSI escape codes:
// // - https://en.wikipedia.org/wiki/ANSI_escape_code
// // - https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797

/**
 * Read input form the console.
 * @param {string} question 
 * @returns {string} input
 */
export default function readline(question) {
  const previousRawMode = process.stdin.isRaw;
  process.stdin.setRawMode(true);

  let input = '', column = 0, eos = false;

  const onData = data => {
    const key = data.toString();

    if(data.length > 1) {
      switch(key) {
        case '\u001b[D': //left arrow
          if(column > 0) {
            column--;
            process.stdout.write('\x1b[1D');
          }
          break;
        case '\u001b[C': //right arrow
          if(column < input.length) {
            column++;
            process.stdout.write('\x1b[1C');
          }
          break;
      }
      return;
    }

    if(key === '\u0003') {
      print(question||'', input, column);
      process.stdin.off('data', onData);
      process.stdout.write('\x1b[91m^C\x1b[0m\n');
      process.stdin.setRawMode(previousRawMode);
      process.exit(130);
    }

    if(key === '\u000D') {
      eos = true;
      return;
    }

    if(key === '\u0008' || key === '\u00F8') {
      if(column > 0) column--;
      input = input.slice(0, column) + input.slice(column + 1);
      print(question||'', input, column);
      return;
    }
    
    input = input.slice(0, column) + key + input.slice(column);
    column += key.length;

    print(question||'', input, column);
  }

  if(typeof question === 'string') {
    process.stdout.write(question);
  }

  process.stdin.setEncoding('utf8');
  process.stdin.resume();
  process.stdin.on('data', onData);

  // This makes the whole thing syncrhonous..
  deasync.loopWhile(() => !eos);
  
  process.stdin.off('data', onData);
  process.stdin.setRawMode(previousRawMode);
  process.stdin.pause();

  process.stdout.write('\n');

  return input;
}

function print(question, input, column) {
  process.stdout.write(
    '\x1b[2K\x1b[0G' + question + input + 
    '\x1b['+(question.length + column + 1)+'G'
  );
}
