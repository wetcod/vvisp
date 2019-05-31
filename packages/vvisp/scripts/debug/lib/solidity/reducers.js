'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends =
  Object.assign ||
  function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };

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

var DEFAULT_SOURCES = {
  byId: {}
};

function sources() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined
      ? arguments[0]
      : DEFAULT_SOURCES;
  var action = arguments[1];

  switch (action.type) {
    /*
     * Adding a new source
     */
    case actions.ADD_SOURCE:
      var ast = action.ast,
        source = action.source,
        sourcePath = action.sourcePath,
        compiler = action.compiler;

      var id = Object.keys(state.byId).length;

      return {
        byId: _extends(
          {},
          state.byId,
          _defineProperty({}, id, {
            id: id,
            ast: ast,
            source: source,
            sourcePath: sourcePath,
            compiler: compiler
          })
        )
      };

    /*
     * Default case
     */
    default:
      return state;
  }
}

var info = (0, _redux.combineReducers)({
  sources: sources
});

function functionDepthStack() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [0];
  var action = arguments[1];

  switch (action.type) {
    case actions.JUMP:
      var newState = state.slice(); //clone the state
      var delta = spelunk(action.jumpDirection);
      var top = newState[newState.length - 1];
      newState[newState.length - 1] = top + delta;
      return newState;

    case actions.RESET:
      return [0];

    case actions.EXTERNAL_CALL:
      return [].concat(_toConsumableArray(state), [
        state[state.length - 1] + 1
      ]);

    case actions.EXTERNAL_RETURN:
      //just pop the stack! unless, HACK, that would leave it empty
      return state.length > 1 ? state.slice(0, -1) : state;

    default:
      return state;
  }
}

function spelunk(jump) {
  if (jump === 'i') {
    return 1;
  } else if (jump === 'o') {
    return -1;
  } else {
    return 0;
  }
}

var proc = (0, _redux.combineReducers)({
  functionDepthStack: functionDepthStack
});

var reducer = (0, _redux.combineReducers)({
  info: info,
  proc: proc
});

exports.default = reducer;
