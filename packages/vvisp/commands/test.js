const { test } = require('../scripts');

const name = 'test';
const signature = `${name} [testfile...]`;
const description = 'smart contract test coverage';

const register = commander =>
  commander
    .command(signature, { noHelp: true })
    .usage('[options]')
//    .option('-S, --source <file>', 'the original contract source file') //TO DO: ehter scan option?
    .description(description)
    .action(test);
module.exports = { name, signature, description, register, test };
