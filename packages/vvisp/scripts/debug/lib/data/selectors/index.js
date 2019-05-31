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

var _jsonPointer = require('json-pointer');

var _jsonPointer2 = _interopRequireDefault(_jsonPointer);

var _helpers = require('../../helpers');

var _selectors = require('../../evm/selectors');

var _selectors2 = _interopRequireDefault(_selectors);

var _selectors3 = require('../../solidity/selectors');

var _selectors4 = _interopRequireDefault(_selectors3);

var _truffleDecodeUtils = require('truffle-decode-utils');

var DecodeUtils = _interopRequireWildcard(_truffleDecodeUtils);

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

var debug = (0, _debug2.default)('debugger:data:selectors');

/**
 * @private
 */
var identity = function identity(x) {
  return x;
};

function findAncestorOfType(node, types, scopes) {
  //note: I'm not including any protection against null in this function.
  //You are advised to include "SourceUnit" as a fallback type.
  while (node && !types.includes(node.nodeType)) {
    node = scopes[scopes[node.id].parentId].definition;
  }
  return node;
}

//given a modifier invocation (or inheritance specifier) node,
//get the node for the actual modifier (or constructor)
function modifierForInvocation(invocation, scopes) {
  var rawId = void 0; //raw referencedDeclaration ID extracted from the AST.
  //if it's a modifier this is what we want, but if it's base
  //constructor, we'll get the contract instead, and need to find its
  //constructor.
  switch (invocation.nodeType) {
    case 'ModifierInvocation':
      rawId = invocation.modifierName.referencedDeclaration;
      break;
    case 'InheritanceSpecifier':
      rawId = invocation.baseName.referencedDeclaration;
      break;
    default:
      debug('bad invocation node');
  }
  var rawNode = scopes[rawId].definition;
  switch (rawNode.nodeType) {
    case 'ModifierDefinition':
      return rawNode;
    case 'ContractDefinition':
      return rawNode.nodes.find(function(node) {
        return (
          node.nodeType === 'FunctionDefinition' && node.kind === 'constructor'
        );
      });
    default:
      //we should never hit this case
      return undefined;
  }
}

//see data.views.contexts for an explanation
function debuggerContextToDecoderContext(context) {
  var contractName = context.contractName,
    binary = context.binary,
    contractId = context.contractId,
    contractKind = context.contractKind,
    isConstructor = context.isConstructor,
    abi = context.abi;

  return {
    contractName: contractName,
    binary: binary,
    contractId: contractId,
    contractKind: contractKind,
    isConstructor: isConstructor,
    abi: DecodeUtils.Contexts.abiToFunctionAbiWithSignatures(abi)
  };
}

var data = (0, _reselectTree.createSelectorTree)({
  state: function state(_state) {
    return _state.data;
  },

  /**
   * data.views
   */
  views: {
    /*
     * data.views.atLastInstructionForSourceRange
     */
    atLastInstructionForSourceRange: (0, _reselectTree.createLeaf)(
      [_selectors4.default.current.isSourceRangeFinal],
      function(final) {
        return final;
      }
    ),

    /**
     * data.views.scopes (namespace)
     */
    scopes: {
      /**
       * data.views.scopes.inlined (namespace)
       */
      inlined: {
        /**
         * data.views.scopes.inlined (selector)
         * see data.info.scopes for how this differs from the raw version
         */
        _: (0, _reselectTree.createLeaf)(['/info/scopes', './raw'], function(
          scopes,
          inlined
        ) {
          return Object.assign.apply(
            Object,
            [{}].concat(
              _toConsumableArray(
                Object.entries(inlined).map(function(_ref) {
                  var _ref2 = _slicedToArray(_ref, 2),
                    id = _ref2[0],
                    info = _ref2[1];

                  var newInfo = _extends({}, info);
                  newInfo.variables = scopes[id].variables;
                  return _defineProperty({}, id, newInfo);
                })
              )
            )
          );
        }),

        /**
         * data.views.scopes.inlined.raw
         */
        raw: (0, _reselectTree.createLeaf)(
          ['/info/scopes/raw', _selectors4.default.info.sources],
          function(scopes, sources) {
            return Object.assign.apply(
              Object,
              [{}].concat(
                _toConsumableArray(
                  Object.entries(scopes).map(function(_ref4) {
                    var _ref5 = _slicedToArray(_ref4, 2),
                      id = _ref5[0],
                      entry = _ref5[1];

                    return _defineProperty(
                      {},
                      id,
                      _extends({}, entry, {
                        definition: _jsonPointer2.default.get(
                          sources[entry.sourceId].ast,
                          entry.pointer
                        )
                      })
                    );
                  })
                )
              )
            );
          }
        )
      }
    },

    /*
     * data.views.userDefinedTypes
     */
    userDefinedTypes: {
      /*
       * data.views.userDefinedTypes.contractDefinitions
       * restrict to contracts only, and get their definitions
       */
      contractDefinitions: (0, _reselectTree.createLeaf)(
        ['/info/userDefinedTypes', '/views/scopes/inlined'],
        function(typeIds, scopes) {
          return typeIds
            .map(function(id) {
              return scopes[id].definition;
            })
            .filter(function(node) {
              return node.nodeType === 'ContractDefinition';
            });
        }
      )
    },

    /*
     * data.views.referenceDeclarations
     */
    referenceDeclarations: (0, _reselectTree.createLeaf)(
      ['./scopes/inlined', '/info/userDefinedTypes'],
      function(scopes, userDefinedTypes) {
        return Object.assign.apply(
          Object,
          [{}].concat(
            _toConsumableArray(
              userDefinedTypes.map(function(id) {
                return _defineProperty({}, id, scopes[id].definition);
              })
            )
          )
        );
      }
    ),

    /**
     * data.views.mappingKeys
     */
    mappingKeys: (0, _reselectTree.createLeaf)(
      ['/proc/mappedPaths', '/current/address'],
      function(mappedPaths, address) {
        var _ref8;

        return (_ref8 = []).concat
          .apply(
            _ref8,
            _toConsumableArray(
              Object.values(
                (mappedPaths.byAddress[address] || { byType: {} }).byType
              ).map(function(_ref9) {
                var bySlotAddress = _ref9.bySlotAddress;
                return Object.values(bySlotAddress);
              })
            )
          )
          .filter(function(slot) {
            return slot.key !== undefined;
          });
      }
    ),

    /*
     * data.views.blockNumber
     * returns block number as string
     */
    blockNumber: (0, _reselectTree.createLeaf)(
      [_selectors2.default.transaction.globals.block],
      function(block) {
        return block.number.toString();
      }
    ),

    /*
     * data.views.instances
     * same as evm.info.instances, but we just map address => binary,
     * we don't bother with context
     */
    instances: (0, _reselectTree.createLeaf)(
      [_selectors2.default.transaction.instances],
      function(instances) {
        return Object.assign.apply(
          Object,
          [{}].concat(
            _toConsumableArray(
              Object.entries(instances).map(function(_ref10) {
                var _ref11 = _slicedToArray(_ref10, 2),
                  address = _ref11[0],
                  binary = _ref11[1].binary;

                return _defineProperty(
                  {},
                  address,
                  DecodeUtils.Conversion.toBytes(binary)
                );
              })
            )
          )
        );
      }
    ),

    /*
     * data.views.contexts
     * same as evm.info.contexts, but:
     * 0. we only include non-constructor contexts
     * 1. we now index by contract ID rather than hash
     * 2. we strip out context, sourceMap, primarySource, and compiler
     * 3. we alter abi in several ways:
     * 3a. we strip abi down to just (ordinary) functions
     * 3b. we augment these functions with signatures (here meaning selectors)
     * 3c. abi is now an object, not an array, and indexed by these signatures
     */
    contexts: (0, _reselectTree.createLeaf)(
      [_selectors2.default.info.contexts],
      function(contexts) {
        return Object.assign.apply(
          Object,
          [{}].concat(
            _toConsumableArray(
              Object.values(contexts)
                .filter(function(context) {
                  return !context.isConstructor;
                })
                .map(function(context) {
                  return _defineProperty(
                    {},
                    context.context,
                    debuggerContextToDecoderContext(context)
                  );
                })
            )
          )
        );
      }
    )
  },

  /**
   * data.info
   */
  info: {
    /**
     * data.info.scopes (namespace)
     */
    scopes: {
      /**
       * data.info.scopes (selector)
       * the raw version is below; this version accounts for inheritance
       * NOTE: doesn't this selector really belong in data.views?  Yes.
       * But, since it's replacing the old data.info.scopes (which is now
       * data.info.scopes.raw), I didn't want to move it.
       */
      _: (0, _reselectTree.createLeaf)(
        ['./raw', '/views/scopes/inlined/raw'],
        function(scopes, inlined) {
          return Object.assign.apply(
            Object,
            [{}].concat(
              _toConsumableArray(
                Object.entries(scopes).map(function(_ref14) {
                  var _ref17;

                  var _ref15 = _slicedToArray(_ref14, 2),
                    id = _ref15[0],
                    scope = _ref15[1];

                  var definition = inlined[id].definition;
                  if (definition.nodeType !== 'ContractDefinition') {
                    return _defineProperty({}, id, scope);
                  }
                  //if we've reached this point, we should be dealing with a
                  //contract, and specifically a contract -- not an interface or
                  //library (those don't get "variables" entries in their scopes)
                  debug('contract id %d', id);
                  var newScope = _extends({}, scope);
                  //note that Solidity gives us the linearization in order from most
                  //derived to most base, but we want most base to most derived;
                  //annoyingly, reverse() is in-place, so we clone with slice() first
                  var linearizedBaseContractsFromBase = definition.linearizedBaseContracts
                    .slice()
                    .reverse();
                  //now, we put it all together
                  newScope.variables = (_ref17 = []).concat
                    .apply(
                      _ref17,
                      _toConsumableArray(
                        linearizedBaseContractsFromBase.map(
                          function(contractId) {
                            return scopes[contractId].variables || [];
                          }
                          //we need the || [] because contracts with no state variables
                          //have variables undefined rather than empty like you'd expect
                        )
                      )
                    )
                    .filter(function(variable) {
                      //...except, HACK, let's filter out those constants we don't know
                      //how to read.  they'll just clutter things up.
                      debug('variable %O', variable);
                      var definition = inlined[variable.id].definition;
                      return (
                        !definition.constant ||
                        DecodeUtils.Definition.isSimpleConstant(
                          definition.value
                        )
                      );
                    });

                  return _defineProperty({}, id, newScope);
                })
              )
            )
          );
        }
      ),

      /*
       * data.info.scopes.raw
       */
      raw: (0, _reselectTree.createLeaf)(['/state'], function(state) {
        return state.info.scopes.byId;
      })
    },

    /*
     * data.info.allocations
     */
    allocations: {
      /*
       * data.info.allocations.storage
       */
      storage: (0, _reselectTree.createLeaf)(['/state'], function(state) {
        return state.info.allocations.storage;
      }),

      /*
       * data.info.allocations.memory
       */
      memory: (0, _reselectTree.createLeaf)(['/state'], function(state) {
        return state.info.allocations.memory;
      }),

      /*
       * data.info.allocations.calldata
       */
      calldata: (0, _reselectTree.createLeaf)(['/state'], function(state) {
        return state.info.allocations.calldata;
      })
    },

    /**
     * data.info.userDefinedTypes
     */
    userDefinedTypes: (0, _reselectTree.createLeaf)(['/state'], function(
      state
    ) {
      return state.info.userDefinedTypes;
    })
  },

  /**
   * data.proc
   */
  proc: {
    /**
     * data.proc.assignments
     */
    assignments: (0, _reselectTree.createLeaf)(
      ['/state'],
      function(state) {
        return state.proc.assignments;
      }
      //note: this no longer fetches just the byId, but rather the whole
      //assignments object
    ),

    /*
     * data.proc.mappedPaths
     */
    mappedPaths: (0, _reselectTree.createLeaf)(['/state'], function(state) {
      return state.proc.mappedPaths;
    }),

    /**
     * data.proc.decodingKeys
     *
     * number of keys that are still decoding
     */
    decodingKeys: (0, _reselectTree.createLeaf)(['./mappedPaths'], function(
      mappedPaths
    ) {
      return mappedPaths.decodingStarted;
    })
  },

  /**
   * data.current
   */
  current: {
    /**
     * data.current.state
     */
    state: {
      /**
       * data.current.state.stack
       */
      stack: (0, _reselectTree.createLeaf)(
        [_selectors2.default.current.state.stack],
        function(words) {
          return (words || []).map(function(word) {
            return DecodeUtils.Conversion.toBytes(word);
          });
        }
      ),

      /**
       * data.current.state.memory
       */
      memory: (0, _reselectTree.createLeaf)(
        [_selectors2.default.current.state.memory],
        function(words) {
          return DecodeUtils.Conversion.toBytes(words.join(''));
        }
      ),

      /**
       * data.current.state.calldata
       */
      calldata: (0, _reselectTree.createLeaf)(
        [_selectors2.default.current.call],
        function(_ref19) {
          var data = _ref19.data;
          return DecodeUtils.Conversion.toBytes(data);
        }
      ),

      /**
       * data.current.state.storage
       */
      storage: (0, _reselectTree.createLeaf)(
        [_selectors2.default.current.codex.storage],
        function(mapping) {
          return Object.assign.apply(
            Object,
            [{}].concat(
              _toConsumableArray(
                Object.entries(mapping).map(function(_ref20) {
                  var _ref21 = _slicedToArray(_ref20, 2),
                    address = _ref21[0],
                    word = _ref21[1];

                  return _defineProperty(
                    {},
                    '0x' + address,
                    DecodeUtils.Conversion.toBytes(word)
                  );
                })
              )
            )
          );
        }
      ),

      /*
       * data.current.state.specials
       * I've named these after the solidity variables they correspond to,
       * which are *mostly* the same as the corresponding EVM opcodes
       * (FWIW: this = ADDRESS, sender = CALLER, value = CALLVALUE)
       */
      specials: (0, _reselectTree.createLeaf)(
        [
          '/current/address',
          _selectors2.default.current.call,
          _selectors2.default.transaction.globals
        ],
        function(address, _ref23, _ref24) {
          var sender = _ref23.sender,
            value = _ref23.value;
          var tx = _ref24.tx,
            block = _ref24.block;
          return _extends(
            {
              this: DecodeUtils.Conversion.toBytes(address),

              sender: DecodeUtils.Conversion.toBytes(sender),

              value: DecodeUtils.Conversion.toBytes(value)
            },
            Object.assign.apply(
              Object,
              [{}].concat(
                _toConsumableArray(
                  Object.entries(tx).map(function(_ref25) {
                    var _ref26 = _slicedToArray(_ref25, 2),
                      variable = _ref26[0],
                      value = _ref26[1];

                    return _defineProperty(
                      {},
                      variable,
                      DecodeUtils.Conversion.toBytes(value)
                    );
                  })
                )
              )
            ),
            Object.assign.apply(
              Object,
              [{}].concat(
                _toConsumableArray(
                  Object.entries(block).map(function(_ref28) {
                    var _ref29 = _slicedToArray(_ref28, 2),
                      variable = _ref29[0],
                      value = _ref29[1];

                    return _defineProperty(
                      {},
                      variable,
                      DecodeUtils.Conversion.toBytes(value)
                    );
                  })
                )
              )
            )
          );
        }
      )
    },

    /**
     * data.current.node
     */
    node: (0, _reselectTree.createLeaf)(
      [_selectors4.default.current.node],
      identity
    ),

    /**
     * data.current.scope
     * old alias for data.current.node (deprecated)
     */
    scope: (0, _reselectTree.createLeaf)(['./node'], identity),

    /*
     * data.current.contract
     * warning: may return null or similar, even though SourceUnit is included
     * as fallback
     */
    contract: (0, _reselectTree.createLeaf)(
      ['./node', '/views/scopes/inlined'],
      function(node, scopes) {
        var types = ['ContractDefinition', 'SourceUnit'];
        //SourceUnit included as fallback
        return findAncestorOfType(node, types, scopes);
      }
    ),

    /**
     * data.current.functionDepth
     */

    functionDepth: (0, _reselectTree.createLeaf)(
      [_selectors4.default.current.functionDepth],
      identity
    ),

    /**
     * data.current.address
     * NOTE: this is the STORAGE address for the current call, not the CODE
     * address
     */

    address: (0, _reselectTree.createLeaf)(
      [_selectors2.default.current.call],
      function(call) {
        return call.storageAddress;
      }
    ),

    /*
     * data.current.functionsByProgramCounter
     */
    functionsByProgramCounter: (0, _reselectTree.createLeaf)(
      [_selectors4.default.current.functionsByProgramCounter],
      function(functions) {
        return functions;
      }
    ),

    /*
     * data.current.context
     */
    context: (0, _reselectTree.createLeaf)(
      [_selectors2.default.current.context],
      debuggerContextToDecoderContext
    ),

    /*
     * data.current.aboutToModify
     * HACK
     * This selector is used to catch those times when we go straight from a
     * modifier invocation into the modifier itself, skipping over the
     * definition node (this includes base constructor calls).  So it should
     * return true when:
     * 1. we're on the node corresponding to an argument to a modifier
     * invocation or base constructor call, or, if said argument is a type
     * conversion, its argument (or nested argument)
     * 2. the next node is not a FunctionDefinition, ModifierDefinition, or
     * in the same modifier / base constructor invocation
     */
    aboutToModify: (0, _reselectTree.createLeaf)(
      [
        './node',
        './modifierInvocation',
        './modifierArgumentIndex',
        '/next/node',
        '/next/modifierInvocation',
        _selectors2.default.current.step.isContextChange
      ],
      function(node, invocation, index, next, nextInvocation, isContextChange) {
        //ensure: current instruction is not a context change (because if it is
        //we cannot rely on the data.next selectors, but also if it is we know
        //we're not about to call a modifier or base constructor!)
        //we also want to return false if we can't find things for whatever
        //reason
        if (
          isContextChange ||
          !node ||
          !next ||
          !invocation ||
          !nextInvocation
        ) {
          return false;
        }

        //ensure: current position is in a ModifierInvocation or
        //InheritanceSpecifier (recall that SourceUnit was included as
        //fallback)
        if (invocation.nodeType === 'SourceUnit') {
          return false;
        }

        //ensure: next node is not a function definition or modifier definition
        if (
          next.nodeType === 'FunctionDefinition' ||
          next.nodeType === 'ModifierDefinition'
        ) {
          return false;
        }

        //ensure: next node is not in the same invocation
        if (
          nextInvocation.nodeType !== 'SourceUnit' &&
          nextInvocation.id === invocation.id
        ) {
          return false;
        }

        //now: are we on the node corresponding to an argument, or, if
        //it's a type conversion, its nested argument?
        if (index === undefined) {
          return false;
        }
        var argument = invocation.arguments[index];
        while (argument.kind === 'typeConversion') {
          if (node.id === argument.id) {
            return true;
          }
          argument = argument.arguments[0];
        }
        return node.id === argument.id;
      }
    ),

    /*
     * data.current.modifierInvocation
     */
    modifierInvocation: (0, _reselectTree.createLeaf)(
      ['./node', '/views/scopes/inlined'],
      function(node, scopes) {
        var types = [
          'ModifierInvocation',
          'InheritanceSpecifier',
          'SourceUnit'
        ];
        //again, SourceUnit included as fallback
        return findAncestorOfType(node, types, scopes);
      }
    ),

    /**
     * data.current.modifierArgumentIndex
     * gets the index of the current modifier argument that you're in
     * (undefined when not in a modifier argument)
     */
    modifierArgumentIndex: (0, _reselectTree.createLeaf)(
      ['/info/scopes', './node', './modifierInvocation'],
      function(scopes, node, invocation) {
        if (invocation.nodeType === 'SourceUnit') {
          return undefined;
        }

        var pointer = scopes[node.id].pointer;
        var invocationPointer = scopes[invocation.id].pointer;

        //slice the invocation pointer off the beginning
        var difference = pointer.replace(invocationPointer, '');
        debug('difference %s', difference);
        var rawIndex = difference.match(/^\/arguments\/(\d+)/);
        //note that that \d+ is greedy
        debug('rawIndex %o', rawIndex);
        if (rawIndex === null) {
          return undefined;
        }
        return parseInt(rawIndex[1]);
      }
    ),

    /*
     * data.current.modifierBeingInvoked
     * gets the node corresponding to the modifier or base constructor
     * being invoked
     */
    modifierBeingInvoked: (0, _reselectTree.createLeaf)(
      ['./modifierInvocation', '/views/scopes/inlined'],
      function(invocation, scopes) {
        if (!invocation || invocation.nodeType === 'SourceUnit') {
          return undefined;
        }

        return modifierForInvocation(invocation, scopes);
      }
    ),

    /**
     * data.current.identifiers (namespace)
     */
    identifiers: {
      /**
       * data.current.identifiers (selector)
       *
       * returns identifers and corresponding definition node ID or builtin name
       * (object entries look like [name]: {astId: id} or like [name]: {builtin: name}
       */
      _: (0, _reselectTree.createLeaf)(
        ['/views/scopes/inlined', '/current/node'],
        function(scopes, scope) {
          var variables = {};
          if (scope !== undefined) {
            var cur = scope.id;

            do {
              variables = Object.assign.apply(
                Object,
                [variables].concat(
                  _toConsumableArray(
                    (scopes[cur].variables || [])
                      .filter(function(v) {
                        return v.name !== '';
                      }) //exclude anonymous output params
                      .filter(function(v) {
                        return variables[v.name] == undefined;
                      })
                      .map(function(v) {
                        return _defineProperty({}, v.name, { astId: v.id });
                      })
                  )
                )
              );

              cur = scopes[cur].parentId;
            } while (cur != null);
          }

          var builtins = {
            msg: { builtin: 'msg' },
            tx: { builtin: 'tx' },
            block: { builtin: 'block' },
            this: { builtin: 'this' },
            now: { builtin: 'now' }
          };

          return _extends({}, variables, builtins);
        }
      ),

      /**
       * data.current.identifiers.definitions (namespace)
       */
      definitions: {
        /* data.current.identifiers.definitions (selector)
         * definitions for current variables, by identifier
         */
        _: (0, _reselectTree.createLeaf)(
          ['/views/scopes/inlined', '../_', './this'],
          function(scopes, identifiers, thisDefinition) {
            var variables = Object.assign.apply(
              Object,
              [{}].concat(
                _toConsumableArray(
                  Object.entries(identifiers).map(function(_ref32) {
                    var _ref33 = _slicedToArray(_ref32, 2),
                      identifier = _ref33[0],
                      astId = _ref33[1].astId;

                    if (astId !== undefined) {
                      //will be undefined for builtins
                      var definition = scopes[astId].definition;

                      return _defineProperty({}, identifier, definition);
                    } else {
                      return {}; //skip over builtins; we'll handle those separately
                    }
                  })
                )
              )
            );
            var builtins = {
              msg: DecodeUtils.Definition.MSG_DEFINITION,
              tx: DecodeUtils.Definition.TX_DEFINITION,
              block: DecodeUtils.Definition.BLOCK_DEFINITION,
              now: DecodeUtils.Definition.spoofUintDefinition('now')
            };
            //only include this when it has a proper definition
            if (thisDefinition) {
              builtins.this = thisDefinition;
            }
            return _extends({}, variables, builtins);
          }
        ),

        /*
         * data.current.identifiers.definitions.this
         *
         * returns a spoofed definition for the this variable
         */
        this: (0, _reselectTree.createLeaf)(['/current/contract'], function(
          contractNode
        ) {
          return contractNode && contractNode.nodeType === 'ContractDefinition'
            ? DecodeUtils.Definition.spoofThisDefinition(
                contractNode.name,
                contractNode.id
              )
            : null;
        })
      },

      /**
       * data.current.identifiers.refs
       *
       * current variables' value refs
       */
      refs: (0, _reselectTree.createLeaf)(
        [
          '/proc/assignments',
          './_',
          '/current/functionDepth', //for pruning things too deep on stack
          '/current/address' //for contract variables
        ],
        function(assignments, identifiers, currentDepth, address) {
          return Object.assign.apply(
            Object,
            [{}].concat(
              _toConsumableArray(
                Object.entries(identifiers).map(function(_ref35) {
                  var _ref36 = _slicedToArray(_ref35, 2),
                    identifier = _ref36[0],
                    _ref36$ = _ref36[1],
                    astId = _ref36$.astId,
                    builtin = _ref36$.builtin;

                  var id = void 0;

                  //is this an ordinary variable or a builtin?
                  if (astId !== undefined) {
                    //if not a builtin, first check if it's a contract var
                    var matchIds = (assignments.byAstId[astId] || []).filter(
                      function(idHash) {
                        return assignments.byId[idHash].address === address;
                      }
                    );
                    if (matchIds.length > 0) {
                      id = matchIds[0]; //there should only be one!
                    }

                    //if not contract, it's local, so find the innermost
                    //(but not beyond current depth)
                    if (id === undefined) {
                      var matchFrames = (assignments.byAstId[astId] || [])
                        .map(function(id) {
                          return assignments.byId[id].stackframe;
                        })
                        .filter(function(stackframe) {
                          return stackframe !== undefined;
                        });

                      if (matchFrames.length > 0) {
                        //this check isn't *really*
                        //necessary, but may as well prevent stupid stuff
                        var maxMatch = Math.min(
                          currentDepth,
                          Math.max.apply(Math, _toConsumableArray(matchFrames))
                        );
                        id = (0, _helpers.stableKeccak256)({
                          astId: astId,
                          stackframe: maxMatch
                        });
                      }
                    }
                  } else {
                    //otherwise, it's a builtin
                    //NOTE: for now we assume there is only one assignment per
                    //builtin, but this will change in the future
                    id = assignments.byBuiltin[builtin][0];
                  }

                  //if we still didn't find it, oh well

                  var _ref37 = assignments.byId[id] || {},
                    ref = _ref37.ref;

                  if (!ref) {
                    return undefined;
                  }

                  return _defineProperty({}, identifier, ref);
                })
              )
            )
          );
        }
      )
    }
  },

  /**
   * data.next
   */
  next: {
    /**
     * data.next.state
     * Yes, I'm just repeating the code for data.current.state.stack here;
     * not worth the trouble to factor out
     */
    state: {
      /**
       * data.next.state.stack
       */
      stack: (0, _reselectTree.createLeaf)(
        [_selectors2.default.next.state.stack],
        function(words) {
          return (words || []).map(function(word) {
            return DecodeUtils.Conversion.toBytes(word);
          });
        }
      )
    },

    //HACK WARNING
    //the following selectors depend on solidity.next
    //do not use them when the current instruction is a context change!

    /**
     * data.next.node
     */
    node: (0, _reselectTree.createLeaf)(
      [_selectors4.default.next.node],
      identity
    ),

    /**
     * data.next.modifierInvocation
     * Note: yes, I'm just repeating the code from data.current here but with
     * invalid added
     */
    modifierInvocation: (0, _reselectTree.createLeaf)(
      [
        './node',
        '/views/scopes/inlined',
        _selectors2.default.current.step.isContextChange
      ],
      function(node, scopes, invalid) {
        //don't attempt this at a context change!
        //(also don't attempt this if we can't find the node for whatever
        //reason)
        if (invalid || !node) {
          return undefined;
        }
        var types = [
          'ModifierInvocation',
          'InheritanceSpecifier',
          'SourceUnit'
        ];
        //again, SourceUnit included as fallback
        return findAncestorOfType(node, types, scopes);
      }
    ),

    /*
     * data.next.modifierBeingInvoked
     */
    modifierBeingInvoked: (0, _reselectTree.createLeaf)(
      [
        './modifierInvocation',
        '/views/scopes/inlined',
        _selectors2.default.current.step.isContextChange
      ],
      function(invocation, scopes, invalid) {
        if (invalid || !invocation || invocation.nodeType === 'SourceUnit') {
          return undefined;
        }

        return modifierForInvocation(invocation, scopes);
      }
    )
    //END HACK WARNING
  },

  /**
   * data.nextMapped
   */
  nextMapped: {
    /**
     * data.nextMapped.state
     * Yes, I'm just repeating the code for data.current.state.stack here;
     * not worth the trouble to factor out
     * HACK: this assumes we're not about to change context! don't use this if we
     * are!
     */
    state: {
      /**
       * data.nextMapped.state.stack
       */
      stack: (0, _reselectTree.createLeaf)(
        [_selectors4.default.current.nextMapped],
        function(step) {
          return ((step || {}).stack || []).map(function(word) {
            return DecodeUtils.Conversion.toBytes(word);
          });
        }
      )
    }
  }
});

exports.default = data;
