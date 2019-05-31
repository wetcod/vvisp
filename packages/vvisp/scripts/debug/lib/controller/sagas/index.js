'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _STEP_SAGAS;

exports.saga = saga;
exports.reset = reset;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _effects = require('redux-saga/effects');

var _helpers = require('../../helpers');

var _sagas = require('../../trace/sagas');

var trace = _interopRequireWildcard(_sagas);

var _sagas2 = require('../../data/sagas');

var data = _interopRequireWildcard(_sagas2);

var _sagas3 = require('../../evm/sagas');

var evm = _interopRequireWildcard(_sagas3);

var _sagas4 = require('../../solidity/sagas');

var solidity = _interopRequireWildcard(_sagas4);

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

var _marked = /*#__PURE__*/ regeneratorRuntime.mark(saga),
  _marked2 = /*#__PURE__*/ regeneratorRuntime.mark(advance),
  _marked3 = /*#__PURE__*/ regeneratorRuntime.mark(stepNext),
  _marked4 = /*#__PURE__*/ regeneratorRuntime.mark(stepInto),
  _marked5 = /*#__PURE__*/ regeneratorRuntime.mark(stepOut),
  _marked6 = /*#__PURE__*/ regeneratorRuntime.mark(stepOver),
  _marked7 = /*#__PURE__*/ regeneratorRuntime.mark(continueUntilBreakpoint),
  _marked8 = /*#__PURE__*/ regeneratorRuntime.mark(reset);

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

var debug = (0, _debug2.default)('debugger:controller:sagas');

var STEP_SAGAS = ((_STEP_SAGAS = {}),
_defineProperty(_STEP_SAGAS, actions.ADVANCE, advance),
_defineProperty(_STEP_SAGAS, actions.STEP_NEXT, stepNext),
_defineProperty(_STEP_SAGAS, actions.STEP_OVER, stepOver),
_defineProperty(_STEP_SAGAS, actions.STEP_INTO, stepInto),
_defineProperty(_STEP_SAGAS, actions.STEP_OUT, stepOut),
_defineProperty(_STEP_SAGAS, actions.CONTINUE, continueUntilBreakpoint),
_STEP_SAGAS);

function saga() {
  var action, _saga;

  return regeneratorRuntime.wrap(
    function saga$(_context) {
      while (1) {
        switch ((_context.prev = _context.next)) {
          case 0:
            if (!true) {
              _context.next = 19;
              break;
            }

            debug('waiting for control action');
            _context.next = 4;
            return (0, _effects.take)(Object.keys(STEP_SAGAS));

          case 4:
            action = _context.sent;
            _context.next = 7;
            return (0, _effects.select)(
              _selectors2.default.current.trace.loaded
            );

          case 7:
            if (_context.sent) {
              _context.next = 9;
              break;
            }

            return _context.abrupt('continue', 0);

          case 9:
            debug('got control action');
            _saga = STEP_SAGAS[action.type];
            _context.next = 13;
            return (0, _effects.put)(actions.startStepping());

          case 13:
            _context.next = 15;
            return (0, _effects.race)({
              exec: (0, _effects.call)(_saga, action), //not all will use this
              interrupt: (0, _effects.take)(actions.INTERRUPT)
            });

          case 15:
            _context.next = 17;
            return (0, _effects.put)(actions.doneStepping());

          case 17:
            _context.next = 0;
            break;

          case 19:
          case 'end':
            return _context.stop();
        }
      }
    },
    _marked,
    this
  );
}

exports.default = (0, _helpers.prefixName)('controller', saga);

/*
 * Advance the state by the given number of instructions (but not past the end)
 * (if no count given, advance 1)
 */

function advance(action) {
  var count, i;
  return regeneratorRuntime.wrap(
    function advance$(_context2) {
      while (1) {
        switch ((_context2.prev = _context2.next)) {
          case 0:
            count =
              action !== undefined && action.count !== undefined
                ? action.count
                : 1;
            //default is, as mentioned, to advance 1

            i = 0;

          case 2:
            _context2.t0 = i < count;

            if (!_context2.t0) {
              _context2.next = 7;
              break;
            }

            _context2.next = 6;
            return (0, _effects.select)(
              _selectors2.default.current.trace.finished
            );

          case 6:
            _context2.t0 = !_context2.sent;

          case 7:
            if (!_context2.t0) {
              _context2.next = 12;
              break;
            }

            return _context2.delegateYield(trace.advance(), 't1', 9);

          case 9:
            i++;
            _context2.next = 2;
            break;

          case 12:
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
 * stepNext - step to the next logical code segment
 *
 * Note: It might take multiple instructions to express the same section of code.
 * "Stepping", then, is stepping to the next logical item, not stepping to the next
 * instruction. See advance() if you'd like to advance by one instruction.
 */
function stepNext() {
  var startingRange, upcoming, finished;
  return regeneratorRuntime.wrap(
    function stepNext$(_context3) {
      while (1) {
        switch ((_context3.prev = _context3.next)) {
          case 0:
            _context3.next = 2;
            return (0, _effects.select)(
              _selectors2.default.current.location.sourceRange
            );

          case 2:
            startingRange = _context3.sent;

          case 3:
            return _context3.delegateYield(advance(), 't0', 4);

          case 4:
            _context3.prev = 4;
            _context3.next = 7;
            return (0, _effects.select)(_selectors2.default.current.location);

          case 7:
            upcoming = _context3.sent;
            _context3.next = 13;
            break;

          case 10:
            _context3.prev = 10;
            _context3.t1 = _context3['catch'](4);

            upcoming = null;

          case 13:
            _context3.next = 15;
            return (0, _effects.select)(
              _selectors2.default.current.trace.finished
            );

          case 15:
            finished = _context3.sent;

          case 16:
            if (
              !finished &&
              (!upcoming ||
                !upcoming.node ||
                (0, _helpers.isDeliberatelySkippedNodeType)(upcoming.node) ||
                (upcoming.sourceRange.start == startingRange.start &&
                  upcoming.sourceRange.length == startingRange.length))
            ) {
              _context3.next = 3;
              break;
            }

          case 17:
          case 'end':
            return _context3.stop();
        }
      }
    },
    _marked3,
    this,
    [[4, 10]]
  );
}

/**
 * stepInto - step into the current function
 *
 * Conceptually this is easy, but from a programming standpoint it's hard.
 * Code like `getBalance(msg.sender)` might be highlighted, but there could
 * be a number of different intermediate steps (like evaluating `msg.sender`)
 * before `getBalance` is stepped into. This function will step into the first
 * function available (where instruction.jump == "i"), ignoring any intermediate
 * steps that fall within the same code range. If there's a step encountered
 * that exists outside of the range, then stepInto will only execute until that
 * step.
 */
function stepInto() {
  var startingDepth, startingRange, currentDepth, currentRange;
  return regeneratorRuntime.wrap(
    function stepInto$(_context4) {
      while (1) {
        switch ((_context4.prev = _context4.next)) {
          case 0:
            _context4.next = 2;
            return (0, _effects.select)(_selectors2.default.current.willJump);

          case 2:
            if (!_context4.sent) {
              _context4.next = 5;
              break;
            }

            return _context4.delegateYield(stepNext(), 't0', 4);

          case 4:
            return _context4.abrupt('return');

          case 5:
            _context4.next = 7;
            return (0, _effects.select)(
              _selectors2.default.current.location.isMultiline
            );

          case 7:
            if (!_context4.sent) {
              _context4.next = 10;
              break;
            }

            return _context4.delegateYield(stepOver(), 't1', 9);

          case 9:
            return _context4.abrupt('return');

          case 10:
            _context4.next = 12;
            return (0, _effects.select)(
              _selectors2.default.current.functionDepth
            );

          case 12:
            startingDepth = _context4.sent;
            _context4.next = 15;
            return (0, _effects.select)(
              _selectors2.default.current.location.sourceRange
            );

          case 15:
            startingRange = _context4.sent;

          case 16:
            return _context4.delegateYield(stepNext(), 't2', 17);

          case 17:
            _context4.next = 19;
            return (0, _effects.select)(
              _selectors2.default.current.functionDepth
            );

          case 19:
            currentDepth = _context4.sent;
            _context4.next = 22;
            return (0, _effects.select)(
              _selectors2.default.current.location.sourceRange
            );

          case 22:
            currentRange = _context4.sent;

          case 23:
            if (
              // the function stack has not increased,
              currentDepth <= startingDepth &&
              // the current source range begins on or after the starting range
              currentRange.start >= startingRange.start &&
              // and the current range ends on or before the starting range ends
              currentRange.start + currentRange.length <=
                startingRange.start + startingRange.length
            ) {
              _context4.next = 16;
              break;
            }

          case 24:
          case 'end':
            return _context4.stop();
        }
      }
    },
    _marked4,
    this
  );
}

/**
 * Step out of the current function
 *
 * This will run until the debugger encounters a decrease in function depth.
 */
function stepOut() {
  var startingDepth, currentDepth;
  return regeneratorRuntime.wrap(
    function stepOut$(_context5) {
      while (1) {
        switch ((_context5.prev = _context5.next)) {
          case 0:
            _context5.next = 2;
            return (0, _effects.select)(
              _selectors2.default.current.location.isMultiline
            );

          case 2:
            if (!_context5.sent) {
              _context5.next = 5;
              break;
            }

            return _context5.delegateYield(stepOver(), 't0', 4);

          case 4:
            return _context5.abrupt('return');

          case 5:
            _context5.next = 7;
            return (0, _effects.select)(
              _selectors2.default.current.functionDepth
            );

          case 7:
            startingDepth = _context5.sent;

          case 8:
            return _context5.delegateYield(stepNext(), 't1', 9);

          case 9:
            _context5.next = 11;
            return (0, _effects.select)(
              _selectors2.default.current.functionDepth
            );

          case 11:
            currentDepth = _context5.sent;

          case 12:
            if (currentDepth >= startingDepth) {
              _context5.next = 8;
              break;
            }

          case 13:
          case 'end':
            return _context5.stop();
        }
      }
    },
    _marked5,
    this
  );
}

/**
 * stepOver - step over the current line
 *
 * Step over the current line. This will step to the next instruction that
 * exists on a different line of code within the same function depth.
 */
function stepOver() {
  var startingDepth, startingRange, currentDepth, currentRange;
  return regeneratorRuntime.wrap(
    function stepOver$(_context6) {
      while (1) {
        switch ((_context6.prev = _context6.next)) {
          case 0:
            _context6.next = 2;
            return (0, _effects.select)(
              _selectors2.default.current.functionDepth
            );

          case 2:
            startingDepth = _context6.sent;
            _context6.next = 5;
            return (0, _effects.select)(
              _selectors2.default.current.location.sourceRange
            );

          case 5:
            startingRange = _context6.sent;

          case 6:
            return _context6.delegateYield(stepNext(), 't0', 7);

          case 7:
            _context6.next = 9;
            return (0, _effects.select)(
              _selectors2.default.current.functionDepth
            );

          case 9:
            currentDepth = _context6.sent;
            _context6.next = 12;
            return (0, _effects.select)(
              _selectors2.default.current.location.sourceRange
            );

          case 12:
            currentRange = _context6.sent;

          case 13:
            if (
              // keep stepping provided:
              //
              // we haven't jumped out
              !(currentDepth < startingDepth) &&
              // either: function depth is greater than starting (ignore function calls)
              // or, if we're at the same depth, keep stepping until we're on a new
              // line.
              (currentDepth > startingDepth ||
                currentRange.lines.start.line == startingRange.lines.start.line)
            ) {
              _context6.next = 6;
              break;
            }

          case 14:
          case 'end':
            return _context6.stop();
        }
      }
    },
    _marked6,
    this
  );
}

/**
 * continueUntilBreakpoint - step through execution until a breakpoint
 */
function continueUntilBreakpoint(action) {
  var currentLocation,
    currentNode,
    currentLine,
    currentSourceId,
    finished,
    previousLine,
    previousSourceId,
    breakpoints,
    breakpointHit;
  return regeneratorRuntime.wrap(
    function continueUntilBreakpoint$(_context7) {
      while (1) {
        switch ((_context7.prev = _context7.next)) {
          case 0:
            if (!(action !== undefined && action.breakpoints !== undefined)) {
              _context7.next = 4;
              break;
            }

            _context7.t0 = action.breakpoints;
            _context7.next = 7;
            break;

          case 4:
            _context7.next = 6;
            return (0, _effects.select)(_selectors2.default.breakpoints);

          case 6:
            _context7.t0 = _context7.sent;

          case 7:
            breakpoints = _context7.t0;
            breakpointHit = false;
            _context7.next = 11;
            return (0, _effects.select)(_selectors2.default.current.location);

          case 11:
            currentLocation = _context7.sent;

            currentNode = currentLocation.node.id;
            currentLine = currentLocation.sourceRange.lines.start.line;
            currentSourceId = currentLocation.source.id;

          case 15:
            return _context7.delegateYield(stepNext(), 't1', 16);

          case 16:
            previousLine = currentLine;
            previousSourceId = currentSourceId;

            _context7.next = 20;
            return (0, _effects.select)(_selectors2.default.current.location);

          case 20:
            currentLocation = _context7.sent;
            _context7.next = 23;
            return (0, _effects.select)(
              _selectors2.default.current.trace.finished
            );

          case 23:
            finished = _context7.sent;

            debug('finished %o', finished);

            currentNode = currentLocation.node.id;
            currentLine = currentLocation.sourceRange.lines.start.line;
            currentSourceId = currentLocation.source.id;

            breakpointHit =
              breakpoints.filter(function(_ref) {
                var sourceId = _ref.sourceId,
                  line = _ref.line,
                  node = _ref.node;

                if (node !== undefined) {
                  debug('node %d currentNode %d', node, currentNode);
                  return sourceId === currentSourceId && node === currentNode;
                }
                //otherwise, we have a line-style breakpoint; we want to stop at the
                //*first* point on the line
                return (
                  sourceId === currentSourceId &&
                  line === currentLine &&
                  (currentSourceId !== previousSourceId ||
                    currentLine !== previousLine)
                );
              }).length > 0;

          case 29:
            if (!breakpointHit && !finished) {
              _context7.next = 15;
              break;
            }

          case 30:
          case 'end':
            return _context7.stop();
        }
      }
    },
    _marked7,
    this
  );
}

/**
 * reset -- reset the state of the debugger
 */
function reset() {
  return regeneratorRuntime.wrap(
    function reset$(_context8) {
      while (1) {
        switch ((_context8.prev = _context8.next)) {
          case 0:
            return _context8.delegateYield(data.reset(), 't0', 1);

          case 1:
            return _context8.delegateYield(evm.reset(), 't1', 2);

          case 2:
            return _context8.delegateYield(solidity.reset(), 't2', 3);

          case 3:
            return _context8.delegateYield(trace.reset(), 't3', 4);

          case 4:
          case 'end':
            return _context8.stop();
        }
      }
    },
    _marked8,
    this
  );
}
