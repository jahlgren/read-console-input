const readline = require('readline');

/**
 * Read input form the console.
 * @param {string} question 
 * @returns {string} input
 */
export default function readline(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  let input;
  rl.question(question, (answer) => {
    input = answer;
    rl.close();
  });
  require('deasync').loopWhile(() => typeof input === 'undefined');
  return input;
}
