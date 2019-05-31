'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _reselectTree = require('reselect-tree');

var _selectors = require('../../solidity/selectors');

var _selectors2 = _interopRequireDefault(_selectors);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var debug = (0, _debug2.default)('debugger:ast:selectors');

/**
 * ast
 */
var ast = (0, _reselectTree.createSelectorTree)({
  /**
   * ast.views
   */
  views: {
    /**
     * ast.views.sources
     */
    sources: (0, _reselectTree.createLeaf)(
      [_selectors2.default.info.sources],
      function(sources) {
        return sources;
      }
    )
  }
});

exports.default = ast;
