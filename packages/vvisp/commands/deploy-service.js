const { deployService } = require('../scripts');

const name = 'deploy-service';
const signature = `${name}`;
const description =
  'deploy or upgrade smart contract service using the deployment configure file';

const register = commander =>
  commander
    .command(signature, { noHelp: true })
    .usage('[options]')
    .option(
      '-f, --force',
      'force deploying, it removes current state.vvisp.json'
    )
    .description(description)
    .action((...args) => {
      deployService(...args).catch(e => console.log(e));
    })
    .addNetworkOption()
    .addSilentOption();

module.exports = { name, signature, description, register, deployService };
