'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function() {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;
    try {
      for (
        var _i = arr[Symbol.iterator](), _s;
        !(_n = (_s = _i.next()).done);
        _n = true
      ) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i['return']) _i['return']();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  return function(arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError(
        'Invalid attempt to destructure non-iterable instance'
      );
    }
  };
})();

exports.abbreviateValues = abbreviateValues;
exports.default = configureStore;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _redux = require('redux');

var _reduxSaga = require('redux-saga');

var _reduxSaga2 = _interopRequireDefault(_reduxSaga);

var _reduxCliLogger = require('redux-cli-logger');

var _reduxCliLogger2 = _interopRequireDefault(_reduxCliLogger);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
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

var debug = (0, _debug2.default)('debugger:store:common');
var reduxDebug = (0, _debug2.default)('debugger:redux');

function abbreviateValues(value) {
  var options =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var depth =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  options.stringLimit = options.stringLimit || 66;
  options.arrayLimit = options.arrayLimit || 8;
  options.recurseLimit = options.recurseLimit || 4;

  if (depth > options.recurseLimit) {
    return '...';
  }

  var recurse = function recurse(child) {
    return abbreviateValues(child, options, depth + 1);
  };

  if (value instanceof Array) {
    if (value.length > options.arrayLimit) {
      value = [].concat(
        _toConsumableArray(value.slice(0, options.arrayLimit / 2)),
        ['...'],
        _toConsumableArray(
          value.slice(value.length - options.arrayLimit / 2 + 1)
        )
      );
    }

    return value.map(recurse);
  } else if (value instanceof Object) {
    return Object.assign.apply(
      Object,
      [{}].concat(
        _toConsumableArray(
          Object.entries(value).map(function(_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
              k = _ref2[0],
              v = _ref2[1];

            return _defineProperty({}, recurse(k), recurse(v));
          })
        )
      )
    );
  } else if (typeof value === 'string' && value.length > options.stringLimit) {
    var inner = '...';
    var extractAmount = (options.stringLimit - inner.length) / 2;
    var leading = value.slice(0, Math.ceil(extractAmount));
    var trailing = value.slice(value.length - Math.floor(extractAmount));
    return '' + leading + inner + trailing;
  } else {
    return value;
  }
}

function configureStore(reducer, saga, initialState, composeEnhancers) {
  var sagaMiddleware = (0, _reduxSaga2.default)();

  if (!composeEnhancers) {
    composeEnhancers = _redux.compose;
  }

  var loggerMiddleware = (0, _reduxCliLogger2.default)({
    log: reduxDebug,
    stateTransformer: function stateTransformer(state) {
      return abbreviateValues(state, {
        arrayLimit: 4,
        recurseLimit: 3
      });
    },
    actionTransformer: abbreviateValues
  });

  var store = (0, _redux.createStore)(
    reducer,
    initialState,
    composeEnhancers(
      (0, _redux.applyMiddleware)(sagaMiddleware, loggerMiddleware)
    )
  );

  sagaMiddleware.run(saga);

  return { store: store, sagaMiddleware: sagaMiddleware };
}
