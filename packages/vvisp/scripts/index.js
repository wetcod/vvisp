const genScript = require('./gen-script');
const compile = require('./compile');
const deployService = require('./deploy-service');
const deployContract = require('./deploy-contract');
const init = require('./init');
const flatten = require('./flatten');
const debug = require('./debug');
const console = require('./console');
const showState = require('./show-state');
const test = require('./test');
const analyze = require('./analyze');
const ci = require('./ci');

module.exports = {
  genScript,
  compile,
  deployService,
  deployContract,
  init,
  flatten,
  debug,
  console,
  showState,
  test,
  analyze,
  ci
};
