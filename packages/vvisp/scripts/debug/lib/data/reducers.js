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

var _redux = require('redux');

var _actions = require('./actions');

var actions = _interopRequireWildcard(_actions);

var _truffleDecoder = require('truffle-decoder');

var _helpers = require('../helpers');

var _truffleDecodeUtils = require('truffle-decode-utils');

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

var debug = (0, _debug2.default)('debugger:data:reducers');

var DEFAULT_SCOPES = {
  byId: {}
};

function scopes() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined
      ? arguments[0]
      : DEFAULT_SCOPES;
  var action = arguments[1];

  var scope;
  var variables;

  switch (action.type) {
    case actions.SCOPE:
      scope = state.byId[action.id] || {};

      return {
        byId: _extends(
          {},
          state.byId,
          _defineProperty(
            {},
            action.id,
            _extends({}, scope, {
              id: action.id,
              sourceId: action.sourceId,
              parentId: action.parentId,
              pointer: action.pointer
            })
          )
        )
      };

    case actions.DECLARE:
      scope = state.byId[action.node.scope] || {};
      variables = scope.variables || [];

      return {
        byId: _extends(
          {},
          state.byId,
          _defineProperty(
            {},
            action.node.scope,
            _extends({}, scope, {
              variables: [].concat(_toConsumableArray(variables), [
                { name: action.node.name, id: action.node.id }
              ])
            })
          )
        )
      };

    default:
      return state;
  }
}

//a note on the following reducer: solidity assigns a unique AST ID to every
//AST node among all the files being compiled together.  thus, it is, for now,
//safe to identify user-defined types solely by their AST ID.  In the future,
//once we eventually support having some files compiled separately from others,
//this will become a bug you'll have to fix, and you'll have to fix it in the
//decoder, too.  Sorry, future me! (or whoever's stuck doing this)

function userDefinedTypes() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var action = arguments[1];

  switch (action.type) {
    case actions.DEFINE_TYPE:
      return [].concat(_toConsumableArray(state), [action.node.id]);
    default:
      return state;
  }
}

var DEFAULT_ALLOCATIONS = {
  storage: {},
  memory: {},
  calldata: {}
};

function allocations() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined
      ? arguments[0]
      : DEFAULT_ALLOCATIONS;
  var action = arguments[1];

  if (action.type === actions.ALLOCATE) {
    return {
      storage: action.storage,
      memory: action.memory,
      calldata: action.calldata
    };
  } else {
    return state;
  }
}

var info = (0, _redux.combineReducers)({
  scopes: scopes,
  userDefinedTypes: userDefinedTypes,
  allocations: allocations
});

var GLOBAL_ASSIGNMENTS = [
  [{ builtin: 'msg' }, { special: 'msg' }],
  [{ builtin: 'tx' }, { special: 'tx' }],
  [{ builtin: 'block' }, { special: 'block' }],
  [{ builtin: 'this' }, { special: 'this' }],
  [{ builtin: 'now' }, { special: 'timestamp' }] //we don't have an alias "now"
].map(function(_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
    idObj = _ref2[0],
    ref = _ref2[1];

  return (0, _helpers.makeAssignment)(idObj, ref);
});

var DEFAULT_ASSIGNMENTS = {
  byId: Object.assign.apply(
    Object,
    [{}].concat(
      _toConsumableArray(
        GLOBAL_ASSIGNMENTS.map(function(assignment) {
          return _defineProperty({}, assignment.id, assignment);
        })
      )
    )
  ),
  byAstId: {}, //no regular variables assigned at start
  byBuiltin: Object.assign.apply(
    Object,
    [{}].concat(
      _toConsumableArray(
        GLOBAL_ASSIGNMENTS.map(function(assignment) {
          return _defineProperty({}, assignment.builtin, [assignment.id]);
        })
      )
    )
  )
};

function assignments() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined
      ? arguments[0]
      : DEFAULT_ASSIGNMENTS;
  var action = arguments[1];

  switch (action.type) {
    case actions.ASSIGN:
    case actions.MAP_PATH_AND_ASSIGN:
      debug('action.type %O', action.type);
      debug('action.assignments %O', action.assignments);
      return Object.values(action.assignments).reduce(function(
        acc,
        assignment
      ) {
        var id = assignment.id,
          astId = assignment.astId;
        //we assume for now that only ordinary variables will be assigned this
        //way, and not globals; globals are handled in DEFAULT_ASSIGNMENTS

        return _extends({}, acc, {
          byId: _extends({}, acc.byId, _defineProperty({}, id, assignment)),
          byAstId: _extends(
            {},
            acc.byAstId,
            _defineProperty(
              {},
              astId,
              [].concat(
                _toConsumableArray(
                  new Set(
                    [].concat(_toConsumableArray(acc.byAstId[astId] || []), [
                      id
                    ])
                  )
                )
              )
            )
          )
        });
      },
      state);

    case actions.RESET:
      return DEFAULT_ASSIGNMENTS;

    default:
      return state;
  }
}

var DEFAULT_PATHS = {
  byAddress: {}
};

//WARNING: do *not* rely on mappedPaths to keep track of paths that do not
//involve mapping keys!  Yes, many will get mapped, but there is no guarantee.
//Only when mapping keys are involved does it necessarily work reliably --
//which is fine, as that's all we need it for.
function mappedPaths() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined
      ? arguments[0]
      : DEFAULT_PATHS;
  var action = arguments[1];

  switch (action.type) {
    case actions.MAP_PATH_AND_ASSIGN:
      var address = action.address,
        slot = action.slot,
        typeIdentifier = action.typeIdentifier,
        parentType = action.parentType;
      //how this case works: first, we find the spot in our table (based on
      //address, type identifier, and slot address) where the new entry should
      //be added; if needed we set up all the objects needed along the way.  If
      //there's already something there, we do nothing.  If there's nothing
      //there, we record our given slot in that spot in that table -- however,
      //we alter it in one key way.  Before entry, we check if the slot's
      //*parent* has a spot in the table, based on address (same for both child
      //and parent), parentType, and the parent's slot address (which can be
      //found as the slotAddress of the slot's path object, if it exists -- if
      //it doesn't then we conclude that no the parent does not have a spot in
      //the table).  If the parent has a slot in the table already, then we
      //alter the child slot by replacing its path with the parent slot.  This
      //will keep the slotAddress the same, but since the versions kept in the
      //table here are supposed to preserve path information, we'll be
      //replacing a fairly bare-bones Slot object with one with a full path.

      //we do NOT want to distinguish between types with and without "_ptr" on
      //the end here!

      debug('typeIdentifier %s', typeIdentifier);
      typeIdentifier = _truffleDecodeUtils.Definition.restorePtr(
        typeIdentifier
      );
      parentType = _truffleDecodeUtils.Definition.restorePtr(parentType);

      debug('slot %o', slot);
      var hexSlotAddress = _truffleDecodeUtils.Conversion.toHexString(
        (0, _truffleDecoder.slotAddress)(slot),
        _truffleDecodeUtils.EVM.WORD_SIZE
      );
      var parentAddress = slot.path
        ? _truffleDecodeUtils.Conversion.toHexString(
            (0, _truffleDecoder.slotAddress)(slot.path),
            _truffleDecodeUtils.EVM.WORD_SIZE
          )
        : undefined;

      //this is going to be messy and procedural, sorry.  but let's start with
      //the easy stuff: create the new address if needed, clone if not
      var newState = _extends({}, state, {
        byAddress: _extends(
          {},
          state.byAddress,
          _defineProperty({}, address, {
            byType: _extends(
              {},
              (state.byAddress[address] || { byType: {} }).byType
            )
          })
        )
      });

      //now, let's add in the new type, if needed
      newState.byAddress[address].byType = _extends(
        {},
        newState.byAddress[address].byType,
        _defineProperty({}, typeIdentifier, {
          bySlotAddress: _extends(
            {},
            (
              newState.byAddress[address].byType[typeIdentifier] || {
                bySlotAddress: {}
              }
            ).bySlotAddress
          )
        })
      );

      var oldSlot =
        newState.byAddress[address].byType[typeIdentifier].bySlotAddress[
          hexSlotAddress
        ];
      //yes, this looks strange, but we haven't changed it yet except to
      //clone or create empty (and we don't want undefined!)
      //now: is there something already there or no?  if no, we must add
      if (oldSlot === undefined) {
        var newSlot = void 0;
        debug('parentAddress %o', parentAddress);
        if (
          parentAddress !== undefined &&
          newState.byAddress[address].byType[parentType] &&
          newState.byAddress[address].byType[parentType].bySlotAddress[
            parentAddress
          ]
        ) {
          //if the parent is already present, use that instead of the given
          //parent!
          newSlot = _extends({}, slot, {
            path:
              newState.byAddress[address].byType[parentType].bySlotAddress[
                parentAddress
              ]
          });
        } else {
          newSlot = slot;
        }
        newState.byAddress[address].byType[typeIdentifier].bySlotAddress[
          hexSlotAddress
        ] = newSlot;
      }
      //if there's already something there, we don't need to do anything

      return newState;

    case actions.RESET:
      return DEFAULT_PATHS;

    default:
      return state;
  }
}

var proc = (0, _redux.combineReducers)({
  assignments: assignments,
  mappedPaths: mappedPaths
});

var reducer = (0, _redux.combineReducers)({
  info: info,
  proc: proc
});

exports.default = reducer;
