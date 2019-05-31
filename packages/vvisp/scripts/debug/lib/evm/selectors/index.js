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

var _bn = require('bn.js');

var _bn2 = _interopRequireDefault(_bn);

var _selectors = require('../../trace/selectors');

var _selectors2 = _interopRequireDefault(_selectors);

var _truffleDecodeUtils = require('truffle-decode-utils');

var DecodeUtils = _interopRequireWildcard(_truffleDecodeUtils);

var _helpers = require('../../helpers');

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

var debug = (0, _debug2.default)('debugger:evm:selectors'); // eslint-disable-line no-unused-vars

/**
 * create EVM-level selectors for a given trace step selector
 * may specify additional selectors to include
 */
function createStepSelectors(step) {
  var state =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  var base = {
    /**
     * .trace
     *
     * trace step info related to operation
     */
    trace: (0, _reselectTree.createLeaf)([step], function(step) {
      if (!step) {
        return null;
      }
      var gasCost = step.gasCost,
        op = step.op,
        pc = step.pc;

      return { gasCost: gasCost, op: op, pc: pc };
    }),

    /**
     * .programCounter
     */
    programCounter: (0, _reselectTree.createLeaf)(['./trace'], function(step) {
      return step ? step.pc : null;
    }),

    /**
     * .isJump
     */
    isJump: (0, _reselectTree.createLeaf)(['./trace'], function(step) {
      return step.op != 'JUMPDEST' && step.op.indexOf('JUMP') == 0;
    }),

    /**
     * .isCall
     *
     * whether the opcode will switch to another calling context
     */
    isCall: (0, _reselectTree.createLeaf)(['./trace'], function(step) {
      return (0, _helpers.isCallMnemonic)(step.op);
    }),

    /**
     * .isShortCall
     *
     * for calls that only take 6 arguments instead of 7
     */
    isShortCall: (0, _reselectTree.createLeaf)(['./trace'], function(step) {
      return (0, _helpers.isShortCallMnemonic)(step.op);
    }),

    /**
     * .isDelegateCallBroad
     *
     * for calls that delegate storage
     */
    isDelegateCallBroad: (0, _reselectTree.createLeaf)(['./trace'], function(
      step
    ) {
      return (0, _helpers.isDelegateCallMnemonicBroad)(step.op);
    }),

    /**
     * .isDelegateCallStrict
     *
     * for calls that additionally delegate sender and value
     */
    isDelegateCallStrict: (0, _reselectTree.createLeaf)(['./trace'], function(
      step
    ) {
      return (0, _helpers.isDelegateCallMnemonicStrict)(step.op);
    }),

    /**
     * .isStaticCall
     */
    isStaticCall: (0, _reselectTree.createLeaf)(['./trace'], function(step) {
      return (0, _helpers.isStaticCallMnemonic)(step.op);
    }),

    /**
     * .isCreate
     */
    isCreate: (0, _reselectTree.createLeaf)(['./trace'], function(step) {
      return (0, _helpers.isCreateMnemonic)(step.op);
    }),

    /**
     * .isHalting
     *
     * whether the instruction halts or returns from a calling context
     * (covers only ordinary halds, not exceptional halts)
     */
    isHalting: (0, _reselectTree.createLeaf)(['./trace'], function(step) {
      return (0, _helpers.isNormalHaltingMnemonic)(step.op);
    }),

    /*
     * .isStore
     */
    isStore: (0, _reselectTree.createLeaf)(['./trace'], function(step) {
      return step.op == 'SSTORE';
    }),

    /*
     * .isLoad
     */
    isLoad: (0, _reselectTree.createLeaf)(['./trace'], function(step) {
      return step.op == 'SLOAD';
    }),

    /*
     * .touchesStorage
     *
     * whether the instruction involves storage
     */
    touchesStorage: (0, _reselectTree.createLeaf)(
      ['./isStore', 'isLoad'],
      function(stores, loads) {
        return stores || loads;
      }
    )
  };

  if (state) {
    var isRelative = function isRelative(path) {
      return (
        typeof path == 'string' &&
        (path.startsWith('./') || path.startsWith('../'))
      );
    };

    if (isRelative(state)) {
      state = '../' + state;
    }

    Object.assign(base, {
      /**
       * .callAddress
       *
       * address transferred to by call operation
       */
      callAddress: (0, _reselectTree.createLeaf)(['./isCall', state], function(
        matches,
        _ref
      ) {
        var stack = _ref.stack;

        if (!matches) {
          return null;
        }

        var address = stack[stack.length - 2];
        return DecodeUtils.Conversion.toAddress(address);
      }),

      /**
       * .createBinary
       *
       * binary code to execute via create operation
       */
      createBinary: (0, _reselectTree.createLeaf)(
        ['./isCreate', state],
        function(matches, _ref2) {
          var stack = _ref2.stack,
            memory = _ref2.memory;

          if (!matches) {
            return null;
          }

          // Get the code that's going to be created from memory.
          // Note we multiply by 2 because these offsets are in bytes.
          var offset = parseInt(stack[stack.length - 2], 16) * 2;
          var length = parseInt(stack[stack.length - 3], 16) * 2;

          return '0x' + memory.join('').substring(offset, offset + length);
        }
      ),

      /**
       * .callData
       *
       * data passed to EVM call
       */
      callData: (0, _reselectTree.createLeaf)(
        ['./isCall', './isShortCall', state],
        function(matches, short, _ref3) {
          var stack = _ref3.stack,
            memory = _ref3.memory;

          if (!matches) {
            return null;
          }

          //if it's 6-argument call, the data start and offset will be one spot
          //higher in the stack than they would be for a 7-argument call, so
          //let's introduce an offset to handle this
          var argOffset = short ? 1 : 0;

          // Get the data from memory.
          // Note we multiply by 2 because these offsets are in bytes.
          var offset = parseInt(stack[stack.length - 4 + argOffset], 16) * 2;
          var length = parseInt(stack[stack.length - 5 + argOffset], 16) * 2;

          return '0x' + memory.join('').substring(offset, offset + length);
        }
      ),

      /**
       * .callValue
       *
       * value for the call (not create); returns null for DELEGATECALL
       */
      callValue: (0, _reselectTree.createLeaf)(
        ['./isCall', './isDelegateCallStrict', './isStaticCall', state],
        function(calls, delegates, isStatic, _ref4) {
          var stack = _ref4.stack;

          if (!calls || delegates) {
            return null;
          }

          if (isStatic) {
            return new _bn2.default(0);
          }

          //otherwise, for CALL and CALLCODE, it's the 3rd argument
          var value = stack[stack.length - 3];
          return DecodeUtils.Conversion.toBN(value);
        }
      ),

      /**
       * .createValue
       *
       * value for the create
       */
      createValue: (0, _reselectTree.createLeaf)(
        ['./isCreate', state],
        function(matches, _ref5) {
          var stack = _ref5.stack;

          if (!matches) {
            return null;
          }

          //creates have the value as the first argument
          var value = stack[stack.length - 1];
          return DecodeUtils.Conversion.toBN(value);
        }
      ),

      /**
       * .storageAffected
       *
       * storage slot being stored to or loaded from
       * we do NOT prepend "0x"
       */
      storageAffected: (0, _reselectTree.createLeaf)(
        ['./touchesStorage', state],
        function(matches, _ref6) {
          var stack = _ref6.stack;

          if (!matches) {
            return null;
          }

          return stack[stack.length - 1];
        }
      )
    });
  }

  return base;
}

var evm = (0, _reselectTree.createSelectorTree)({
  /**
   * evm.state
   */
  state: function state(_state) {
    return _state.evm;
  },

  /**
   * evm.info
   */
  info: {
    /**
     * evm.info.contexts
     */
    contexts: (0, _reselectTree.createLeaf)(['/state'], function(state) {
      return state.info.contexts.byContext;
    }),

    /**
     * evm.info.binaries
     */
    binaries: {
      /**
       * evm.info.binaries.search
       *
       * returns function (binary) => context (returns the *ID* of the context)
       * (returns null on no match)
       */
      search: (0, _reselectTree.createLeaf)(['/info/contexts'], function(
        contexts
      ) {
        return function(binary) {
          return DecodeUtils.Contexts.findDebuggerContext(contexts, binary);
        };
      })
    }
  },

  /**
   * evm.transaction
   */
  transaction: {
    /**
     * evm.transaction.instances
     */
    instances: (0, _reselectTree.createLeaf)(['/state'], function(state) {
      return state.transaction.instances.byAddress;
    }),

    /*
     * evm.transaction.globals
     */
    globals: {
      /*
       * evm.transaction.globals.tx
       */
      tx: (0, _reselectTree.createLeaf)(['/state'], function(state) {
        return state.transaction.globals.tx;
      }),
      /*
       * evm.transaction.globals.block
       */
      block: (0, _reselectTree.createLeaf)(['/state'], function(state) {
        return state.transaction.globals.block;
      })
    }
  },

  /**
   * evm.current
   */
  current: {
    /**
     * evm.current.callstack
     */
    callstack: function callstack(state) {
      return state.evm.proc.callstack;
    },

    /**
     * evm.current.call
     */
    call: (0, _reselectTree.createLeaf)(['./callstack'], function(stack) {
      return stack.length ? stack[stack.length - 1] : {};
    }),

    /**
     * evm.current.context
     */
    context: (0, _reselectTree.createLeaf)(
      [
        './call',
        '/transaction/instances',
        '/info/binaries/search',
        '/info/contexts'
      ],
      function(_ref7, instances, search, contexts) {
        var address = _ref7.address,
          binary = _ref7.binary;

        var contextId = void 0;
        if (address) {
          //if we're in a call to a deployed contract, we *must* have recorded
          //it in the instance table, so we just need to look up the context ID
          //from there; we don't need to do any further searching
          contextId = instances[address].context;
          binary = instances[address].binary;
        } else if (binary) {
          //otherwise, if we're in a constructor, we'll need to actually do a
          //search
          contextId = search(binary);
        } else {
          //exceptional case: no transaction is loaded
          return null;
        }

        var context = contexts[contextId];

        return _extends({}, context, {
          binary: binary
        });
      }
    ),

    /**
     * evm.current.state
     *
     * evm state info: as of last operation, before op defined in step
     */
    state: Object.assign.apply(
      Object,
      [{}].concat(
        _toConsumableArray(
          ['depth', 'error', 'gas', 'memory', 'stack', 'storage'].map(function(
            param
          ) {
            return _defineProperty(
              {},
              param,
              (0, _reselectTree.createLeaf)(
                [_selectors2.default.step],
                function(step) {
                  return step[param];
                }
              )
            );
          })
        )
      )
    ),

    /**
     * evm.current.step
     */
    step: _extends(
      {},
      createStepSelectors(_selectors2.default.step, './state'),
      {
        //the following step selectors only exist for current, not next or any
        //other step

        /*
         * evm.current.step.createdAddress
         *
         * address created by the current create step
         */
        createdAddress: (0, _reselectTree.createLeaf)(
          ['./isCreate', '/nextOfSameDepth/state/stack'],
          function(matches, stack) {
            if (!matches) {
              return null;
            }
            var address = stack[stack.length - 1];
            return DecodeUtils.Conversion.toAddress(address);
          }
        ),

        /**
         * evm.current.step.callsPrecompileOrExternal
         *
         * are we calling a precompiled contract or an externally-owned account,
         * rather than a contract account that isn't precompiled?
         */
        callsPrecompileOrExternal: (0, _reselectTree.createLeaf)(
          ['./isCall', '/current/state/depth', '/next/state/depth'],
          function(calls, currentDepth, nextDepth) {
            return calls && currentDepth === nextDepth;
          }
        ),

        /**
         * evm.current.step.isContextChange
         * groups together calls, creates, halts, and exceptional halts
         */
        isContextChange: (0, _reselectTree.createLeaf)(
          ['/current/state/depth', '/next/state/depth'],
          function(currentDepth, nextDepth) {
            return currentDepth !== nextDepth;
          }
        ),

        /**
         * evm.current.step.isExceptionalHalting
         *
         */
        isExceptionalHalting: (0, _reselectTree.createLeaf)(
          ['./isHalting', '/current/state/depth', '/next/state/depth'],
          function(halting, currentDepth, nextDepth) {
            return nextDepth < currentDepth && !halting;
          }
        )
      }
    ),

    /**
     * evm.current.codex (namespace)
     */
    codex: {
      /**
       * evm.current.codex (selector)
       * the whole codex! not that that's very much at the moment
       */
      _: (0, _reselectTree.createLeaf)(['/state'], function(state) {
        return state.proc.codex;
      }),

      /**
       * evm.current.codex.storage
       * the current storage, as fetched from the codex... unless we're in a
       * failed creation call, then we just fall back on the state (which will
       * work, since nothing else can interfere with the storage of a failed
       * creation call!)
       */
      storage: (0, _reselectTree.createLeaf)(
        ['./_', '../state/storage', '../call'],
        function(codex, rawStorage, _ref9) {
          var storageAddress = _ref9.storageAddress;
          return storageAddress === DecodeUtils.EVM.ZERO_ADDRESS
            ? rawStorage //HACK -- if zero address ignore the codex
            : codex[codex.length - 1].accounts[storageAddress].storage;
        }
      )
    }
  },

  /**
   * evm.next
   */
  next: {
    /**
     * evm.next.state
     *
     * evm state as a result of next step operation
     */
    state: Object.assign.apply(
      Object,
      [{}].concat(
        _toConsumableArray(
          ['depth', 'error', 'gas', 'memory', 'stack', 'storage'].map(function(
            param
          ) {
            return _defineProperty(
              {},
              param,
              (0, _reselectTree.createLeaf)(
                [_selectors2.default.next],
                function(step) {
                  return step[param];
                }
              )
            );
          })
        )
      )
    ),

    /*
     * evm.next.step
     */
    step: createStepSelectors(_selectors2.default.next, './state')
  },

  /**
   * evm.nextOfSameDepth
   */
  nextOfSameDepth: {
    /**
     * evm.nextOfSameDepth.state
     *
     * evm state at the next step of same depth
     */
    state: Object.assign.apply(
      Object,
      [{}].concat(
        _toConsumableArray(
          ['depth', 'error', 'gas', 'memory', 'stack', 'storage'].map(function(
            param
          ) {
            return _defineProperty(
              {},
              param,
              (0, _reselectTree.createLeaf)(
                [_selectors2.default.nextOfSameDepth],
                function(step) {
                  return step[param];
                }
              )
            );
          })
        )
      )
    )
  }
});

exports.default = evm;
