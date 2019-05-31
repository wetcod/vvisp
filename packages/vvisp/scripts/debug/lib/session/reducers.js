'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _redux = require('redux');

var _reducers = require('../data/reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _reducers3 = require('../evm/reducers');

var _reducers4 = _interopRequireDefault(_reducers3);

var _reducers5 = require('../solidity/reducers');

var _reducers6 = _interopRequireDefault(_reducers5);

var _reducers7 = require('../trace/reducers');

var _reducers8 = _interopRequireDefault(_reducers7);

var _reducers9 = require('../controller/reducers');

var _reducers10 = _interopRequireDefault(_reducers9);

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

var debug = (0, _debug2.default)('debugger:session:reducers');

function ready() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var action = arguments[1];

  switch (action.type) {
    case actions.READY:
      debug('readying');
      return true;

    case actions.WAIT:
      return false;

    default:
      return state;
  }
}

function projectInfoComputed() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var action = arguments[1];

  switch (action.type) {
    case actions.PROJECT_INFO_COMPUTED:
      return true;
    default:
      return state;
  }
}

function lastLoadingError() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var action = arguments[1];

  switch (action.type) {
    case actions.ERROR:
      debug('error: %o', action.error);
      return action.error;

    case actions.WAIT:
      return null;

    default:
      return state;
  }
}

function transaction() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  switch (action.type) {
    case actions.SAVE_TRANSACTION:
      return action.transaction;
    case actions.UNLOAD_TRANSACTION:
      return {};
    default:
      return state;
  }
}

function receipt() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  switch (action.type) {
    case actions.SAVE_RECEIPT:
      return action.receipt;
    case actions.UNLOAD_TRANSACTION:
      return {};
    default:
      return state;
  }
}

function block() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  switch (action.type) {
    case actions.SAVE_BLOCK:
      return action.block;
    case actions.UNLOAD_TRANSACTION:
      return {};
    default:
      return state;
  }
}

var session = (0, _redux.combineReducers)({
  ready: ready,
  lastLoadingError: lastLoadingError,
  projectInfoComputed: projectInfoComputed,
  transaction: transaction,
  receipt: receipt,
  block: block
});

var reduceState = (0, _redux.combineReducers)({
  session: session,
  data: _reducers2.default,
  evm: _reducers4.default,
  solidity: _reducers6.default,
  trace: _reducers8.default,
  controller: _reducers10.default
});

exports.default = reduceState;
