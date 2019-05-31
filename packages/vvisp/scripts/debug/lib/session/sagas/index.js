'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.saga = saga;
exports.processTransaction = processTransaction;
exports.unload = unload;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _effects = require('redux-saga/effects');

var _helpers = require('../../helpers');

var _sagas = require('../../ast/sagas');

var ast = _interopRequireWildcard(_sagas);

var _sagas2 = require('../../controller/sagas');

var controller = _interopRequireWildcard(_sagas2);

var _sagas3 = require('../../solidity/sagas');

var solidity = _interopRequireWildcard(_sagas3);

var _sagas4 = require('../../evm/sagas');

var evm = _interopRequireWildcard(_sagas4);

var _sagas5 = require('../../trace/sagas');

var trace = _interopRequireWildcard(_sagas5);

var _sagas6 = require('../../data/sagas');

var data = _interopRequireWildcard(_sagas6);

var _sagas7 = require('../../web3/sagas');

var web3 = _interopRequireWildcard(_sagas7);

var _actions = require('../actions');

var actions = _interopRequireWildcard(_actions);

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};
    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key))
          newObj[key] = obj[key];
      }
    }
    newObj.default = obj;
    return newObj;
  }
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  } else {
    return Array.from(arr);
  }
}

var _marked = /*#__PURE__*/ regeneratorRuntime.mark(listenerSaga),
  _marked2 = /*#__PURE__*/ regeneratorRuntime.mark(saga),
  _marked3 = /*#__PURE__*/ regeneratorRuntime.mark(processTransaction),
  _marked4 = /*#__PURE__*/ regeneratorRuntime.mark(forkListeners),
  _marked5 = /*#__PURE__*/ regeneratorRuntime.mark(fetchTx),
  _marked6 = /*#__PURE__*/ regeneratorRuntime.mark(recordContexts),
  _marked7 = /*#__PURE__*/ regeneratorRuntime.mark(recordSources),
  _marked8 = /*#__PURE__*/ regeneratorRuntime.mark(recordInstance),
  _marked9 = /*#__PURE__*/ regeneratorRuntime.mark(ready),
  _marked10 = /*#__PURE__*/ regeneratorRuntime.mark(error),
  _marked11 = /*#__PURE__*/ regeneratorRuntime.mark(unload),
  _marked12 = /*#__PURE__*/ regeneratorRuntime.mark(load);

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

var debug = (0, _debug2.default)('debugger:session:sagas');

var LOAD_SAGAS = _defineProperty({}, actions.LOAD_TRANSACTION, load);

function listenerSaga() {
  var action, _saga;

  return regeneratorRuntime.wrap(
    function listenerSaga$(_context) {
      while (1) {
        switch ((_context.prev = _context.next)) {
          case 0:
            if (!true) {
              _context.next = 13;
              break;
            }

            _context.next = 3;
            return (0, _effects.take)(Object.keys(LOAD_SAGAS));

          case 3:
            action = _context.sent;
            _saga = LOAD_SAGAS[action.type];
            _context.next = 7;
            return (0, _effects.put)(actions.wait());

          case 7:
            _context.next = 9;
            return (0, _effects.race)({
              exec: (0, _effects.call)(_saga, action), //not all will use this
              interrupt: (0, _effects.take)(actions.INTERRUPT)
            });

          case 9:
            _context.next = 11;
            return (0, _effects.put)(actions.ready());

          case 11:
            _context.next = 0;
            break;

          case 13:
          case 'end':
            return _context.stop();
        }
      }
    },
    _marked,
    this
  );
}

function saga() {
  var _ref, contexts, sources, _ref2, txHash, provider;

  return regeneratorRuntime.wrap(
    function saga$(_context2) {
      while (1) {
        switch ((_context2.prev = _context2.next)) {
          case 0:
            debug('starting listeners');
            return _context2.delegateYield(forkListeners(), 't0', 2);

          case 2:
            // receiving & saving contracts into state
            debug('waiting for contract information');
            _context2.next = 5;
            return (0, _effects.take)(actions.RECORD_CONTRACTS);

          case 5:
            _ref = _context2.sent;
            contexts = _ref.contexts;
            sources = _ref.sources;

            debug('recording contract binaries');
            return _context2.delegateYield(
              recordContexts.apply(undefined, _toConsumableArray(contexts)),
              't1',
              10
            );

          case 10:
            debug('recording contract sources');
            return _context2.delegateYield(
              recordSources.apply(undefined, _toConsumableArray(sources)),
              't2',
              12
            );

          case 12:
            debug('normalizing contexts');
            return _context2.delegateYield(evm.normalizeContexts(), 't3', 14);

          case 14:
            debug('waiting for start');
            // wait for start signal
            _context2.next = 17;
            return (0, _effects.take)(actions.START);

          case 17:
            _ref2 = _context2.sent;
            txHash = _ref2.txHash;
            provider = _ref2.provider;

            debug('starting');

            debug('visiting ASTs');
            // visit asts
            return _context2.delegateYield(ast.visitAll(), 't4', 23);

          case 23:
            //save allocation table
            debug('saving allocation table');
            return _context2.delegateYield(data.recordAllocations(), 't5', 25);

          case 25:
            return _context2.delegateYield(web3.init(provider), 't6', 26);

          case 26:
            if (!(txHash !== undefined)) {
              _context2.next = 28;
              break;
            }

            return _context2.delegateYield(
              processTransaction(txHash),
              't7',
              28
            );

          case 28:
            debug('readying');
            // signal that commands can begin
            return _context2.delegateYield(ready(), 't8', 30);

          case 30:
          case 'end':
            return _context2.stop();
        }
      }
    },
    _marked2,
    this
  );
}

function processTransaction(txHash) {
  var err;
  return regeneratorRuntime.wrap(
    function processTransaction$(_context3) {
      while (1) {
        switch ((_context3.prev = _context3.next)) {
          case 0:
            // process transaction
            debug('fetching transaction info');
            return _context3.delegateYield(fetchTx(txHash), 't0', 2);

          case 2:
            err = _context3.t0;

            if (!err) {
              _context3.next = 6;
              break;
            }

            debug('error %o', err);
            return _context3.delegateYield(error(err), 't1', 6);

          case 6:
          case 'end':
            return _context3.stop();
        }
      }
    },
    _marked3,
    this
  );
}

exports.default = (0, _helpers.prefixName)('session', saga);

function forkListeners() {
  return regeneratorRuntime.wrap(
    function forkListeners$(_context4) {
      while (1) {
        switch ((_context4.prev = _context4.next)) {
          case 0:
            _context4.next = 2;
            return (0, _effects.fork)(listenerSaga);

          case 2:
            _context4.next = 4;
            return (0, _effects.all)(
              [controller, data, evm, solidity, trace, web3].map(
                function(app) {
                  return (0, _effects.fork)(app.saga);
                }
                //ast no longer has a listener
              )
            );

          case 4:
            return _context4.abrupt('return', _context4.sent);

          case 5:
          case 'end':
            return _context4.stop();
        }
      }
    },
    _marked4,
    this
  );
}

function fetchTx(txHash) {
  var result, addresses, blockNumber, binaries;
  return regeneratorRuntime.wrap(
    function fetchTx$(_context5) {
      while (1) {
        switch ((_context5.prev = _context5.next)) {
          case 0:
            return _context5.delegateYield(
              web3.inspectTransaction(txHash),
              't0',
              1
            );

          case 1:
            result = _context5.t0;

            debug('result %o', result);

            if (!result.error) {
              _context5.next = 5;
              break;
            }

            return _context5.abrupt('return', result.error);

          case 5:
            debug('sending initial call');
            return _context5.delegateYield(evm.begin(result), 't1', 7);

          case 7:
            //get addresses created/called during transaction
            debug('processing trace for addresses');
            return _context5.delegateYield(
              trace.processTrace(result.trace),
              't2',
              9
            );

          case 9:
            addresses = _context5.t2;

            //add in the address of the call itself (if a call)
            if (result.address && !addresses.includes(result.address)) {
              addresses.push(result.address);
            }
            //if a create, only add in address if it was successful
            if (
              result.binary &&
              result.status &&
              !addresses.includes(result.storageAddress)
            ) {
              addresses.push(result.storageAddress);
            }

            blockNumber = result.block.number.toString(); //a BN is not accepted

            debug('obtaining binaries');
            return _context5.delegateYield(
              web3.obtainBinaries(addresses, blockNumber),
              't3',
              15
            );

          case 15:
            binaries = _context5.t3;

            debug('recording instances');
            _context5.next = 19;
            return (0, _effects.all)(
              addresses.map(function(address, i) {
                return (0, _effects.call)(recordInstance, address, binaries[i]);
              })
            );

          case 19:
          case 'end':
            return _context5.stop();
        }
      }
    },
    _marked5,
    this
  );
}

function recordContexts() {
  for (
    var _len = arguments.length, contexts = Array(_len), _key = 0;
    _key < _len;
    _key++
  ) {
    contexts[_key] = arguments[_key];
  }

  var _iteratorNormalCompletion,
    _didIteratorError,
    _iteratorError,
    _iterator,
    _step,
    context;

  return regeneratorRuntime.wrap(
    function recordContexts$(_context6) {
      while (1) {
        switch ((_context6.prev = _context6.next)) {
          case 0:
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context6.prev = 3;
            _iterator = contexts[Symbol.iterator]();

          case 5:
            if ((_iteratorNormalCompletion = (_step = _iterator.next()).done)) {
              _context6.next = 11;
              break;
            }

            context = _step.value;
            return _context6.delegateYield(evm.addContext(context), 't0', 8);

          case 8:
            _iteratorNormalCompletion = true;
            _context6.next = 5;
            break;

          case 11:
            _context6.next = 17;
            break;

          case 13:
            _context6.prev = 13;
            _context6.t1 = _context6['catch'](3);
            _didIteratorError = true;
            _iteratorError = _context6.t1;

          case 17:
            _context6.prev = 17;
            _context6.prev = 18;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 20:
            _context6.prev = 20;

            if (!_didIteratorError) {
              _context6.next = 23;
              break;
            }

            throw _iteratorError;

          case 23:
            return _context6.finish(20);

          case 24:
            return _context6.finish(17);

          case 25:
          case 'end':
            return _context6.stop();
        }
      }
    },
    _marked6,
    this,
    [[3, 13, 17, 25], [18, , 20, 24]]
  );
}

function recordSources() {
  for (
    var _len2 = arguments.length, sources = Array(_len2), _key2 = 0;
    _key2 < _len2;
    _key2++
  ) {
    sources[_key2] = arguments[_key2];
  }

  var _iteratorNormalCompletion2,
    _didIteratorError2,
    _iteratorError2,
    _iterator2,
    _step2,
    sourceData;

  return regeneratorRuntime.wrap(
    function recordSources$(_context7) {
      while (1) {
        switch ((_context7.prev = _context7.next)) {
          case 0:
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context7.prev = 3;
            _iterator2 = sources[Symbol.iterator]();

          case 5:
            if (
              (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done)
            ) {
              _context7.next = 12;
              break;
            }

            sourceData = _step2.value;

            if (!(sourceData !== undefined && sourceData !== null)) {
              _context7.next = 9;
              break;
            }

            return _context7.delegateYield(
              solidity.addSource(
                sourceData.source,
                sourceData.sourcePath,
                sourceData.ast,
                sourceData.compiler
              ),
              't0',
              9
            );

          case 9:
            _iteratorNormalCompletion2 = true;
            _context7.next = 5;
            break;

          case 12:
            _context7.next = 18;
            break;

          case 14:
            _context7.prev = 14;
            _context7.t1 = _context7['catch'](3);
            _didIteratorError2 = true;
            _iteratorError2 = _context7.t1;

          case 18:
            _context7.prev = 18;
            _context7.prev = 19;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 21:
            _context7.prev = 21;

            if (!_didIteratorError2) {
              _context7.next = 24;
              break;
            }

            throw _iteratorError2;

          case 24:
            return _context7.finish(21);

          case 25:
            return _context7.finish(18);

          case 26:
          case 'end':
            return _context7.stop();
        }
      }
    },
    _marked7,
    this,
    [[3, 14, 18, 26], [19, , 21, 25]]
  );
}

function recordInstance(address, binary) {
  return regeneratorRuntime.wrap(
    function recordInstance$(_context8) {
      while (1) {
        switch ((_context8.prev = _context8.next)) {
          case 0:
            return _context8.delegateYield(
              evm.addInstance(address, binary),
              't0',
              1
            );

          case 1:
          case 'end':
            return _context8.stop();
        }
      }
    },
    _marked8,
    this
  );
}

function ready() {
  return regeneratorRuntime.wrap(
    function ready$(_context9) {
      while (1) {
        switch ((_context9.prev = _context9.next)) {
          case 0:
            _context9.next = 2;
            return (0, _effects.put)(actions.ready());

          case 2:
          case 'end':
            return _context9.stop();
        }
      }
    },
    _marked9,
    this
  );
}

function error(err) {
  return regeneratorRuntime.wrap(
    function error$(_context10) {
      while (1) {
        switch ((_context10.prev = _context10.next)) {
          case 0:
            _context10.next = 2;
            return (0, _effects.put)(actions.error(err));

          case 2:
          case 'end':
            return _context10.stop();
        }
      }
    },
    _marked10,
    this
  );
}

function unload() {
  return regeneratorRuntime.wrap(
    function unload$(_context11) {
      while (1) {
        switch ((_context11.prev = _context11.next)) {
          case 0:
            debug('unloading');
            return _context11.delegateYield(data.reset(), 't0', 2);

          case 2:
            return _context11.delegateYield(solidity.reset(), 't1', 3);

          case 3:
            return _context11.delegateYield(evm.unload(), 't2', 4);

          case 4:
            return _context11.delegateYield(trace.unload(), 't3', 5);

          case 5:
            _context11.next = 7;
            return (0, _effects.put)(actions.unloadTransaction());

          case 7:
          case 'end':
            return _context11.stop();
        }
      }
    },
    _marked11,
    this
  );
}

//note that load takes an action as its argument, which is why it's separate
//from processTransaction
function load(_ref3) {
  var txHash = _ref3.txHash;
  return regeneratorRuntime.wrap(
    function load$(_context12) {
      while (1) {
        switch ((_context12.prev = _context12.next)) {
          case 0:
            return _context12.delegateYield(
              processTransaction(txHash),
              't0',
              1
            );

          case 1:
          case 'end':
            return _context12.stop();
        }
      }
    },
    _marked12,
    this
  );
}
