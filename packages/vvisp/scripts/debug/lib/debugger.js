const debugModule = require('debug');
const expect = require('truffle-expect');
const Session = require('./session');
const { createNestedSelector } = require('reselect-tree');
const dataSelector = require('./data/selectors');
const astSelector = require('./ast/selectors');
const traceSelector = require('./trace/selectors');
const evmSelector = require('./evm/selectors');
const soliditySelector = require('./solidity/selectors');
const sessionSelector = require('./session/selectors');
const controllerSelector = require('./controller/selectors');
const debug = debugModule('debugger');

class Debugger {
  constructor(session) {
    this._session = session;
  }

  static async forTx(txHash, options = {}) {
    expect.options(options, ['contracts', 'provider']);

    let session = new Session(
      options.contracts,
      options.files,
      txHash,
      options.provider
    );

    try {
      await session.ready();
    } catch (e) {
      throw e;
    }

    return new this(session);
  }

  connect() {
    return this._session;
  }

  static get selectors() {
    return createNestedSelector({
      ast: astSelector,
      data: dataSelector,
      trace: traceSelector,
      evm: evmSelector,
      solidity: soliditySelector,
      session: sessionSelector,
      controller: controllerSelector
    });
  }
}

/**
 * @typedef {Object} Contract
 * @property {string} contractName contract name
 * @property {string} source solidity source code
 * @property {string} sourcePath path to source file
 * @property {string} binary 0x-prefixed hex string with create bytecode
 * @property {string} sourceMap solidity source map for create bytecode
 * @property {Object} ast Abstract Syntax Tree from Solidity
 * @property {string} deployedBinary 0x-prefixed compiled binary (on chain)
 * @property {string} deployedSourceMap solidity source map for on-chain bytecode
 */

module.exports = Debugger;
