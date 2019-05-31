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

exports.getRange = getRange;
exports.rangeNodes = rangeNodes;
exports.findOverlappingRange = findOverlappingRange;
exports.findRange = findRange;
exports.anyNonSkippedInRange = anyNonSkippedInRange;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _nodeIntervalTree = require('node-interval-tree');

var _nodeIntervalTree2 = _interopRequireDefault(_nodeIntervalTree);

var _jsonPointer = require('json-pointer');

var _jsonPointer2 = _interopRequireDefault(_jsonPointer);

var _helpers = require('../helpers');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
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

var debug = (0, _debug2.default)('debugger:ast:map');

/**
 * @private
 */
function getRange(node) {
  // src: "<start>:<length>:<_>"
  // returns [start, end]
  var _node$src$split$slice = node.src
      .split(':')
      .slice(0, 2)
      .map(function(i) {
        return parseInt(i);
      }),
    _node$src$split$slice2 = _slicedToArray(_node$src$split$slice, 2),
    start = _node$src$split$slice2[0],
    length = _node$src$split$slice2[1];

  return [start, start + length];
}

/**
 * @private
 */
function rangeNodes(node) {
  var pointer =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  if (node instanceof Array) {
    var _ref;

    return (_ref = []).concat.apply(
      _ref,
      _toConsumableArray(
        node.map(function(sub, i) {
          return rangeNodes(sub, pointer + '/' + i);
        })
      )
    );
  } else if (node instanceof Object) {
    var results = [];

    if (node.src !== undefined && node.id !== undefined) {
      //there are some "pseudo-nodes" with a src but no id.
      //these will cause problems, so we want to exclude them.
      //(to my knowledge this only happens with the externalReferences
      //to an InlineAssembly node, so excluding them just means we find
      //the InlineAssembly node instead, which is fine)
      results.push({ pointer: pointer, range: getRange(node) });
    }

    return results.concat.apply(
      results,
      _toConsumableArray(
        Object.keys(node).map(function(key) {
          return rangeNodes(node[key], pointer + '/' + key);
        })
      )
    );
  } else {
    return [];
  }
}

/**
 * @private
 */
function findOverlappingRange(node, sourceStart, sourceLength) {
  var ranges = rangeNodes(node);
  var tree = new _nodeIntervalTree2.default();

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (
      var _iterator = ranges[Symbol.iterator](), _step;
      !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
      _iteratorNormalCompletion = true
    ) {
      var _step$value = _step.value,
        range = _step$value.range,
        pointer = _step$value.pointer;

      var _range = _slicedToArray(range, 2),
        start = _range[0],
        end = _range[1];

      tree.insert(start, end, { range: range, pointer: pointer });
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

  var sourceEnd = sourceStart + sourceLength;

  return tree.search(sourceStart, sourceEnd);
  //returns everything overlapping the given range
}

/**
 * @private
 */
function findRange(node, sourceStart, sourceLength) {
  // find nodes that fully contain requested range,
  // return longest pointer
  var sourceEnd = sourceStart + sourceLength;
  return findOverlappingRange(node, sourceStart, sourceLength)
    .filter(function(_ref2) {
      var range = _ref2.range;
      return sourceStart >= range[0] && sourceEnd <= range[1];
    })
    .map(function(_ref3) {
      var pointer = _ref3.pointer;
      return pointer;
    })
    .reduce(function(a, b) {
      return a.length > b.length ? a : b;
    }, '');
}

/**
 * @private
 */
function anyNonSkippedInRange(node, sourceStart, sourceLength) {
  var sourceEnd = sourceStart + sourceLength;
  return findOverlappingRange(node, sourceStart, sourceLength).some(
    function(_ref4) {
      var range = _ref4.range,
        pointer = _ref4.pointer;
      return (
        sourceStart <= range[0] && //we want to go by starting line
        range[0] < sourceEnd &&
        !(0, _helpers.isSkippedNodeType)(
          _jsonPointer2.default.get(node, pointer)
        )
      );
    }
    //NOTE: this doesn't actually catch everything skipped!  But doing better
    //is hard
  );
}
