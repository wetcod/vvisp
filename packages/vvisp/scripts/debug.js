module.exports = async function(files, options) {
  // from truffle-core/lib/commands/debug.js
  options = require('./utils/injectConfig')(options);
  debug = require('./debug/debugger');

  const { printOrSilent } = require('@haechi-labs/vvisp-utils');

  const debugModule = require("debug");
  const debug = debugModule("scripts:debug");

  const Config = require('./utils/injectConfig')(options);
  const Environment = require("../environment");

  const { CLIDebugger } = require("../debug");

  const config = Config.detect(options);
  await Environment.detect(config);

  const txHash = config._[0]; //may be undefined
  return await new CLIDebugger(config).run(txHash);
  printOrSilent('Debugging . . . ', options);
};
