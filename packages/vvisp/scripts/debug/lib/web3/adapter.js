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

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

var _util = require('util');

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

var debug = (0, _debug2.default)('debugger:web3:adapter');

var Web3Adapter = (function() {
  function Web3Adapter(provider) {
    _classCallCheck(this, Web3Adapter);

    this.web3 = new _web2.default(provider);
  }

  _createClass(Web3Adapter, [
    {
      key: 'getTrace',
      value: (function() {
        var _ref = _asyncToGenerator(
          /*#__PURE__*/ regeneratorRuntime.mark(function _callee(txHash) {
            var result;
            return regeneratorRuntime.wrap(
              function _callee$(_context) {
                while (1) {
                  switch ((_context.prev = _context.next)) {
                    case 0:
                      _context.next = 2;
                      return (0, _util.promisify)(
                        this.web3.currentProvider.send
                      )(
                        //send *only* uses callbacks, so we use promsifiy to make things more
                        //readable
                        {
                          jsonrpc: '2.0',
                          method: 'debug_traceTransaction',
                          params: [txHash, {}],
                          id: new Date().getTime()
                        }
                      );

                    case 2:
                      result = _context.sent;

                      if (!result.error) {
                        _context.next = 7;
                        break;
                      }

                      throw new Error(result.error.message);

                    case 7:
                      return _context.abrupt(
                        'return',
                        result.result.structLogs
                      );

                    case 8:
                    case 'end':
                      return _context.stop();
                  }
                }
              },
              _callee,
              this
            );
          })
        );

        function getTrace(_x) {
          return _ref.apply(this, arguments);
        }

        return getTrace;
      })()
    },
    {
      key: 'getTransaction',
      value: (function() {
        var _ref2 = _asyncToGenerator(
          /*#__PURE__*/ regeneratorRuntime.mark(function _callee2(txHash) {
            return regeneratorRuntime.wrap(
              function _callee2$(_context2) {
                while (1) {
                  switch ((_context2.prev = _context2.next)) {
                    case 0:
                      _context2.next = 2;
                      return this.web3.eth.getTransaction(txHash);

                    case 2:
                      return _context2.abrupt('return', _context2.sent);

                    case 3:
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

        function getTransaction(_x2) {
          return _ref2.apply(this, arguments);
        }

        return getTransaction;
      })()
    },
    {
      key: 'getReceipt',
      value: (function() {
        var _ref3 = _asyncToGenerator(
          /*#__PURE__*/ regeneratorRuntime.mark(function _callee3(txHash) {
            return regeneratorRuntime.wrap(
              function _callee3$(_context3) {
                while (1) {
                  switch ((_context3.prev = _context3.next)) {
                    case 0:
                      _context3.next = 2;
                      return this.web3.eth.getTransactionReceipt(txHash);

                    case 2:
                      return _context3.abrupt('return', _context3.sent);

                    case 3:
                    case 'end':
                      return _context3.stop();
                  }
                }
              },
              _callee3,
              this
            );
          })
        );

        function getReceipt(_x3) {
          return _ref3.apply(this, arguments);
        }

        return getReceipt;
      })()
    },
    {
      key: 'getBlock',
      value: (function() {
        var _ref4 = _asyncToGenerator(
          /*#__PURE__*/ regeneratorRuntime.mark(function _callee4(
            blockNumberOrHash
          ) {
            return regeneratorRuntime.wrap(
              function _callee4$(_context4) {
                while (1) {
                  switch ((_context4.prev = _context4.next)) {
                    case 0:
                      _context4.next = 2;
                      return this.web3.eth.getBlock(blockNumberOrHash);

                    case 2:
                      return _context4.abrupt('return', _context4.sent);

                    case 3:
                    case 'end':
                      return _context4.stop();
                  }
                }
              },
              _callee4,
              this
            );
          })
        );

        function getBlock(_x4) {
          return _ref4.apply(this, arguments);
        }

        return getBlock;
      })()

      /**
       * getDeployedCode - get the deployed code for an address from the client
       * NOTE: the block argument is optional
       * @param  {String} address
       * @return {String}         deployedBinary
       */
    },
    {
      key: 'getDeployedCode',
      value: (function() {
        var _ref5 = _asyncToGenerator(
          /*#__PURE__*/ regeneratorRuntime.mark(function _callee5(
            address,
            block
          ) {
            var code;
            return regeneratorRuntime.wrap(
              function _callee5$(_context5) {
                while (1) {
                  switch ((_context5.prev = _context5.next)) {
                    case 0:
                      debug('getting deployed code for %s', address);
                      _context5.next = 3;
                      return this.web3.eth.getCode(address, block);

                    case 3:
                      code = _context5.sent;
                      return _context5.abrupt(
                        'return',
                        code === '0x0' ? '0x' : code
                      );

                    case 5:
                    case 'end':
                      return _context5.stop();
                  }
                }
              },
              _callee5,
              this
            );
          })
        );

        function getDeployedCode(_x5, _x6) {
          return _ref5.apply(this, arguments);
        }

        return getDeployedCode;
      })()
    }
  ]);

  return Web3Adapter;
})();

exports.default = Web3Adapter;
