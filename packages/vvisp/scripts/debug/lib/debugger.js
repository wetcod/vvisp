'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ('value' in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _truffleExpect = require('truffle-expect');

var _truffleExpect2 = _interopRequireDefault(_truffleExpect);

var _session = require('./session');

var _session2 = _interopRequireDefault(_session);

var _reselectTree = require('reselect-tree');

var _selectors = require('./data/selectors');

var _selectors2 = _interopRequireDefault(_selectors);

var _selectors3 = require('./ast/selectors');

var _selectors4 = _interopRequireDefault(_selectors3);

var _selectors5 = require('./trace/selectors');

var _selectors6 = _interopRequireDefault(_selectors5);

var _selectors7 = require('./evm/selectors');

var _selectors8 = _interopRequireDefault(_selectors7);

var _selectors9 = require('./solidity/selectors');

var _selectors10 = _interopRequireDefault(_selectors9);

var _selectors11 = require('./session/selectors');

var _selectors12 = _interopRequireDefault(_selectors11);

var _selectors13 = require('./controller/selectors');

var _selectors14 = _interopRequireDefault(_selectors13);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _asyncToGenerator(fn) {
  return function() {
    var gen = fn.apply(this, arguments);
    return new Promise(function(resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }
        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(
            function(value) {
              step('next', value);
            },
            function(err) {
              step('throw', err);
            }
          );
        }
      }
      return step('next');
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var debug = (0, _debug2.default)('debugger');

/**
 * @example
 * let session = Debugger
 *   .forTx(<txHash>, {
 *     contracts: [<contract obj>, ...],
 *     provider: <provider instance>
 *   })
 *   .connect();
 */
var Debugger = (function() {
  /**
   * @param {Session} session - debugger session
   * @private
   */
  function Debugger(session) {
    _classCallCheck(this, Debugger);

    /**
     * @private
     */
    this._session = session;
  }

  /**
   * Instantiates a Debugger for a given transaction hash.
   *
   * @param {String} txHash - transaction hash with leading "0x"
   * @param {{contracts: Array<Contract>, files: Array<String>, provider: Web3Provider}} options -
   * @return {Debugger} instance
   */

  _createClass(
    Debugger,
    [
      {
        key: 'connect',

        /**
         * Connects to the instantiated Debugger.
         *
         * @return {Session} session instance
         */
        value: function connect() {
          return this._session;
        }

        /**
         * Exported selectors
         *
         * See individual selector docs for full listing
         *
         * @example
         * Debugger.selectors.ast.current.tree
         *
         * @example
         * Debugger.selectors.solidity.current.instruction
         *
         * @example
         * Debugger.selectors.trace.steps
         */
      }
    ],
    [
      {
        key: 'forTx',
        value: (function() {
          var _ref = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee(txHash) {
              var options =
                arguments.length > 1 && arguments[1] !== undefined
                  ? arguments[1]
                  : {};
              var session;
              return regeneratorRuntime.wrap(
                function _callee$(_context) {
                  while (1) {
                    switch ((_context.prev = _context.next)) {
                      case 0:
                        _truffleExpect2.default.options(options, [
                          'contracts',
                          'provider'
                        ]);

                        session = new _session2.default(
                          options.contracts,
                          options.files,
                          options.provider,
                          txHash
                        );
                        _context.prev = 2;
                        _context.next = 5;
                        return session.ready();

                      case 5:
                        debug('session ready');
                        _context.next = 12;
                        break;

                      case 8:
                        _context.prev = 8;
                        _context.t0 = _context['catch'](2);

                        debug('error occurred, unloaded');
                        session.unload();

                      case 12:
                        return _context.abrupt('return', new this(session));

                      case 13:
                      case 'end':
                        return _context.stop();
                    }
                  }
                },
                _callee,
                this,
                [[2, 8]]
              );
            })
          );

          function forTx(_x2) {
            return _ref.apply(this, arguments);
          }

          return forTx;
        })()

        /*
         * Instantiates a Debugger for a given project (with no transaction loaded)
         *
         * @param {{contracts: Array<Contract>, files: Array<String>, provider: Web3Provider}} options -
         * @return {Debugger} instance
         */
      },
      {
        key: 'forProject',
        value: (function() {
          var _ref2 = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee2() {
              var options =
                arguments.length > 0 && arguments[0] !== undefined
                  ? arguments[0]
                  : {};
              var session;
              return regeneratorRuntime.wrap(
                function _callee2$(_context2) {
                  while (1) {
                    switch ((_context2.prev = _context2.next)) {
                      case 0:
                        _truffleExpect2.default.options(options, [
                          'contracts',
                          'provider'
                        ]);

                        session = new _session2.default(
                          options.contracts,
                          options.files,
                          options.provider
                        );
                        _context2.next = 4;
                        return session.ready();

                      case 4:
                        return _context2.abrupt('return', new this(session));

                      case 5:
                      case 'end':
                        return _context2.stop();
                    }
                  }
                },
                _callee2,
                this
              );
            })
          );

          function forProject() {
            return _ref2.apply(this, arguments);
          }

          return forProject;
        })()
      },
      {
        key: 'selectors',
        get: function get() {
          return (0, _reselectTree.createNestedSelector)({
            ast: _selectors4.default,
            data: _selectors2.default,
            trace: _selectors6.default,
            evm: _selectors8.default,
            solidity: _selectors10.default,
            session: _selectors12.default,
            controller: _selectors14.default
          });
        }
      }
    ]
  );

  return Debugger;
})();

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

exports.default = Debugger;
