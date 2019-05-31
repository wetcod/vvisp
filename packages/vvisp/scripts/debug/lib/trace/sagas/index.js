'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.advance = advance;
exports.signalTickSagaCompletion = signalTickSagaCompletion;
exports.processTrace = processTrace;
exports.reset = reset;
exports.unload = unload;
exports.saga = saga;

require('babel-core/register');
require('babel-polyfill');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _effects = require('redux-saga/effects');

var _helpers = require('../../helpers');

var _truffleDecodeUtils = require('truffle-decode-utils');

var DecodeUtils = _interopRequireWildcard(_truffleDecodeUtils);

var _actions = require('../actions');

var actions = _interopRequireWildcard(_actions);

var _selectors = require('../selectors');

var _selectors2 = _interopRequireDefault(_selectors);

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

var _marked = /*#__PURE__*/ regeneratorRuntime.mark(advance),
  _marked2 = /*#__PURE__*/ regeneratorRuntime.mark(next),
  _marked3 = /*#__PURE__*/ regeneratorRuntime.mark(signalTickSagaCompletion),
  _marked4 = /*#__PURE__*/ regeneratorRuntime.mark(processTrace),
  _marked5 = /*#__PURE__*/ regeneratorRuntime.mark(reset),
  _marked6 = /*#__PURE__*/ regeneratorRuntime.mark(unload),
  _marked7 = /*#__PURE__*/ regeneratorRuntime.mark(saga);

var debug = (0, _debug2.default)('debugger:trace:sagas');

function advance() {
  return regeneratorRuntime.wrap(
    function advance$(_context) {
      while (1) {
        switch ((_context.prev = _context.next)) {
          case 0:
            _context.next = 2;
            return (0, _effects.put)(actions.next());

          case 2:
            debug('TOCK to take');
            _context.next = 5;
            return (0, _effects.take)([actions.TOCK, actions.END_OF_TRACE]);

          case 5:
            debug('TOCK taken');

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    },
    _marked,
    this
  );
}

var SUBMODULE_COUNT = 3; //data, evm, solidity

function next() {
  var remaining, steps, waitingForSubmodules;
  return regeneratorRuntime.wrap(
    function next$(_context2) {
      while (1) {
        switch ((_context2.prev = _context2.next)) {
          case 0:
            _context2.next = 2;
            return (0, _effects.select)(_selectors2.default.stepsRemaining);

          case 2:
            remaining = _context2.sent;

            debug('remaining: %o', remaining);
            _context2.next = 6;
            return (0, _effects.select)(_selectors2.default.steps);

          case 6:
            steps = _context2.sent;

            debug('total steps: %o', steps.length);
            waitingForSubmodules = 0;

            if (!(remaining > 0)) {
              _context2.next = 23;
              break;
            }

            debug('putting TICK');
            // updates state for current step
            waitingForSubmodules = SUBMODULE_COUNT;
            _context2.next = 14;
            return (0, _effects.put)(actions.tick());

          case 14:
            debug('put TICK');

          //wait for all backticks before continuing

          case 15:
            if (!(waitingForSubmodules > 0)) {
              _context2.next = 22;
              break;
            }

            _context2.next = 18;
            return (0, _effects.take)(actions.BACKTICK);

          case 18:
            debug('got BACKTICK');
            waitingForSubmodules--;
            _context2.next = 15;
            break;

          case 22:
            remaining--; // local update, just for convenience

          case 23:
            if (!remaining) {
              _context2.next = 30;
              break;
            }

            debug('putting TOCK');
            // updates step to next step in trace
            _context2.next = 27;
            return (0, _effects.put)(actions.tock());

          case 27:
            debug('put TOCK');
            _context2.next = 34;
            break;

          case 30:
            debug('putting END_OF_TRACE');
            _context2.next = 33;
            return (0, _effects.put)(actions.endTrace());

          case 33:
            debug('put END_OF_TRACE');

          case 34:
          case 'end':
            return _context2.stop();
        }
      }
    },
    _marked2,
    this
  );
}

function signalTickSagaCompletion() {
  return regeneratorRuntime.wrap(
    function signalTickSagaCompletion$(_context3) {
      while (1) {
        switch ((_context3.prev = _context3.next)) {
          case 0:
            _context3.next = 2;
            return (0, _effects.put)(actions.backtick());

          case 2:
          case 'end':
            return _context3.stop();
        }
      }
    },
    _marked3,
    this
  );
}

function processTrace(steps) {
  var addresses;
  return regeneratorRuntime.wrap(
    function processTrace$(_context4) {
      while (1) {
        switch ((_context4.prev = _context4.next)) {
          case 0:
            _context4.next = 2;
            return (0, _effects.put)(actions.saveSteps(steps));

          case 2:
            addresses = [].concat(
              _toConsumableArray(
                new Set(
                  steps
                    .map(function(_ref, index) {
                      var op = _ref.op,
                        stack = _ref.stack,
                        depth = _ref.depth;

                      if ((0, _helpers.isCallMnemonic)(op)) {
                        //if it's a call, just fetch the address off the stack
                        return DecodeUtils.Conversion.toAddress(
                          stack[stack.length - 2]
                        );
                      } else if ((0, _helpers.isCreateMnemonic)(op)) {
                        //if it's a create, look ahead to when it returns and get the
                        //address off the stack
                        var returnStack = steps
                          .slice(index + 1)
                          .find(function(step) {
                            return step.depth === depth;
                          }).stack;
                        return DecodeUtils.Conversion.toAddress(
                          returnStack[returnStack.length - 1]
                        );
                      } else {
                        //if it's not a call or create, there's no address to get
                        return undefined;
                      }
                    })
                    //filter out zero addresses from failed creates (as well as undefineds)
                    .filter(function(address) {
                      return (
                        address !== undefined &&
                        address !== DecodeUtils.EVM.ZERO_ADDRESS
                      );
                    })
                )
              )
            );
            return _context4.abrupt('return', addresses);

          case 4:
          case 'end':
            return _context4.stop();
        }
      }
    },
    _marked4,
    this
  );
}

function reset() {
  return regeneratorRuntime.wrap(
    function reset$(_context5) {
      while (1) {
        switch ((_context5.prev = _context5.next)) {
          case 0:
            _context5.next = 2;
            return (0, _effects.put)(actions.reset());

          case 2:
          case 'end':
            return _context5.stop();
        }
      }
    },
    _marked5,
    this
  );
}

function unload() {
  return regeneratorRuntime.wrap(
    function unload$(_context6) {
      while (1) {
        switch ((_context6.prev = _context6.next)) {
          case 0:
            _context6.next = 2;
            return (0, _effects.put)(actions.unloadTransaction());

          case 2:
          case 'end':
            return _context6.stop();
        }
      }
    },
    _marked6,
    this
  );
}

function saga() {
  return regeneratorRuntime.wrap(
    function saga$(_context7) {
      while (1) {
        switch ((_context7.prev = _context7.next)) {
          case 0:
            _context7.next = 2;
            return (0, _effects.takeEvery)(actions.NEXT, next);

          case 2:
          case 'end':
            return _context7.stop();
        }
      }
    },
    _marked7,
    this
  );
}

exports.default = (0, _helpers.prefixName)('trace', saga);
