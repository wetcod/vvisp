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

var _reselectTree = require('reselect-tree');

var _truffleSolidityUtils = require('truffle-solidity-utils');

var _truffleSolidityUtils2 = _interopRequireDefault(_truffleSolidityUtils);

var _truffleCodeUtils = require('truffle-code-utils');

var _truffleCodeUtils2 = _interopRequireDefault(_truffleCodeUtils);

var _map = require('../../ast/map');

var _jsonPointer = require('json-pointer');

var _jsonPointer2 = _interopRequireDefault(_jsonPointer);

var _selectors = require('../../evm/selectors');

var _selectors2 = _interopRequireDefault(_selectors);

var _selectors3 = require('../..//trace/selectors');

var _selectors4 = _interopRequireDefault(_selectors3);

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

var debug = (0, _debug2.default)('debugger:solidity:selectors');

function getSourceRange() {
  var instruction =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return {
    start: instruction.start || 0,
    length: instruction.length || 0,
    lines: instruction.range || {
      start: {
        line: 0,
        column: 0
      },
      end: {
        line: 0,
        column: 0
      }
    }
  };
}

//function to create selectors that need both a current and next version
function createMultistepSelectors(stepSelector) {
  return {
    /**
     * .instruction
     */
    instruction: (0, _reselectTree.createLeaf)(
      ['/current/instructionAtProgramCounter', stepSelector.programCounter],
      //HACK: we use solidity.current.instructionAtProgramCounter
      //even if we're looking at solidity.next.
      //This is harmless... so long as the current instruction isn't a context
      //change.  So, don't use solidity.next when it is.

      function(map, pc) {
        return map[pc] || {};
      }
    ),

    /**
     * .source
     */
    source: (0, _reselectTree.createLeaf)(
      ['/info/sources', './instruction'],
      function(sources, _ref) {
        var id = _ref.file;
        return sources[id] || {};
      }
    ),

    /**
     * .sourceRange
     */
    sourceRange: (0, _reselectTree.createLeaf)(
      ['./instruction'],
      getSourceRange
    ),

    /**
     * .pointer
     */
    pointer: (0, _reselectTree.createLeaf)(
      ['./source', './sourceRange'],
      function(_ref2, range) {
        var ast = _ref2.ast;
        return (0, _map.findRange)(ast, range.start, range.length);
      }
    ),

    /**
     * .node
     */
    node: (0, _reselectTree.createLeaf)(['./source', './pointer'], function(
      _ref3,
      pointer
    ) {
      var ast = _ref3.ast;
      return pointer
        ? _jsonPointer2.default.get(ast, pointer)
        : _jsonPointer2.default.get(ast, '');
    })
  };
}

var solidity = (0, _reselectTree.createSelectorTree)({
  /**
   * solidity.state
   */
  state: function state(_state) {
    return _state.solidity;
  },

  /**
   * solidity.info
   */
  info: {
    /**
     * solidity.info.sources
     */
    sources: (0, _reselectTree.createLeaf)(['/state'], function(state) {
      return state.info.sources.byId;
    })
  },

  /**
   * solidity.current
   */
  current: _extends(
    {
      /**
       * solidity.current.sourceMap
       */
      sourceMap: (0, _reselectTree.createLeaf)(
        [_selectors2.default.current.context],
        function(context) {
          return context ? context.sourceMap : null;
        } //null when no tx loaded
      ),

      /**
       * solidity.current.functionDepthStack
       */
      functionDepthStack: function functionDepthStack(state) {
        return state.solidity.proc.functionDepthStack;
      },

      /**
       * solidity.current.functionDepth
       */
      functionDepth: (0, _reselectTree.createLeaf)(
        ['./functionDepthStack'],
        function(stack) {
          return stack[stack.length - 1];
        }
      ),

      /**
       * solidity.current.instructions
       */
      instructions: (0, _reselectTree.createLeaf)(
        ['/info/sources', _selectors2.default.current.context, './sourceMap'],
        function(sources, context, sourceMap) {
          if (!context) {
            return [];
          }
          var binary = context.binary;
          if (!binary) {
            return [];
          }

          var numInstructions = void 0;
          if (sourceMap) {
            numInstructions = sourceMap.split(';').length;
          } else {
            //HACK
            numInstructions = (binary.length - 2) / 2;
            //this is actually an overestimate, but that's OK
          }

          //because we might be dealing with a constructor with arguments, we do
          //*not* remove metadata manually
          var instructions = _truffleCodeUtils2.default.parseCode(
            binary,
            numInstructions
          );

          if (!sourceMap) {
            // HACK
            // Let's create a source map to use since none exists. This source
            // map maps just as many ranges as there are instructions (or
            // possibly more), and marks them all as being Solidity-internal and
            // not jumps.
            sourceMap =
              binary !== '0x'
                ? '0:0:-1:-'.concat(';'.repeat(instructions.length - 1))
                : '';
          }

          var lineAndColumnMappings = Object.assign.apply(
            Object,
            [{}].concat(
              _toConsumableArray(
                Object.entries(sources).map(function(_ref4) {
                  var _ref5 = _slicedToArray(_ref4, 2),
                    id = _ref5[0],
                    source = _ref5[1].source;

                  return _defineProperty(
                    {},
                    id,
                    _truffleSolidityUtils2.default.getCharacterOffsetToLineAndColumnMapping(
                      source || ''
                    )
                  );
                })
              )
            )
          );
          var humanReadableSourceMap = _truffleSolidityUtils2.default.getHumanReadableSourceMap(
            sourceMap
          );

          var primaryFile = humanReadableSourceMap[0].file;
          debug('primaryFile %o', primaryFile);

          return instructions
            .map(function(instruction, index) {
              // lookup source map by index and add `index` property to
              // instruction
              //

              var sourceMap = humanReadableSourceMap[index] || {};

              return {
                instruction: _extends({}, instruction, { index: index }),
                sourceMap: sourceMap
              };
            })
            .map(function(_ref7) {
              var instruction = _ref7.instruction,
                sourceMap = _ref7.sourceMap;

              // add source map information to instruction, or defaults
              //

              var jump = sourceMap.jump,
                _sourceMap$start = sourceMap.start,
                start = _sourceMap$start === undefined ? 0 : _sourceMap$start,
                _sourceMap$length = sourceMap.length,
                length =
                  _sourceMap$length === undefined ? 0 : _sourceMap$length,
                _sourceMap$file = sourceMap.file,
                file =
                  _sourceMap$file === undefined ? primaryFile : _sourceMap$file;

              var lineAndColumnMapping = lineAndColumnMappings[file] || {};
              var range = {
                start: lineAndColumnMapping[start] || {
                  line: null,
                  column: null
                },
                end: lineAndColumnMapping[start + length] || {
                  line: null,
                  column: null
                }
              };

              if (range.start.line === null) {
                debug('sourceMap %o', sourceMap);
              }

              return _extends({}, instruction, {
                jump: jump,
                start: start,
                length: length,
                file: file,
                range: range
              });
            });
        }
      ),

      /**
       * solidity.current.instructionAtProgramCounter
       */
      instructionAtProgramCounter: (0, _reselectTree.createLeaf)(
        ['./instructions'],
        function(instructions) {
          return Object.assign.apply(
            Object,
            [{}].concat(
              _toConsumableArray(
                instructions.map(function(instruction) {
                  return _defineProperty({}, instruction.pc, instruction);
                })
              )
            )
          );
        }
      )
    },
    createMultistepSelectors(_selectors2.default.current.step),
    {
      /**
       * solidity.current.isSourceRangeFinal
       */
      isSourceRangeFinal: (0, _reselectTree.createLeaf)(
        [
          './instructionAtProgramCounter',
          _selectors2.default.current.step.programCounter,
          _selectors2.default.next.step.programCounter
        ],
        function(map, current, next) {
          if (!map[next]) {
            return true;
          }

          current = map[current];
          next = map[next];

          return (
            current.start != next.start ||
            current.length != next.length ||
            current.file != next.file
          );
        }
      ),

      /*
       * solidity.current.functionsByProgramCounter
       */
      functionsByProgramCounter: (0, _reselectTree.createLeaf)(
        ['./instructions', '/info/sources'],
        function(instructions, sources) {
          return Object.assign.apply(
            Object,
            [{}].concat(
              _toConsumableArray(
                instructions
                  .filter(function(instruction) {
                    return instruction.name === 'JUMPDEST';
                  })
                  .filter(function(instruction) {
                    return instruction.file !== -1;
                  })
                  //note that the designated invalid function *does* have an associated
                  //file, so it *is* safe to just filter out the ones that don't
                  .map(function(instruction) {
                    debug('instruction %O', instruction);
                    var source = instruction.file;
                    debug('source %O', sources[source]);
                    var ast = sources[source].ast;
                    var range = getSourceRange(instruction);
                    var pointer = (0, _map.findRange)(
                      ast,
                      range.start,
                      range.length
                    );
                    var node = pointer
                      ? _jsonPointer2.default.get(ast, pointer)
                      : _jsonPointer2.default.get(ast, '');
                    if (!node || node.nodeType !== 'FunctionDefinition') {
                      //filter out JUMPDESTs that aren't function definitions...
                      //except for the designated invalid function
                      var nextInstruction =
                        instructions[instruction.index + 1] || {};
                      if (nextInstruction.name === 'INVALID') {
                        //designated invalid, include it
                        return _defineProperty({}, instruction.pc, {
                          isDesignatedInvalid: true
                        });
                      } else {
                        //not designated invalid, filter it out
                        return {};
                      }
                    }
                    //otherwise, we're good to go, so let's find the contract node and
                    //put it all together
                    //to get the contract node, we go up twice from the function node;
                    //the path from one to the other should have a very specific form,
                    //so this is easy
                    var contractPointer = pointer.replace(/\/nodes\/\d+$/, '');
                    var contractNode = _jsonPointer2.default.get(
                      ast,
                      contractPointer
                    );
                    return _defineProperty({}, instruction.pc, {
                      source: source,
                      pointer: pointer,
                      node: node,
                      name: node.name,
                      id: node.id,
                      contractPointer: contractPointer,
                      contractNode: contractNode,
                      contractName: contractNode.name,
                      contractId: contractNode.id,
                      contractKind: contractNode.contractKind,
                      isDesignatedInvalid: false
                    });
                  })
              )
            )
          );
        }
      ),

      /**
       * solidity.current.isMultiline
       */
      isMultiline: (0, _reselectTree.createLeaf)(['./sourceRange'], function(
        _ref11
      ) {
        var lines = _ref11.lines;
        return lines.start.line != lines.end.line;
      }),

      /**
       * solidity.current.willJump
       */
      willJump: (0, _reselectTree.createLeaf)(
        [_selectors2.default.current.step.isJump],
        function(isJump) {
          return isJump;
        }
      ),

      /**
       * solidity.current.jumpDirection
       */
      jumpDirection: (0, _reselectTree.createLeaf)(
        ['./instruction'],
        function() {
          var i =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {};
          return i.jump || '-';
        }
      ),

      /**
       * solidity.current.willCall
       */
      willCall: (0, _reselectTree.createLeaf)(
        [_selectors2.default.current.step.isCall],
        function(x) {
          return x;
        }
      ),

      /**
       * solidity.current.willCreate
       */
      willCreate: (0, _reselectTree.createLeaf)(
        [_selectors2.default.current.step.isCreate],
        function(x) {
          return x;
        }
      ),

      /**
       * solidity.current.callsPrecompileOrExternal
       */
      callsPrecompileOrExternal: (0, _reselectTree.createLeaf)(
        [_selectors2.default.current.step.callsPrecompileOrExternal],
        function(x) {
          return x;
        }
      ),

      /**
       * solidity.current.willReturn
       */
      willReturn: (0, _reselectTree.createLeaf)(
        [_selectors2.default.current.step.isHalting],
        function(isHalting) {
          return isHalting;
        }
      ),

      /**
       * solidity.current.willFail
       */
      willFail: (0, _reselectTree.createLeaf)(
        [_selectors2.default.current.step.isExceptionalHalting],
        function(x) {
          return x;
        }
      ),

      /*
       * solidity.current.nextMapped
       * returns the next trace step after this one which is sourcemapped
       * HACK: this assumes we're not about to change context! don't use this if
       * we are!
       * ALSO, this may return undefined, so be prepared for that
       */
      nextMapped: (0, _reselectTree.createLeaf)(
        [
          './instructionAtProgramCounter',
          _selectors4.default.steps,
          _selectors4.default.index
        ],
        function(map, steps, index) {
          return steps.slice(index + 1).find(function(_ref12) {
            var pc = _ref12.pc;
            return map[pc] && map[pc].file !== -1;
          });
        }
      )
    }
  ),

  /**
   * solidity.next
   * HACK WARNING: do not use these selectors when the current instruction is a
   * context change! (evm call or evm return)
   */
  next: createMultistepSelectors(_selectors2.default.next.step)
});

exports.default = solidity;
