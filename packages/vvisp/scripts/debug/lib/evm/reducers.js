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

var _redux = require('redux');

var _actions = require('./actions');

var actions = _interopRequireWildcard(_actions);

var _helpers = require('../helpers');

var _truffleDecodeUtils = require('truffle-decode-utils');

var DecodeUtils = _interopRequireWildcard(_truffleDecodeUtils);

var _bn = require('bn.js');

var _bn2 = _interopRequireDefault(_bn);

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

var debug = (0, _debug2.default)('debugger:evm:reducers');

var DEFAULT_CONTEXTS = {
  byContext: {}
};

function contexts() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined
      ? arguments[0]
      : DEFAULT_CONTEXTS;
  var action = arguments[1];

  switch (action.type) {
    /*
     * Adding a new context
     */
    case actions.ADD_CONTEXT:
      var contractName = action.contractName,
        binary = action.binary,
        sourceMap = action.sourceMap,
        compiler = action.compiler,
        abi = action.abi,
        contractId = action.contractId,
        contractKind = action.contractKind,
        isConstructor = action.isConstructor;

      debug('action %O', action);
      //NOTE: we take hash as *string*, not as bytes, because the binary may
      //contain link references!
      var context = (0, _helpers.keccak256)({ type: 'string', value: binary });
      var primarySource = void 0;
      if (sourceMap !== undefined) {
        primarySource = (0, _helpers.extractPrimarySource)(sourceMap);
      }
      //otherwise leave it undefined

      return _extends({}, state, {
        byContext: _extends(
          {},
          state.byContext,
          _defineProperty({}, context, {
            contractName: contractName,
            context: context,
            binary: binary,
            sourceMap: sourceMap,
            primarySource: primarySource,
            compiler: compiler,
            abi: abi,
            contractId: contractId,
            contractKind: contractKind,
            isConstructor: isConstructor
          })
        )
      });

    case actions.NORMALIZE_CONTEXTS:
      return {
        byContext: DecodeUtils.Contexts.normalizeContexts(state.byContext)
      };

    /*
     * Default case
     */
    default:
      return state;
  }
}

var DEFAULT_INSTANCES = {
  byAddress: {},
  byContext: {}
};

function instances() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined
      ? arguments[0]
      : DEFAULT_INSTANCES;
  var action = arguments[1];

  switch (action.type) {
    /*
     * Adding a new address for context
     */
    case actions.ADD_INSTANCE:
      var address = action.address,
        context = action.context,
        binary = action.binary;

      // get known addresses for this context

      var otherInstances = state.byContext[context] || [];
      var otherAddresses = otherInstances.map(function(_ref) {
        var address = _ref.address;
        return address;
      });

      return {
        byAddress: _extends(
          {},
          state.byAddress,
          _defineProperty({}, address, {
            address: address,
            context: context,
            binary: binary
          })
        ),

        byContext: _extends(
          {},
          state.byContext,
          _defineProperty(
            {},
            context,
            Array.from(new Set(otherAddresses).add(address)).map(function(
              address
            ) {
              return { address: address };
            })
          )
        )
      };
    case actions.UNLOAD_TRANSACTION:
      return DEFAULT_INSTANCES;

    /*
     * Default case
     */
    default:
      return state;
  }
}

var DEFAULT_TX = {
  gasprice: new _bn2.default(0),
  origin: DecodeUtils.EVM.ZERO_ADDRESS
};

function tx() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined
      ? arguments[0]
      : DEFAULT_TX;
  var action = arguments[1];

  switch (action.type) {
    case actions.SAVE_GLOBALS:
      var gasprice = action.gasprice,
        origin = action.origin;

      return { gasprice: gasprice, origin: origin };
    case actions.UNLOAD_TRANSACTION:
      return DEFAULT_TX;
    default:
      return state;
  }
}

var DEFAULT_BLOCK = {
  coinbase: DecodeUtils.EVM.ZERO_ADDRESS,
  difficulty: new _bn2.default(0),
  gaslimit: new _bn2.default(0),
  number: new _bn2.default(0),
  timestamp: new _bn2.default(0)
};

function block() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined
      ? arguments[0]
      : DEFAULT_BLOCK;
  var action = arguments[1];

  switch (action.type) {
    case actions.SAVE_GLOBALS:
      return action.block;
    case actions.UNLOAD_TRANSACTION:
      return DEFAULT_BLOCK;
    default:
      return state;
  }
}

var globals = (0, _redux.combineReducers)({
  tx: tx,
  block: block
});

var info = (0, _redux.combineReducers)({
  contexts: contexts
});

var transaction = (0, _redux.combineReducers)({
  instances: instances,
  globals: globals
});

function callstack() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var action = arguments[1];

  switch (action.type) {
    case actions.CALL: {
      var address = action.address,
        data = action.data,
        storageAddress = action.storageAddress,
        sender = action.sender,
        value = action.value;

      return state.concat([
        {
          address: address,
          data: data,
          storageAddress: storageAddress,
          sender: sender,
          value: value
        }
      ]);
    }

    case actions.CREATE: {
      var binary = action.binary,
        _storageAddress = action.storageAddress,
        _sender = action.sender,
        _value = action.value;

      return state.concat(
        [
          {
            binary: binary,
            data: '0x',
            storageAddress: _storageAddress,
            sender: _sender,
            value: _value
          }
        ]
        //the empty data field is to make msg.data and msg.sig come out right
      );
    }

    case actions.RETURN:
    case actions.FAIL:
      //pop the stack... unless (HACK) that would leave it empty (this will
      //only happen at the end when we want to keep the last one around)
      return state.length > 1 ? state.slice(0, -1) : state;

    case actions.RESET:
      return [state[0]]; //leave the initial call still on the stack

    case actions.UNLOAD_TRANSACTION:
      return [];

    default:
      return state;
  }
}

//default codex stackframe with a single address (or none if address not
//supplied)
function defaultCodexFrame(address) {
  if (address !== undefined) {
    return {
      //there will be more here in the future!
      accounts: _defineProperty({}, address, {
        //there will be more here in the future!
        storage: {}
      })
    };
  } else {
    return {
      //there will be more here in the future!
      accounts: {}
    };
  }
}

function codex() {
  var state =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var action = arguments[1];

  var newState = void 0,
    topCodex = void 0;

  var updateFrameStorage = function updateFrameStorage(
    frame,
    address,
    slot,
    value
  ) {
    var existingPage = frame.accounts[address] || { storage: {} };
    return _extends({}, frame, {
      accounts: _extends(
        {},
        frame.accounts,
        _defineProperty(
          {},
          address,
          _extends({}, existingPage, {
            storage: _extends(
              {},
              existingPage.storage,
              _defineProperty({}, slot, value)
            )
          })
        )
      )
    });
  };

  switch (action.type) {
    case actions.CALL:
    case actions.CREATE:
      //on a call or create, make a new stackframe, then add a new pages to the
      //codex if necessary; don't add a zero page though (or pages that already
      //exist)

      //first, add a new stackframe; if there's an existing stackframe, clone
      //that, otherwise make one from scratch
      newState =
        state.length > 0
          ? [].concat(_toConsumableArray(state), [state[state.length - 1]])
          : [defaultCodexFrame()];
      topCodex = newState[newState.length - 1];
      //now, do we need to add a new address to this stackframe?
      if (
        topCodex.accounts[action.storageAddress] !== undefined ||
        action.storageAddress === DecodeUtils.EVM.ZERO_ADDRESS
      ) {
        //if we don't
        return newState;
      }
      //if we do
      newState[newState.length - 1] = _extends({}, topCodex, {
        accounts: _extends(
          {},
          topCodex.accounts,
          _defineProperty({}, action.storageAddress, {
            storage: {}
            //there will be more here in the future!
          })
        )
      });
      return newState;

    case actions.STORE: {
      //on a store, the relevant page should already exist, so we can just
      //add or update the needed slot
      var address = action.address,
        slot = action.slot,
        value = action.value;

      if (address === DecodeUtils.EVM.ZERO_ADDRESS) {
        //as always, we do not maintain a zero page
        return state;
      }
      newState = state.slice(); //clone the state
      topCodex = newState[newState.length - 1];
      newState[newState.length - 1] = updateFrameStorage(
        topCodex,
        address,
        slot,
        value
      );
      return newState;
    }

    case actions.LOAD: {
      //loads are a little more complicated -- usually we do nothing, but if
      //it's an external load (there was nothing already there), then we want
      //to update *every* stackframe
      var _address = action.address,
        _slot = action.slot,
        _value2 = action.value;

      if (_address === DecodeUtils.EVM.ZERO_ADDRESS) {
        //as always, we do not maintain a zero page
        return state;
      }
      topCodex = state[state.length - 1];
      if (topCodex.accounts[_address].storage[_slot] !== undefined) {
        //if we already have a value in the *top* stackframe, update *no*
        //stackframes; don't update the top (no need, it's just a load, not a
        //store), don't update the rest (that would be wrong, you might be
        //loading a value that will get reverted later)
        return state;
      } else {
        //if we *don't* already have a value in the top stackframe, that means
        //we're loading a value from a previous transaction!  That's not a
        //value that will get reverted if this call fails, so update *every*
        //stackframe
        return state.map(function(frame) {
          return updateFrameStorage(frame, _address, _slot, _value2);
        });
      }
    }

    case actions.RETURN:
      //we want to pop the top while making the new top a copy of the old top;
      //that is to say, we want to drop just the element *second* from the top
      //(although, HACK, if the stack only has one element, just leave it alone)
      return state.length > 1
        ? state.slice(0, -2).concat([state[state.length - 1]])
        : state;

    case actions.FAIL:
      //pop the stack... unless (HACK) that would leave it empty (this will
      //only happen at the end when we want to keep the last one around)
      return state.length > 1 ? state.slice(0, -1) : state;

    case actions.RESET:
      return [defaultCodexFrame(action.storageAddress)];

    case actions.UNLOAD_TRANSACTION:
      return [];

    default:
      return state;
  }
}

var proc = (0, _redux.combineReducers)({
  callstack: callstack,
  codex: codex
});

var reducer = (0, _redux.combineReducers)({
  info: info,
  transaction: transaction,
  proc: proc
});

exports.default = reducer;
