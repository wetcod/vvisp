const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');
const { getAllFiles, printOrSilent } = require('@haechi-labs/vvisp-utils');
const { STATE_PATH } = require('../config/Constant');

module.exports = async function(files, options) {
  options = require('./utils/injectConfig')(options);

  if (options.allContract) {
    files = getAllFiles('./contracts', filePath => {
      return path.parse(filePath).ext === '.sol';
    });
  }

  try {
    if (files.length === 0) {
      analyzeOnChain(options);
    } else {
      analyzeOffChain(files, options);
    }
  } catch (error) {
    console.error(error);
    printRequirements();
  }
};

function analyzeOnChain(options) {
  const url = `${options.config.network_config.host}:${
    options.config.network_config.port
  }`;
  const vvispState = JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'));

  Object.keys(vvispState.contracts).forEach(contractName => {
    printOrSilent(chalk.bold(`Contract: ${contractName}`), options);

    const address = vvispState.contracts[contractName].address;
    const command = `docker run --network=host mythril/myth -xa ${address} --rpc ${url}`;
    const result = execSync(command, { stdio: 'pipe' }).toString();

    printOrSilent(result, options);
  });
}

function analyzeOffChain(files, options) {
  files.forEach(file => {
    printOrSilent(chalk.bold(`File: ${file}`), options);

    const dirName = path.dirname(path.resolve(file));
    const baseName = path.basename(file);

    const command = `docker run -v ${dirName}:/tmp mythril/myth -x tmp/${baseName}`;
    const result = execSync(command, { stdio: 'pipe' }).toString();

    printOrSilent(result, options);
  });
}

function printRequirements() {
  console.error('# docker must be installed');
  console.error("# docker's permission must be set properly");
  console.error('# mythril/myth must be pulled');
}
