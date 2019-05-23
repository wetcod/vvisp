module.exports = async function(files, options) {
  options = require('./utils/injectConfig')(options);
  debug = require('./debug/debugger');

  const { printOrSilent } = require('@haechi-labs/vvisp-utils');

  const command = {
    command: "debug",
    description:
      "Interactively debug any transaction on the blockchain (exp)",
    builder: {
      _: {
        type: "string"
      }
    },
    help: {
      usage: "vvisp debug [<transaction_hash>]",
      options: [
        {
          option: "<transaction_hash>",
          description: "Transaction ID to use for debugging."
        }
      ]
    },
    run: function(options, done) {
      const debugModule = require("debug");
      const debug = debugModule("scripts:debug");

      const Config = require('./utils/injectConfig')(options);
      const Environment = require("../environment");

      const { CLIDebugger } = require("../debug");

      Promise.resolve()
        .then(async () => {
          const config = Config.detect(options);
          await Environment.detect(config);

          const txHash = config._[0]; //may be undefined
          return await new CLIDebugger(config).run(txHash);
        })
        .then(interpreter => interpreter.start(done))
        .catch(done);
    }
  };
  printOrSilent('Debugging . . . ', options);
};
