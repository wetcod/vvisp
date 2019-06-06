const { printOrSilent } = require('@haechi-labs/vvisp-utils');
const fs = require('fs');
const Config = require('truffle-config');
const Web3 = require('web3');
//Method 1:
const debugModule = require('debug');
const debug = debugModule('lib:commands:debug');
const { CLIDebugger, Debugger } = require('./debug/debugger');
const Environment = require('./environment');

//temp:
//const { Debugger } = require("truffle-debugger");

var config = Config.detect();

module.exports = async function(txHash) {
  const vvispState = JSON.parse(fs.readFileSync('./state.vvisp.json', 'utf-8'));
  const contracts = vvispState.contracts;
  const provider = new Web3(
    new Web3.providers.HttpProvider(
      'http://' +
        config._values.networks.ganache.host +
        ':' +
        config._values.networks.ganache.port
    )
  );

  // Method 1

  Promise.resolve()
    .then(async () => {
      const config = Config.detect();
      await Environment.detect(config);
      return await new CLIDebugger(config).run(txHash);
    })
    .then(interpreter => interpreter.start());
  /* // forTx 요소
  return Debugger.forTx(txHash, {
            provider: config.provider,
            files: result.files,
            contracts: Object.keys(result.contracts).map(function(name) {
              var contract = result.contracts[name];
              return {
                contractName: contract.contractName || contract.contract_name,
                source: contract.source,
                sourcePath: contract.sourcePath,
                ast: contract.ast,
                binary: contract.binary || contract.bytecode,
                sourceMap: contract.sourceMap,
                deployedBinary: contract.deployedBinary || contract.deployedBytecode,
                deployedSourceMap: contract.deployedSourceMap
              };
            })
  */

  /*
  // Method 2
  contracts = ['vvispState.serviceName'];
 
  let bugger = await Debugger
    .forTx(txHash, { contracts, provider });
  
  let session = bugger.connect();
    //await session.ready();
  */
  printOrSilent('Debugging Finishied!');
};
