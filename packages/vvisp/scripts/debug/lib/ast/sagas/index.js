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

exports.visitAll = visitAll;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _effects = require('redux-saga/effects');

var _sagas = require('../../data/sagas');

var data = _interopRequireWildcard(_sagas);

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

var _marked = /*#__PURE__*/ regeneratorRuntime.mark(walk),
  _marked2 = /*#__PURE__*/ regeneratorRuntime.mark(handleEnter),
  _marked3 = /*#__PURE__*/ regeneratorRuntime.mark(handleExit),
  _marked4 = /*#__PURE__*/ regeneratorRuntime.mark(visitAll);

var debug = (0, _debug2.default)('debugger:ast:sagas');

function walk(sourceId, node) {
  var pointer =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  var parentId =
    arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  var _iteratorNormalCompletion,
    _didIteratorError,
    _iteratorError,
    _iterator,
    _step,
    _step$value,
    i,
    child,
    _iteratorNormalCompletion2,
    _didIteratorError2,
    _iteratorError2,
    _iterator2,
    _step2,
    _step2$value,
    key;

  return regeneratorRuntime.wrap(
    function walk$(_context) {
      while (1) {
        switch ((_context.prev = _context.next)) {
          case 0:
            debug('walking %o %o', pointer, node);

            return _context.delegateYield(
              handleEnter(sourceId, node, pointer, parentId),
              't0',
              2
            );

          case 2:
            if (!(node instanceof Array)) {
              _context.next = 31;
              break;
            }

            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 6;
            _iterator = node.entries()[Symbol.iterator]();

          case 8:
            if ((_iteratorNormalCompletion = (_step = _iterator.next()).done)) {
              _context.next = 15;
              break;
            }

            (_step$value = _slicedToArray(_step.value, 2)),
              (i = _step$value[0]),
              (child = _step$value[1]);
            _context.next = 12;
            return (0, _effects.call)(
              walk,
              sourceId,
              child,
              pointer + '/' + i,
              parentId
            );

          case 12:
            _iteratorNormalCompletion = true;
            _context.next = 8;
            break;

          case 15:
            _context.next = 21;
            break;

          case 17:
            _context.prev = 17;
            _context.t1 = _context['catch'](6);
            _didIteratorError = true;
            _iteratorError = _context.t1;

          case 21:
            _context.prev = 21;
            _context.prev = 22;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 24:
            _context.prev = 24;

            if (!_didIteratorError) {
              _context.next = 27;
              break;
            }

            throw _iteratorError;

          case 27:
            return _context.finish(24);

          case 28:
            return _context.finish(21);

          case 29:
            _context.next = 58;
            break;

          case 31:
            if (!(node instanceof Object)) {
              _context.next = 58;
              break;
            }

            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context.prev = 35;
            _iterator2 = Object.entries(node)[Symbol.iterator]();

          case 37:
            if (
              (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done)
            ) {
              _context.next = 44;
              break;
            }

            (_step2$value = _slicedToArray(_step2.value, 2)),
              (key = _step2$value[0]),
              (child = _step2$value[1]);
            _context.next = 41;
            return (0, _effects.call)(
              walk,
              sourceId,
              child,
              pointer + '/' + key,
              node.id
            );

          case 41:
            _iteratorNormalCompletion2 = true;
            _context.next = 37;
            break;

          case 44:
            _context.next = 50;
            break;

          case 46:
            _context.prev = 46;
            _context.t2 = _context['catch'](35);
            _didIteratorError2 = true;
            _iteratorError2 = _context.t2;

          case 50:
            _context.prev = 50;
            _context.prev = 51;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 53:
            _context.prev = 53;

            if (!_didIteratorError2) {
              _context.next = 56;
              break;
            }

            throw _iteratorError2;

          case 56:
            return _context.finish(53);

          case 57:
            return _context.finish(50);

          case 58:
            return _context.delegateYield(
              handleExit(sourceId, node, pointer),
              't3',
              59
            );

          case 59:
          case 'end':
            return _context.stop();
        }
      }
    },
    _marked,
    this,
    [[6, 17, 21, 29], [22, , 24, 28], [35, 46, 50, 58], [51, , 53, 57]]
  );
}

function handleEnter(sourceId, node, pointer, parentId) {
  return regeneratorRuntime.wrap(
    function handleEnter$(_context2) {
      while (1) {
        switch ((_context2.prev = _context2.next)) {
          case 0:
            if (node instanceof Object) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt('return');

          case 2:
            debug('entering %s', pointer);

            if (!(node.id !== undefined)) {
              _context2.next = 6;
              break;
            }

            debug('%s recording scope %s', pointer, node.id);
            return _context2.delegateYield(
              data.scope(node.id, pointer, parentId, sourceId),
              't0',
              6
            );

          case 6:
            _context2.t1 = node.nodeType;
            _context2.next =
              _context2.t1 === 'VariableDeclaration'
                ? 9
                : _context2.t1 === 'ContractDefinition'
                ? 12
                : _context2.t1 === 'StructDefinition'
                ? 12
                : _context2.t1 === 'EnumDefinition'
                ? 12
                : 14;
            break;

          case 9:
            debug('%s recording variable %o', pointer, node);
            return _context2.delegateYield(data.declare(node), 't2', 11);

          case 11:
            return _context2.abrupt('break', 14);

          case 12:
            return _context2.delegateYield(data.defineType(node), 't3', 13);

          case 13:
            return _context2.abrupt('break', 14);

          case 14:
          case 'end':
            return _context2.stop();
        }
      }
    },
    _marked2,
    this
  );
}

function handleExit(sourceId, node, pointer) {
  return regeneratorRuntime.wrap(
    function handleExit$(_context3) {
      while (1) {
        switch ((_context3.prev = _context3.next)) {
          case 0:
            debug('exiting %s', pointer);

          // no-op right now

          case 1:
          case 'end':
            return _context3.stop();
        }
      }
    },
    _marked3,
    this
  );
}

function visitAll() {
  var sources;
  return regeneratorRuntime.wrap(
    function visitAll$(_context4) {
      while (1) {
        switch ((_context4.prev = _context4.next)) {
          case 0:
            _context4.next = 2;
            return (0, _effects.select)(_selectors2.default.views.sources);

          case 2:
            sources = _context4.sent;
            _context4.next = 5;
            return (0, _effects.all)(
              Object.entries(sources)
                .filter(function(_ref) {
                  var _ref2 = _slicedToArray(_ref, 2),
                    _ = _ref2[0],
                    source = _ref2[1];

                  return source.ast;
                })
                .map(function(_ref3) {
                  var _ref4 = _slicedToArray(_ref3, 2),
                    id = _ref4[0],
                    ast = _ref4[1].ast;

                  return (0, _effects.call)(walk, id, ast);
                })
            );

          case 5:
            debug('done visiting');

          case 6:
          case 'end':
            return _context4.stop();
        }
      }
    },
    _marked4,
    this
  );
}
