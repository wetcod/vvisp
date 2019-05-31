'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.addSource = addSource;
exports.reset = reset;
exports.saga = saga;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _effects = require('redux-saga/effects');

var _helpers = require('../../helpers');

var _actions = require('../actions');

var actions = _interopRequireWildcard(_actions);

var _actions2 = require('../../trace/actions');

var _sagas = require('../../trace/sagas');

var trace = _interopRequireWildcard(_sagas);

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

var _marked = /*#__PURE__*/ regeneratorRuntime.mark(addSource),
  _marked2 = /*#__PURE__*/ regeneratorRuntime.mark(tickSaga),
  _marked3 = /*#__PURE__*/ regeneratorRuntime.mark(functionDepthSaga),
  _marked4 = /*#__PURE__*/ regeneratorRuntime.mark(reset),
  _marked5 = /*#__PURE__*/ regeneratorRuntime.mark(saga);

var debug = (0, _debug2.default)('debugger:solidity:sagas');

function addSource(source, sourcePath, ast, compiler) {
  return regeneratorRuntime.wrap(
    function addSource$(_context) {
      while (1) {
        switch ((_context.prev = _context.next)) {
          case 0:
            _context.next = 2;
            return (0, _effects.put)(
              actions.addSource(source, sourcePath, ast, compiler)
            );

          case 2:
          case 'end':
            return _context.stop();
        }
      }
    },
    _marked,
    this
  );
}

function tickSaga() {
  return regeneratorRuntime.wrap(
    function tickSaga$(_context2) {
      while (1) {
        switch ((_context2.prev = _context2.next)) {
          case 0:
            debug('got TICK');

            return _context2.delegateYield(functionDepthSaga(), 't0', 2);

          case 2:
            return _context2.delegateYield(
              trace.signalTickSagaCompletion(),
              't1',
              3
            );

          case 3:
          case 'end':
            return _context2.stop();
        }
      }
    },
    _marked2,
    this
  );
}

function functionDepthSaga() {
  var jumpDirection;
  return regeneratorRuntime.wrap(
    function functionDepthSaga$(_context3) {
      while (1) {
        switch ((_context3.prev = _context3.next)) {
          case 0:
            _context3.next = 2;
            return (0, _effects.select)(_selectors2.default.current.willFail);

          case 2:
            if (!_context3.sent) {
              _context3.next = 7;
              break;
            }

            _context3.next = 5;
            return (0, _effects.put)(actions.externalReturn());

          case 5:
            _context3.next = 42;
            break;

          case 7:
            _context3.next = 9;
            return (0, _effects.select)(_selectors2.default.current.willJump);

          case 9:
            if (!_context3.sent) {
              _context3.next = 17;
              break;
            }

            _context3.next = 12;
            return (0, _effects.select)(
              _selectors2.default.current.jumpDirection
            );

          case 12:
            jumpDirection = _context3.sent;
            _context3.next = 15;
            return (0, _effects.put)(actions.jump(jumpDirection));

          case 15:
            _context3.next = 42;
            break;

          case 17:
            _context3.next = 19;
            return (0, _effects.select)(_selectors2.default.current.willCall);

          case 19:
            if (!_context3.sent) {
              _context3.next = 30;
              break;
            }

            debug('about to call');
            _context3.next = 23;
            return (0, _effects.select)(
              _selectors2.default.current.callsPrecompileOrExternal
            );

          case 23:
            if (!_context3.sent) {
              _context3.next = 26;
              break;
            }

            _context3.next = 28;
            break;

          case 26:
            _context3.next = 28;
            return (0, _effects.put)(actions.externalCall());

          case 28:
            _context3.next = 42;
            break;

          case 30:
            _context3.next = 32;
            return (0, _effects.select)(_selectors2.default.current.willCreate);

          case 32:
            if (!_context3.sent) {
              _context3.next = 37;
              break;
            }

            _context3.next = 35;
            return (0, _effects.put)(actions.externalCall());

          case 35:
            _context3.next = 42;
            break;

          case 37:
            _context3.next = 39;
            return (0, _effects.select)(_selectors2.default.current.willReturn);

          case 39:
            if (!_context3.sent) {
              _context3.next = 42;
              break;
            }

            _context3.next = 42;
            return (0, _effects.put)(actions.externalReturn());

          case 42:
          case 'end':
            return _context3.stop();
        }
      }
    },
    _marked3,
    this
  );
}

function reset() {
  return regeneratorRuntime.wrap(
    function reset$(_context4) {
      while (1) {
        switch ((_context4.prev = _context4.next)) {
          case 0:
            _context4.next = 2;
            return (0, _effects.put)(actions.reset());

          case 2:
          case 'end':
            return _context4.stop();
        }
      }
    },
    _marked4,
    this
  );
}

function saga() {
  return regeneratorRuntime.wrap(
    function saga$(_context5) {
      while (1) {
        switch ((_context5.prev = _context5.next)) {
          case 0:
            _context5.next = 2;
            return (0, _effects.takeEvery)(_actions2.TICK, tickSaga);

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

exports.default = (0, _helpers.prefixName)('solidity', saga);
