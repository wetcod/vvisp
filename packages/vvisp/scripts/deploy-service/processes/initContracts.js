module.exports = async function(deployState, options) {
  const path = require('path');
  const { INITIALIZE, PRIVATE_KEY, TX_OPTIONS } = require('../constants');
  const {
    forIn,
    getContractFactory,
    getTxCount,
    printOrSilent,
    sendTx
  } = require('@haechi-labs/vvisp-utils');

  const { compileOutput, targets } = deployState;
  let stateClone = deployState.getState();

  const contracts = [];
  forIn(targets, (contract, name) => {
    contracts.push({ name: name, contract: contract });
  });

  if (contracts.length === 0) {
    return;
  }

  printOrSilent(chalk.head(`\tStart Initialize Contracts...`), options);

  const startCount = await getTxCount(PRIVATE_KEY, options);
  let txCount = startCount;

  for (let i = 0; i < contracts.length; i++) {
    const { contract, name } = contracts[i];
    const stateContract = stateClone.contracts[name];

    if (!stateContract.pending) {
      continue;
    }
    const initialize = stateContract[INITIALIZE];
    if (initialize && initialize.functionName) {
      const instancePath = path.join('./', contract.path);
      const contractName = contract.name;
      const Contract = getContractFactory(options);
      const abi =
        compileOutput.contracts[instancePath + ':' + contractName].interface;

      const instance = new Contract(JSON.parse(abi));
      const initData = instance.methods[initialize.functionName](
        ...initialize.arguments
      ).encodeABI();
      printOrSilent(`Initializing ${contractName}...`, options);
      const receipt = await sendTx(stateContract.address, 0, PRIVATE_KEY, {
        ...options,
        ...TX_OPTIONS,
        txCount: txCount,
        data: initData
      });
      txCount++;
      printOrSilent(
        `${chalk.success('Done')} Transaction Hash: ${chalk.tx(
          receipt.transactionHash
        )}\n`,
        options
      );
    }
    delete stateContract.pending;
    stateClone = deployState.updateState(stateClone).getState();
  }
  if (startCount === txCount) {
    printOrSilent('Nothing to initialize!\n', options);
  }
};
