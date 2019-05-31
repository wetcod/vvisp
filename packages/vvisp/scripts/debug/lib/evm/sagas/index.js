'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.addContext = addContext;
exports.normalizeContexts = normalizeContexts;
exports.addInstance = addInstance;
exports.begin = begin;
exports.callstackAndCodexSaga = callstackAndCodexSaga;
exports.reset = reset;
exports.unload = unload;
exports.saga = saga;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _effects = require('redux-saga/effects');

var _helpers = require('../..//helpers');

var _actions = require('../..//trace/actions');

var _actions2 = require('../actions');

var actions = _interopRequireWildcard(_actions2);

var _selectors = require('../selectors');

var _selectors2 = _interopRequireDefault(_selectors);

var _sagas = require('../..//trace/sagas');

var trace = _interopRequireWildcard(_sagas);

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

var _marked = /*#__PURE__*/ regeneratorRuntime.mark(addContext),
  _marked2 = /*#__PURE__*/ regeneratorRuntime.mark(normalizeContexts),
  _marked3 = /*#__PURE__*/ regeneratorRuntime.mark(addInstance),
  _marked4 = /*#__PURE__*/ regeneratorRuntime.mark(begin),
  _marked5 = /*#__PURE__*/ regeneratorRuntime.mark(tickSaga),
  _marked6 = /*#__PURE__*/ regeneratorRuntime.mark(callstackAndCodexSaga),
  _marked7 = /*#__PURE__*/ regeneratorRuntime.mark(reset),
  _marked8 = /*#__PURE__*/ regeneratorRuntime.mark(unload),
  _marked9 = /*#__PURE__*/ regeneratorRuntime.mark(saga);

var debug = (0, _debug2.default)('debugger:evm:sagas');

/**
 * Adds EVM bytecode context
 *
 * @return {string} ID (0x-prefixed keccak of binary)
 */
function addContext(context) {
  var contextHash;
  return regeneratorRuntime.wrap(
    function addContext$(_context) {
      while (1) {
        switch ((_context.prev = _context.next)) {
          case 0:
            contextHash = (0, _helpers.keccak256)({
              type: 'string',
              value: context.binary
            });
            //NOTE: we take hash as *string*, not as bytes, because the binary may
            //contain link references!

            debug('context %O', context);
            _context.next = 4;
            return (0, _effects.put)(actions.addContext(context));

          case 4:
            return _context.abrupt('return', contextHash);

          case 5:
          case 'end':
            return _context.stop();
        }
      }
    },
    _marked,
    this
  );
}

function normalizeContexts() {
  return regeneratorRuntime.wrap(
    function normalizeContexts$(_context2) {
      while (1) {
        switch ((_context2.prev = _context2.next)) {
          case 0:
            _context2.next = 2;
            return (0, _effects.put)(actions.normalizeContexts());

          case 2:
          case 'end':
            return _context2.stop();
        }
      }
    },
    _marked2,
    this
  );
}

/**
 * Adds known deployed instance of binary at address
 *
 * @param {string} binary - may be undefined (e.g. precompiles)
 * @return {string} ID (0x-prefixed keccak of binary)
 */
function addInstance(address, binary) {
  var search, context;
  return regeneratorRuntime.wrap(
    function addInstance$(_context3) {
      while (1) {
        switch ((_context3.prev = _context3.next)) {
          case 0:
            _context3.next = 2;
            return (0, _effects.select)(
              _selectors2.default.info.binaries.search
            );

          case 2:
            search = _context3.sent;
            context = search(binary);

            // in case binary is unknown, add a context for it

            if (!(context === null)) {
              _context3.next = 7;
              break;
            }

            return _context3.delegateYield(
              addContext({
                binary: binary,
                isConstructor: false
                //addInstance is only used for adding deployed instances, so it will
                //never be a constructor
              }),
              't0',
              6
            );

          case 6:
            context = _context3.t0;

          case 7:
            _context3.next = 9;
            return (0, _effects.put)(
              actions.addInstance(address, context, binary)
            );

          case 9:
            return _context3.abrupt('return', context);

          case 10:
          case 'end':
            return _context3.stop();
        }
      }
    },
    _marked3,
    this
  );
}

function begin(_ref) {
  var address = _ref.address,
    binary = _ref.binary,
    data = _ref.data,
    storageAddress = _ref.storageAddress,
    sender = _ref.sender,
    value = _ref.value,
    gasprice = _ref.gasprice,
    block = _ref.block;
  return regeneratorRuntime.wrap(
    function begin$(_context4) {
      while (1) {
        switch ((_context4.prev = _context4.next)) {
          case 0:
            _context4.next = 2;
            return (0, _effects.put)(
              actions.saveGlobals(sender, gasprice, block)
            );

          case 2:
            if (!address) {
              _context4.next = 7;
              break;
            }

            _context4.next = 5;
            return (0, _effects.put)(
              actions.call(address, data, storageAddress, sender, value)
            );

          case 5:
            _context4.next = 9;
            break;

          case 7:
            _context4.next = 9;
            return (0, _effects.put)(
              actions.create(binary, storageAddress, sender, value)
            );

          case 9:
          case 'end':
            return _context4.stop();
        }
      }
    },
    _marked4,
    this
  );
}

function tickSaga() {
  return regeneratorRuntime.wrap(
    function tickSaga$(_context5) {
      while (1) {
        switch ((_context5.prev = _context5.next)) {
          case 0:
            debug('got TICK');

            return _context5.delegateYield(callstackAndCodexSaga(), 't0', 2);

          case 2:
            return _context5.delegateYield(
              trace.signalTickSagaCompletion(),
              't1',
              3
            );

          case 3:
          case 'end':
            return _context5.stop();
        }
      }
    },
    _marked5,
    this
  );
}

function callstackAndCodexSaga() {
  var address,
    data,
    _ref2,
    storageAddress,
    sender,
    value,
    currentCall,
    _storageAddress,
    _sender,
    _value,
    binary,
    createdAddress,
    _value2,
    _sender2,
    _storageAddress2,
    slot,
    storage;

  return regeneratorRuntime.wrap(
    function callstackAndCodexSaga$(_context6) {
      while (1) {
        switch ((_context6.prev = _context6.next)) {
          case 0:
            _context6.next = 2;
            return (0, _effects.select)(
              _selectors2.default.current.step.isExceptionalHalting
            );

          case 2:
            if (!_context6.sent) {
              _context6.next = 8;
              break;
            }

            //let's handle this case first so we can be sure everything else is *not*
            //an exceptional halt
            debug('exceptional halt!');

            _context6.next = 6;
            return (0, _effects.put)(actions.fail());

          case 6:
            _context6.next = 104;
            break;

          case 8:
            _context6.next = 10;
            return (0, _effects.select)(
              _selectors2.default.current.step.isCall
            );

          case 10:
            if (!_context6.sent) {
              _context6.next = 55;
              break;
            }

            debug('got call');
            // if there is no binary (e.g. in the case of precompiled contracts or
            // externally owned accounts), then there will be no trace steps for the
            // called code, and so we shouldn't tell the debugger that we're entering
            // another execution context
            _context6.next = 14;
            return (0, _effects.select)(
              _selectors2.default.current.step.callsPrecompileOrExternal
            );

          case 14:
            if (!_context6.sent) {
              _context6.next = 16;
              break;
            }

            return _context6.abrupt('return');

          case 16:
            _context6.next = 18;
            return (0, _effects.select)(
              _selectors2.default.current.step.callAddress
            );

          case 18:
            address = _context6.sent;
            _context6.next = 21;
            return (0, _effects.select)(
              _selectors2.default.current.step.callData
            );

          case 21:
            data = _context6.sent;

            debug('calling address %s', address);

            _context6.next = 25;
            return (0, _effects.select)(
              _selectors2.default.current.step.isDelegateCallStrict
            );

          case 25:
            if (!_context6.sent) {
              _context6.next = 36;
              break;
            }

            _context6.next = 28;
            return (0, _effects.select)(_selectors2.default.current.call);

          case 28:
            _ref2 = _context6.sent;
            storageAddress = _ref2.storageAddress;
            sender = _ref2.sender;
            value = _ref2.value;
            _context6.next = 34;
            return (0, _effects.put)(
              actions.call(address, data, storageAddress, sender, value)
            );

          case 34:
            _context6.next = 53;
            break;

          case 36:
            _context6.next = 38;
            return (0, _effects.select)(_selectors2.default.current.call);

          case 38:
            currentCall = _context6.sent;
            _context6.next = 41;
            return (0, _effects.select)(
              _selectors2.default.current.step.isDelegateCallBroad
            );

          case 41:
            if (!_context6.sent) {
              _context6.next = 45;
              break;
            }

            _context6.t0 = currentCall.storageAddress; //for CALLCODE
            _context6.next = 46;
            break;

          case 45:
            _context6.t0 = address;

          case 46:
            _storageAddress = _context6.t0;
            _sender = currentCall.storageAddress; //not the code address!

            _context6.next = 50;
            return (0, _effects.select)(
              _selectors2.default.current.step.callValue
            );

          case 50:
            _value = _context6.sent;
            _context6.next = 53;
            return (0, _effects.put)(
              actions.call(address, data, _storageAddress, _sender, _value)
            );

          case 53:
            _context6.next = 104;
            break;

          case 55:
            _context6.next = 57;
            return (0, _effects.select)(
              _selectors2.default.current.step.isCreate
            );

          case 57:
            if (!_context6.sent) {
              _context6.next = 75;
              break;
            }

            debug('got create');
            _context6.next = 61;
            return (0, _effects.select)(
              _selectors2.default.current.step.createBinary
            );

          case 61:
            binary = _context6.sent;
            _context6.next = 64;
            return (0, _effects.select)(
              _selectors2.default.current.step.createdAddress
            );

          case 64:
            createdAddress = _context6.sent;
            _context6.next = 67;
            return (0, _effects.select)(
              _selectors2.default.current.step.createValue
            );

          case 67:
            _value2 = _context6.sent;
            _context6.next = 70;
            return (0, _effects.select)(_selectors2.default.current.call);

          case 70:
            _sender2 = _context6.sent.storageAddress;
            _context6.next = 73;
            return (0, _effects.put)(
              actions.create(binary, createdAddress, _sender2, _value2)
            );

          case 73:
            _context6.next = 104;
            break;

          case 75:
            _context6.next = 77;
            return (0, _effects.select)(
              _selectors2.default.current.step.isHalting
            );

          case 77:
            if (!_context6.sent) {
              _context6.next = 83;
              break;
            }

            debug('got return');

            _context6.next = 81;
            return (0, _effects.put)(actions.returnCall());

          case 81:
            _context6.next = 104;
            break;

          case 83:
            _context6.next = 85;
            return (0, _effects.select)(
              _selectors2.default.current.step.touchesStorage
            );

          case 85:
            if (!_context6.sent) {
              _context6.next = 104;
              break;
            }

            _context6.next = 88;
            return (0, _effects.select)(_selectors2.default.current.call);

          case 88:
            _storageAddress2 = _context6.sent.storageAddress;
            _context6.next = 91;
            return (0, _effects.select)(
              _selectors2.default.current.step.storageAffected
            );

          case 91:
            slot = _context6.sent;
            _context6.next = 94;
            return (0, _effects.select)(_selectors2.default.next.state.storage);

          case 94:
            storage = _context6.sent;
            _context6.next = 97;
            return (0, _effects.select)(
              _selectors2.default.current.step.isStore
            );

          case 97:
            if (!_context6.sent) {
              _context6.next = 102;
              break;
            }

            _context6.next = 100;
            return (0, _effects.put)(
              actions.store(_storageAddress2, slot, storage[slot])
            );

          case 100:
            _context6.next = 104;
            break;

          case 102:
            _context6.next = 104;
            return (0, _effects.put)(
              actions.load(_storageAddress2, slot, storage[slot])
            );

          case 104:
          case 'end':
            return _context6.stop();
        }
      }
    },
    _marked6,
    this
  );
}

function reset() {
  var initialAddress;
  return regeneratorRuntime.wrap(
    function reset$(_context7) {
      while (1) {
        switch ((_context7.prev = _context7.next)) {
          case 0:
            _context7.next = 2;
            return (0, _effects.select)(_selectors2.default.current.callstack);

          case 2:
            initialAddress = _context7.sent[0].storageAddress;
            _context7.next = 5;
            return (0, _effects.put)(actions.reset(initialAddress));

          case 5:
          case 'end':
            return _context7.stop();
        }
      }
    },
    _marked7,
    this
  );
}

function unload() {
  return regeneratorRuntime.wrap(
    function unload$(_context8) {
      while (1) {
        switch ((_context8.prev = _context8.next)) {
          case 0:
            _context8.next = 2;
            return (0, _effects.put)(actions.unloadTransaction());

          case 2:
          case 'end':
            return _context8.stop();
        }
      }
    },
    _marked8,
    this
  );
}

function saga() {
  return regeneratorRuntime.wrap(
    function saga$(_context9) {
      while (1) {
        switch ((_context9.prev = _context9.next)) {
          case 0:
            _context9.next = 2;
            return (0, _effects.takeEvery)(_actions.TICK, tickSaga);

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

exports.default = (0, _helpers.prefixName)('evm', saga);
