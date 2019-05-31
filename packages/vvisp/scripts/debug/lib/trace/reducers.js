'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _redux = require('redux');

var _actions = require('./actions');

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

var debug = (0, _debug2.default)('debugger:trace:reducers');

function index() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var action = arguments[1];

  switch (action.type) {
    case actions.TOCK:
      return state + 1;

    case actions.RESET:
    case actions.UNLOAD_TRANSACTION:
      return 0;

    default:
      return state;
  }
}

function finished() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var action = arguments[1];

  switch (action.type) {
    case actions.END_OF_TRACE:
      return true;

    case actions.RESET:
    case actions.UNLOAD_TRANSACTION:
      return false;

    default:
      return state;
  }
}

function steps() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var action = arguments[1];

  switch (action.type) {
    case actions.SAVE_STEPS:
      return action.steps;
    case actions.UNLOAD_TRANSACTION:
      debug('unloading');
      return null;
    default:
      return state;
  }
}

var transaction = (0, _redux.combineReducers)({
  steps: steps
});

var proc = (0, _redux.combineReducers)({
  index: index,
  finished: finished
});

var reducer = (0, _redux.combineReducers)({
  transaction: transaction,
  proc: proc
});

exports.default = reducer;
