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

var debug = (0, _debug2.default)('debugger:controller:reducers');

function breakpoints() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var action = arguments[1];

  switch (action.type) {
    case actions.ADD_BREAKPOINT:
      //check for any existing identical breakpoints to avoid redundancy
      if (
        state.filter(
          function(breakpoint) {
            return (
              breakpoint.sourceId === action.breakpoint.sourceId &&
              breakpoint.line === action.breakpoint.line &&
              breakpoint.node === action.breakpoint.node
            );
          } //may be undefined
        ).length > 0
      ) {
        //if it's already there, do nothing
        return state;
      } else {
        //otherwise add it
        return state.concat([action.breakpoint]);
      }
      break;

    case actions.REMOVE_BREAKPOINT:
      return state.filter(
        function(breakpoint) {
          return (
            breakpoint.sourceId !== action.breakpoint.sourceId ||
            breakpoint.line !== action.breakpoint.line ||
            breakpoint.node !== action.breakpoint.node
          );
        } //may be undefined
      );
      break;

    case actions.REMOVE_ALL_BREAKPOINTS:
      return [];

    default:
      return state;
  }
}

function isStepping() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var action = arguments[1];

  switch (action.type) {
    case actions.START_STEPPING:
      debug('got step start action');
      return true;
    case actions.DONE_STEPPING:
      debug('got step stop action');
      return false;
    default:
      return state;
  }
}

var reducer = (0, _redux.combineReducers)({
  breakpoints: breakpoints,
  isStepping: isStepping
});

exports.default = reducer;
