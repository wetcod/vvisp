const { printOrSilent } = require('@haechi-labs/vvisp-utils');
const fs = require('fs');
const debugModule = require('debug');
const debug = debugModule('lib:commands:debug');
const Config = require('truffle-config');
const { CLIDebugger, Debugger } = require('./debug/debugger');
const Web3 = require('web3');

module.exports = async function(txHash) {
  printOrSilent('Starting VVISP Debugger...');

  const vvispState = JSON.parse(fs.readFileSync('./state.vvisp.json', 'utf-8'));
  const contracts = vvispState.contracts;
  const provider = new Web3(
    new Web3.providers.HttpProvider('http://localhost:8545')
  );
  //printOrSilent(contracts);
  //const files = contracts.Hello.fileName;

  //TODO: compiling your contracts 파일 넘기는 부분 수정
  return await new CLIDebugger({ contracts, provider }).run(txHash);

  //let bugger = await Debugger.forTx(txHash, { contracts, files, provider });
  //let session = bugger.connect();
  //await session.ready();

  printOrSilent('Debugging Finishied!');
};
