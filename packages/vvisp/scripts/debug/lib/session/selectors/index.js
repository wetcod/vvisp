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

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _reselectTree = require('reselect-tree');

var _selectors = require('../..//evm/selectors');

var _selectors2 = _interopRequireDefault(_selectors);

var _selectors3 = require('../../trace/selectors');

var _selectors4 = _interopRequireDefault(_selectors3);

var _selectors5 = require('../../solidity/selectors');

var _selectors6 = _interopRequireDefault(_selectors5);

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

var debug = (0, _debug2.default)('debugger:session:selectors');

var session = (0, _reselectTree.createSelectorTree)({
  /*
   * session.state
   */
  state: function state(_state) {
    return _state.session;
  },

  /**
   * session.info
   */
  info: {
    /**
     * session.info.affectedInstances
     */
    affectedInstances: (0, _reselectTree.createLeaf)(
      [
        _selectors2.default.transaction.instances,
        _selectors2.default.info.contexts,
        _selectors6.default.info.sources
      ],
      function(instances, contexts, sources) {
        return Object.assign.apply(
          Object,
          [{}].concat(
            _toConsumableArray(
              Object.entries(instances).map(function(_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                  address = _ref2[0],
                  _ref2$ = _ref2[1],
                  context = _ref2$.context,
                  binary = _ref2$.binary;

                debug('instances %O', instances);
                debug('contexts %O', contexts);
                var _contexts$context = contexts[context],
                  contractName = _contexts$context.contractName,
                  primarySource = _contexts$context.primarySource;

                var source =
                  primarySource !== undefined
                    ? sources[primarySource]
                    : undefined;

                return _defineProperty({}, address, {
                  contractName: contractName,
                  source: source,
                  binary: binary
                });
              })
            )
          )
        );
      }
    )
  },

  /**
   * session.transaction (namespace)
   */
  transaction: {
    /**
     * session.transaction (selector)
     * contains the web3 transaction object
     */
    _: (0, _reselectTree.createLeaf)(['/state'], function(state) {
      return state.transaction;
    }),

    /**
     * session.transaction.receipt
     * contains the web3 receipt object
     */
    receipt: (0, _reselectTree.createLeaf)(['/state'], function(state) {
      return state.receipt;
    }),

    /**
     * session.transaction.block
     * contains the web3 block object
     */
    block: (0, _reselectTree.createLeaf)(['/state'], function(state) {
      return state.block;
    })
  },

  /*
   * session.status (namespace)
   */
  status: {
    /*
     * session.status.readyOrError
     */
    readyOrError: (0, _reselectTree.createLeaf)(['/state'], function(state) {
      return state.ready;
    }),

    /*
     * session.status.ready
     */
    ready: (0, _reselectTree.createLeaf)(
      ['./readyOrError', './isError'],
      function(readyOrError, error) {
        return readyOrError && !error;
      }
    ),

    /*
     * session.status.waiting
     */
    waiting: (0, _reselectTree.createLeaf)(['/state'], function(state) {
      return !state.ready;
    }),

    /*
     * session.status.error
     */
    error: (0, _reselectTree.createLeaf)(['/state'], function(state) {
      return state.lastLoadingError;
    }),

    /*
     * session.status.isError
     */
    isError: (0, _reselectTree.createLeaf)(['./error'], function(error) {
      return error !== null;
    }),

    /*
     * session.status.success
     */
    success: (0, _reselectTree.createLeaf)(['./error'], function(error) {
      return error === null;
    }),

    /*
     * session.status.errored
     */
    errored: (0, _reselectTree.createLeaf)(
      ['./readyOrError', './isError'],
      function(readyOrError, error) {
        return readyOrError && error;
      }
    ),

    /*
     * session.status.loaded
     */
    loaded: (0, _reselectTree.createLeaf)(
      [_selectors4.default.loaded],
      function(loaded) {
        return loaded;
      }
    ),

    /*
     * session.status.projectInfoComputed
     */
    projectInfoComputed: (0, _reselectTree.createLeaf)(['/state'], function(
      state
    ) {
      return state.projectInfoComputed;
    })
  }
});

exports.default = session;
