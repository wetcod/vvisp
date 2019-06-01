const { debug } = require('../scripts');

const name = 'debug';
const signature = `${name} <txHash>`;
const description = 'debug the smart contract';

const register = commander =>
  commander
    .command(signature, { noHelp: true })
    .usage('<txHash>')
    .description(description)
    .action(debug)
    .addCustomConfigOption();

module.exports = { name, signature, description, register, debug };
