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

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _reselectTree = require('reselect-tree');

var _selectors = require('../../evm/selectors');

var _selectors2 = _interopRequireDefault(_selectors);

var _selectors3 = require('../../solidity/selectors');

var _selectors4 = _interopRequireDefault(_selectors3);

var _selectors5 = require('../../trace/selectors');

var _selectors6 = _interopRequireDefault(_selectors5);

var _map = require('../../ast/map');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var debug = (0, _debug2.default)('debugger:controller:selectors'); //eslint-disable-line no-unused-vars

/**
 * @private
 */
var identity = function identity(x) {
  return x;
};

/**
 * controller
 */
var controller = (0, _reselectTree.createSelectorTree)({
  /**
   * controller.state
   */
  state: function state(_state) {
    return _state.controller;
  },
  /**
   * controller.current
   */
  current: {
    /**
     * controller.current.functionDepth
     */
    functionDepth: (0, _reselectTree.createLeaf)(
      [_selectors4.default.current.functionDepth],
      identity
    ),

    /**
     * controller.current.executionContext
     */
    executionContext: (0, _reselectTree.createLeaf)(
      [_selectors2.default.current.call],
      identity
    ),

    /**
     * controller.current.willJump
     */
    willJump: (0, _reselectTree.createLeaf)(
      [_selectors2.default.current.step.isJump],
      identity
    ),

    /**
     * controller.current.location
     */
    location: {
      /**
       * controller.current.location.sourceRange
       */
      sourceRange: (0, _reselectTree.createLeaf)(
        [_selectors4.default.current.sourceRange, '/current/trace/loaded'],
        function(range, loaded) {
          return loaded ? range : null;
        }
      ),

      /**
       * controller.current.location.source
       */
      source: (0, _reselectTree.createLeaf)(
        [_selectors4.default.current.source, '/current/trace/loaded'],
        function(source, loaded) {
          return loaded ? source : null;
        }
      ),

      /**
       * controller.current.location.node
       */
      node: (0, _reselectTree.createLeaf)(
        [_selectors4.default.current.node, '/current/trace/loaded'],
        function(node, loaded) {
          return loaded ? node : null;
        }
      ),

      /**
       * controller.current.location.isMultiline
       */
      isMultiline: (0, _reselectTree.createLeaf)(
        [_selectors4.default.current.isMultiline, '/current/trace/loaded'],
        function(raw, loaded) {
          return loaded ? raw : false;
        }
      )
    },

    /*
     * controller.current.trace
     */
    trace: {
      /**
       * controller.current.trace.finished
       */
      finished: (0, _reselectTree.createLeaf)(
        [_selectors6.default.finished],
        identity
      ),

      /**
       * controller.current.trace.loaded
       */
      loaded: (0, _reselectTree.createLeaf)(
        [_selectors6.default.loaded],
        identity
      )
    }
  },

  /**
   * controller.breakpoints (namespace)
   */
  breakpoints: {
    /**
     * controller.breakpoints (selector)
     */
    _: (0, _reselectTree.createLeaf)(['/state'], function(state) {
      return state.breakpoints;
    }),

    /**
     * controller.breakpoints.resolver (selector)
     * this selector returns a function that adjusts a given line-based
     * breakpoint (on node-based breakpoints it simply returns the input) by
     * repeatedly moving it down a line until it lands on a line where there's
     * actually somewhere to break.  if no such line exists beyond that point, it
     * returns null instead.
     */
    resolver: (0, _reselectTree.createLeaf)(
      [_selectors4.default.info.sources],
      function(sources) {
        return function(breakpoint) {
          var adjustedBreakpoint = void 0;
          if (breakpoint.node === undefined) {
            var line = breakpoint.line;
            var _sources$breakpoint$s = sources[breakpoint.sourceId],
              source = _sources$breakpoint$s.source,
              ast = _sources$breakpoint$s.ast;

            var lineLengths = source.split('\n').map(function(line) {
              return line.length;
            });
            //why does neither JS nor lodash have a scan function like Haskell??
            //guess we'll have to do our scan manually
            var lineStarts = [0];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (
                var _iterator = lineLengths[Symbol.iterator](), _step;
                !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
                _iteratorNormalCompletion = true
              ) {
                var length = _step.value;

                lineStarts.push(lineStarts[lineStarts.length - 1] + length + 1);
                //+1 for the /n itself
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }

            debug(
              'line: %s',
              source.slice(
                lineStarts[line],
                lineStarts[line] + lineLengths[line]
              )
            );
            while (
              line < lineLengths.length &&
              !(0, _map.anyNonSkippedInRange)(
                ast,
                lineStarts[line],
                lineLengths[line]
              )
            ) {
              debug('incrementing');
              line++;
            }
            if (line >= lineLengths.length) {
              adjustedBreakpoint = null;
            } else {
              adjustedBreakpoint = _extends({}, breakpoint, { line: line });
            }
          } else {
            debug('node-based breakpoint');
            adjustedBreakpoint = breakpoint;
          }
          return adjustedBreakpoint;
        };
      }
    )
  },

  /**
   * controller.finished
   * deprecated alias for controller.current.trace.finished
   */
  finished: (0, _reselectTree.createLeaf)(['/current/finished'], function(
    finished
  ) {
    return finished;
  }),

  /**
   * controller.isStepping
   */
  isStepping: (0, _reselectTree.createLeaf)(['./state'], function(state) {
    return state.isStepping;
  })
});

exports.default = controller;
