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

exports.scope = scope;
exports.declare = declare;
exports.defineType = defineType;
exports.decode = decode;
exports.reset = reset;
exports.recordAllocations = recordAllocations;
exports.saga = saga;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _effects = require('redux-saga/effects');

var _helpers = require('../../helpers');

var _actions = require('../../trace/actions');

var _actions2 = require('../actions');

var actions = _interopRequireWildcard(_actions2);

var _sagas = require('../../trace/sagas');

var trace = _interopRequireWildcard(_sagas);

var _sagas2 = require('../../evm/sagas');

var evm = _interopRequireWildcard(_sagas2);

var _sagas3 = require('../../web3/sagas');

var web3 = _interopRequireWildcard(_sagas3);

var _selectors = require('../selectors');

var _selectors2 = _interopRequireDefault(_selectors);

var _lodash = require('lodash.sum');

var _lodash2 = _interopRequireDefault(_lodash);

var _truffleDecodeUtils = require('truffle-decode-utils');

var DecodeUtils = _interopRequireWildcard(_truffleDecodeUtils);

var _truffleDecoder = require('truffle-decoder');

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

var _marked = /*#__PURE__*/ regeneratorRuntime.mark(scope),
  _marked2 = /*#__PURE__*/ regeneratorRuntime.mark(declare),
  _marked3 = /*#__PURE__*/ regeneratorRuntime.mark(defineType),
  _marked4 = /*#__PURE__*/ regeneratorRuntime.mark(tickSaga),
  _marked5 = /*#__PURE__*/ regeneratorRuntime.mark(decode),
  _marked6 = /*#__PURE__*/ regeneratorRuntime.mark(variablesAndMappingsSaga),
  _marked7 = /*#__PURE__*/ regeneratorRuntime.mark(reset),
  _marked8 = /*#__PURE__*/ regeneratorRuntime.mark(recordAllocations),
  _marked9 = /*#__PURE__*/ regeneratorRuntime.mark(saga);

var debug = (0, _debug2.default)('debugger:data:sagas');

function scope(nodeId, pointer, parentId, sourceId) {
  return regeneratorRuntime.wrap(
    function scope$(_context) {
      while (1) {
        switch ((_context.prev = _context.next)) {
          case 0:
            _context.next = 2;
            return (0, _effects.put)(
              actions.scope(nodeId, pointer, parentId, sourceId)
            );

          case 2:
          case 'end':
            return _context.stop();
        }
      }
    },
    _marked,
    this
  );
}

function declare(node) {
  return regeneratorRuntime.wrap(
    function declare$(_context2) {
      while (1) {
        switch ((_context2.prev = _context2.next)) {
          case 0:
            _context2.next = 2;
            return (0, _effects.put)(actions.declare(node));

          case 2:
          case 'end':
            return _context2.stop();
        }
      }
    },
    _marked2,
    this
  );
}

function defineType(node) {
  return regeneratorRuntime.wrap(
    function defineType$(_context3) {
      while (1) {
        switch ((_context3.prev = _context3.next)) {
          case 0:
            _context3.next = 2;
            return (0, _effects.put)(actions.defineType(node));

          case 2:
          case 'end':
            return _context3.stop();
        }
      }
    },
    _marked3,
    this
  );
}

function tickSaga() {
  return regeneratorRuntime.wrap(
    function tickSaga$(_context4) {
      while (1) {
        switch ((_context4.prev = _context4.next)) {
          case 0:
            debug('got TICK');

            return _context4.delegateYield(variablesAndMappingsSaga(), 't0', 2);

          case 2:
            debug('about to SUBTOCK');
            return _context4.delegateYield(
              trace.signalTickSagaCompletion(),
              't1',
              4
            );

          case 4:
          case 'end':
            return _context4.stop();
        }
      }
    },
    _marked4,
    this
  );
}

function decode(definition, ref) {
  var referenceDeclarations,
    state,
    mappingKeys,
    allocations,
    instances,
    contexts,
    currentContext,
    internalFunctionsTable,
    blockNumber,
    ZERO_WORD,
    NO_CODE,
    decoder,
    result,
    request,
    response,
    address,
    binary;
  return regeneratorRuntime.wrap(
    function decode$(_context5) {
      while (1) {
        switch ((_context5.prev = _context5.next)) {
          case 0:
            _context5.next = 2;
            return (0, _effects.select)(
              _selectors2.default.views.referenceDeclarations
            );

          case 2:
            referenceDeclarations = _context5.sent;
            _context5.next = 5;
            return (0, _effects.select)(_selectors2.default.current.state);

          case 5:
            state = _context5.sent;
            _context5.next = 8;
            return (0, _effects.select)(_selectors2.default.views.mappingKeys);

          case 8:
            mappingKeys = _context5.sent;
            _context5.next = 11;
            return (0, _effects.select)(_selectors2.default.info.allocations);

          case 11:
            allocations = _context5.sent;
            _context5.next = 14;
            return (0, _effects.select)(_selectors2.default.views.instances);

          case 14:
            instances = _context5.sent;
            _context5.next = 17;
            return (0, _effects.select)(_selectors2.default.views.contexts);

          case 17:
            contexts = _context5.sent;
            _context5.next = 20;
            return (0, _effects.select)(_selectors2.default.current.context);

          case 20:
            currentContext = _context5.sent;
            _context5.next = 23;
            return (0, _effects.select)(
              _selectors2.default.current.functionsByProgramCounter
            );

          case 23:
            internalFunctionsTable = _context5.sent;
            _context5.next = 26;
            return (0, _effects.select)(_selectors2.default.views.blockNumber);

          case 26:
            blockNumber = _context5.sent;
            ZERO_WORD = new Uint8Array(DecodeUtils.EVM.WORD_SIZE);

            ZERO_WORD.fill(0);
            NO_CODE = new Uint8Array(); //empty array

            decoder = (0, _truffleDecoder.forEvmState)(definition, ref, {
              referenceDeclarations: referenceDeclarations,
              state: state,
              mappingKeys: mappingKeys,
              storageAllocations: allocations.storage,
              memoryAllocations: allocations.memory,
              calldataAllocations: allocations.calldata,
              contexts: contexts,
              currentContext: currentContext,
              internalFunctionsTable: internalFunctionsTable
            });
            result = decoder.next();

          case 32:
            if (result.done) {
              _context5.next = 60;
              break;
            }

            request = result.value;
            response = void 0;
            _context5.t0 = request.type;
            _context5.next =
              _context5.t0 === 'storage'
                ? 38
                : _context5.t0 === 'code'
                ? 40
                : 56;
            break;

          case 38:
            //the debugger supplies all storage it knows at the beginning.
            //any storage it does not know is presumed to be zero.
            response = ZERO_WORD;
            return _context5.abrupt('break', 57);

          case 40:
            address = request.address;

            if (!(address in instances)) {
              _context5.next = 45;
              break;
            }

            response = instances[address];
            _context5.next = 55;
            break;

          case 45:
            if (!(address === DecodeUtils.EVM.ZERO_ADDRESS)) {
              _context5.next = 49;
              break;
            }

            //HACK: to avoid displaying the zero address to the user as an
            //affected address just because they decoded a contract or external
            //function variable that hadn't been initialized yet, we give the
            //zero address's codelessness its own private cache :P
            response = NO_CODE;
            _context5.next = 55;
            break;

          case 49:
            //I don't want to write a new web3 saga, so let's just use
            //obtainBinaries with a one-element array
            debug('fetching binary');
            return _context5.delegateYield(
              web3.obtainBinaries([address], blockNumber),
              't1',
              51
            );

          case 51:
            binary = _context5.t1[0];

            debug('adding instance');
            return _context5.delegateYield(
              evm.addInstance(address, binary),
              't2',
              54
            );

          case 54:
            response = DecodeUtils.Conversion.toBytes(binary);

          case 55:
            return _context5.abrupt('break', 57);

          case 56:
            debug('unrecognized request type!');

          case 57:
            result = decoder.next(response);
            _context5.next = 32;
            break;

          case 60:
            return _context5.abrupt(
              'return',
              DecodeUtils.Conversion.cleanContainers(result.value)
            );

          case 61:
          case 'end':
            return _context5.stop();
        }
      }
    },
    _marked5,
    this
  );
}

function variablesAndMappingsSaga() {
  var node,
    scopes,
    referenceDeclarations,
    allocations,
    currentAssignments,
    mappedPaths,
    currentDepth,
    address,
    stack,
    alternateStack,
    top,
    assignment,
    assignments,
    preambleAssignments,
    baseExpression,
    slot,
    path,
    modifier,
    currentIndex,
    parameters,
    parametersLeft,
    adjustment,
    nextModifier,
    _parameters,
    allocation,
    id,
    idObj,
    fullId,
    varId,
    keyDefinition,
    indexValue,
    indexDefinition,
    indexId,
    indexIdObj,
    fullIndexId,
    indexReference,
    splicedDefinition,
    indexConstantDeclaration,
    indexConstantDefinition,
    _slot,
    structId,
    memberAllocation;

  return regeneratorRuntime.wrap(
    function variablesAndMappingsSaga$(_context6) {
      while (1) {
        switch ((_context6.prev = _context6.next)) {
          case 0:
            _context6.next = 2;
            return (0, _effects.select)(_selectors2.default.current.node);

          case 2:
            node = _context6.sent;
            _context6.next = 5;
            return (0, _effects.select)(
              _selectors2.default.views.scopes.inlined
            );

          case 5:
            scopes = _context6.sent;
            _context6.next = 8;
            return (0, _effects.select)(
              _selectors2.default.views.referenceDeclarations
            );

          case 8:
            referenceDeclarations = _context6.sent;
            _context6.next = 11;
            return (0, _effects.select)(
              _selectors2.default.info.allocations.storage
            );

          case 11:
            allocations = _context6.sent;
            _context6.next = 14;
            return (0, _effects.select)(_selectors2.default.proc.assignments);

          case 14:
            currentAssignments = _context6.sent;
            _context6.next = 17;
            return (0, _effects.select)(_selectors2.default.proc.mappedPaths);

          case 17:
            mappedPaths = _context6.sent;
            _context6.next = 20;
            return (0, _effects.select)(
              _selectors2.default.current.functionDepth
            );

          case 20:
            currentDepth = _context6.sent;
            _context6.next = 23;
            return (0, _effects.select)(_selectors2.default.current.address);

          case 23:
            address = _context6.sent;
            _context6.next = 26;
            return (0, _effects.select)(_selectors2.default.next.state.stack);

          case 26:
            stack = _context6.sent;
            _context6.next = 29;
            return (0, _effects.select)(
              _selectors2.default.nextMapped.state.stack
            );

          case 29:
            alternateStack = _context6.sent;

            if (stack) {
              _context6.next = 32;
              break;
            }

            return _context6.abrupt('return');

          case 32:
            top = stack.length - 1;

            if (node) {
              _context6.next = 35;
              break;
            }

            return _context6.abrupt('return');

          case 35:
            _context6.next = 37;
            return (0, _effects.select)(
              _selectors2.default.views.atLastInstructionForSourceRange
            );

          case 37:
            if (_context6.sent) {
              _context6.next = 39;
              break;
            }

            return _context6.abrupt('return');

          case 39:
            _context6.next = 41;
            return (0, _effects.select)(
              _selectors2.default.current.aboutToModify
            );

          case 41:
            if (!_context6.sent) {
              _context6.next = 56;
              break;
            }

            _context6.next = 44;
            return (0, _effects.select)(
              _selectors2.default.current.modifierBeingInvoked
            );

          case 44:
            modifier = _context6.sent;
            _context6.next = 47;
            return (0, _effects.select)(
              _selectors2.default.current.modifierArgumentIndex
            );

          case 47:
            currentIndex = _context6.sent;

            debug('currentIndex %d', currentIndex);
            parameters = modifier.parameters.parameters;
            //now: look at the parameters *after* the current index.  we'll need to
            //adjust for those.

            parametersLeft = parameters.slice(currentIndex + 1);
            adjustment = (0, _lodash2.default)(
              parametersLeft.map(DecodeUtils.Definition.stackSize)
            );

            debug('adjustment %d', adjustment);
            preambleAssignments = assignParameters(
              parameters,
              top + adjustment,
              currentDepth
            );
            _context6.next = 57;
            break;

          case 56:
            preambleAssignments = {};

          case 57:
            _context6.t0 = node.nodeType;
            _context6.next =
              _context6.t0 === 'FunctionDefinition'
                ? 60
                : _context6.t0 === 'ModifierDefinition'
                ? 60
                : _context6.t0 === 'ContractDefinition'
                ? 72
                : _context6.t0 === 'FunctionTypeName'
                ? 82
                : _context6.t0 === 'VariableDeclaration'
                ? 85
                : _context6.t0 === 'IndexAccess'
                ? 97
                : _context6.t0 === 'MemberAccess'
                ? 170
                : 186;
            break;

          case 60:
            _context6.next = 62;
            return (0, _effects.select)(
              _selectors2.default.next.modifierBeingInvoked
            );

          case 62:
            nextModifier = _context6.sent;

            if (!(nextModifier && nextModifier.id === node.id)) {
              _context6.next = 65;
              break;
            }

            return _context6.abrupt('break', 195);

          case 65:
            _parameters = node.parameters.parameters;
            //note that we do *not* include return parameters, since those are
            //handled by the VariableDeclaration case (no, I don't know why it
            //works out that way)

            //we can skip preambleAssignments here, that isn't used in this case

            assignments = assignParameters(_parameters, top, currentDepth);

            debug('Function definition case');
            debug('assignments %O', assignments);

            _context6.next = 71;
            return (0, _effects.put)(actions.assign(assignments));

          case 71:
            return _context6.abrupt('break', 195);

          case 72:
            allocation = allocations[node.id];

            debug('Contract definition case');
            debug('allocations %O', allocations);
            debug('allocation %O', allocation);
            assignments = {};
            for (id in allocation.members) {
              id = Number(id); //not sure why we're getting them as strings, but...
              idObj = { astId: id, address: address };
              fullId = (0, _helpers.stableKeccak256)(idObj);
              //we don't use makeAssignment here as we had to compute the ID anyway

              assignment = _extends({}, idObj, {
                id: fullId,
                ref: _extends(
                  {},
                  (currentAssignments.byId[fullId] || {}).ref || {},
                  allocation.members[id].pointer
                )
              });
              assignments[fullId] = assignment;
            }
            debug('assignments %O', assignments);

            //this case doesn't need preambleAssignments either
            _context6.next = 81;
            return (0, _effects.put)(actions.assign(assignments));

          case 81:
            return _context6.abrupt('break', 195);

          case 82:
            //HACK
            //for some reasons, for declarations of local variables of function type,
            //we land on the FunctionTypeName instead of the VariableDeclaration,
            //so we replace the node with its parent (the VariableDeclaration)
            node = scopes[scopes[node.id].parentId].definition;
            //let's do a quick check that it *is* a VariableDeclaration before
            //continuing

            if (!(node.nodeType !== 'VariableDeclaration')) {
              _context6.next = 85;
              break;
            }

            return _context6.abrupt('break', 195);

          case 85:
            varId = node.id;

            debug('Variable declaration case');
            debug('currentDepth %d varId %d', currentDepth, varId);

            //NOTE: We're going to make the assignment conditional here; here's why.
            //There's a bug where calling the autogenerated accessor for a public
            //contract variable causes the debugger to see two additional
            //declarations for that variable... which this code reads as local
            //variable declarations.  Rather than prevent this at the source, we're
            //just going to check for it here, by not adding a local variable if said
            //variable is already a contract variable.

            if (
              !(
                currentAssignments.byAstId[varId] !== undefined &&
                currentAssignments.byAstId[varId].some(function(id) {
                  return currentAssignments.byId[id].address !== undefined;
                })
              )
            ) {
              _context6.next = 91;
              break;
            }

            debug('already a contract variable!');
            return _context6.abrupt('break', 195);

          case 91:
            //otherwise, go ahead and make the assignment
            assignment = (0, _helpers.makeAssignment)(
              { astId: varId, stackframe: currentDepth },
              {
                stack: {
                  from: top - DecodeUtils.Definition.stackSize(node) + 1,
                  to: top
                }
              }
            );
            assignments = _defineProperty({}, assignment.id, assignment);
            //this case doesn't need preambleAssignments either
            debug('assignments: %O', assignments);
            _context6.next = 96;
            return (0, _effects.put)(actions.assign(assignments));

          case 96:
            return _context6.abrupt('break', 195);

          case 97:
            // to track `mapping` types known indices
            // (and also *some* known indices for arrays)

            //HACK: we use the alternate stack in this case

            debug('Index access case');

            //we're going to start by doing the same thing as in the default case
            //(see below) -- getting things ready for an assignment.  Then we're
            //going to forget this for a bit while we handle the rest...
            assignments = _extends(
              {},
              preambleAssignments,
              literalAssignments(node, alternateStack, currentDepth)
            );

            //we'll need this
            baseExpression = node.baseExpression;

            //but first, a diversion -- is this something that could not *possibly*
            //lead to a mapping?  i.e., either a bytes, or an array of non-reference
            //types, or a non-storage array?
            //if so, we'll just do the assign and quit out early
            //(note: we write it this way because mappings aren't caught by
            //isReference)

            if (
              !(
                DecodeUtils.Definition.typeClass(baseExpression) === 'bytes' ||
                (DecodeUtils.Definition.typeClass(baseExpression) === 'array' &&
                  (DecodeUtils.Definition.isReference(node)
                    ? DecodeUtils.Definition.referenceType(baseExpression) !==
                      'storage'
                    : !DecodeUtils.Definition.isMapping(node)))
              )
            ) {
              _context6.next = 108;
              break;
            }

            debug('Index case bailed out early');
            debug(
              'typeClass %s',
              DecodeUtils.Definition.typeClass(baseExpression)
            );
            debug(
              'referenceType %s',
              DecodeUtils.Definition.referenceType(baseExpression)
            );
            debug(
              'isReference(node) %o',
              DecodeUtils.Definition.isReference(node)
            );
            _context6.next = 107;
            return (0, _effects.put)(actions.assign(assignments));

          case 107:
            return _context6.abrupt('break', 195);

          case 108:
            keyDefinition = DecodeUtils.Definition.keyDefinition(
              baseExpression,
              scopes
            );
            //if we're dealing with an array, this will just hack up a uint definition
            //:)

            //begin subsection: key decoding
            //(I tried factoring this out into its own saga but it didn't work when I
            //did :P )

            indexValue = void 0;
            indexDefinition = node.indexExpression;

          //why the loop? see the end of the block it heads for an explanatory
          //comment

          case 111:
            if (!(indexValue === undefined)) {
              _context6.next = 145;
              break;
            }

            indexId = indexDefinition.id;
            //indices need to be identified by stackframe

            indexIdObj = { astId: indexId, stackframe: currentDepth };
            fullIndexId = (0, _helpers.stableKeccak256)(indexIdObj);
            indexReference = (currentAssignments.byId[fullIndexId] || {}).ref;

            if (!DecodeUtils.Definition.isSimpleConstant(indexDefinition)) {
              _context6.next = 122;
              break;
            }

            //while the main case is the next one, where we look for a prior
            //assignment, we need this case (and need it first) for two reasons:
            //1. some constant expressions (specifically, string and hex literals)
            //aren't sourcemapped to and so won't have a prior assignment
            //2. if the key type is bytesN but the expression is constant, the
            //value will go on the stack *left*-padded instead of right-padded,
            //so looking for a prior assignment will read the wrong value.
            //so instead it's preferable to use the constant directly.
            debug('about to decode simple literal');
            return _context6.delegateYield(
              decode(keyDefinition, {
                definition: indexDefinition
              }),
              't1',
              119
            );

          case 119:
            indexValue = _context6.t1;
            _context6.next = 143;
            break;

          case 122:
            if (!indexReference) {
              _context6.next = 130;
              break;
            }

            //if a prior assignment is found
            splicedDefinition = void 0;
            //in general, we want to decode using the key definition, not the index
            //definition. however, the key definition may have the wrong location
            //on it.  so, when applicable, we splice the index definition location
            //onto the key definition location.

            if (DecodeUtils.Definition.isReference(indexDefinition)) {
              splicedDefinition = DecodeUtils.Definition.spliceLocation(
                keyDefinition,
                DecodeUtils.Definition.referenceType(indexDefinition)
              );
              //we could put code here to add on the "_ptr" ending when absent,
              //but we presently ignore that ending, so we'll skip that
            } else {
              splicedDefinition = keyDefinition;
            }
            debug('about to decode');
            return _context6.delegateYield(
              decode(splicedDefinition, indexReference),
              't2',
              127
            );

          case 127:
            indexValue = _context6.t2;
            _context6.next = 143;
            break;

          case 130:
            if (
              !(
                indexDefinition.referencedDeclaration &&
                scopes[indexDefinition.referenceDeclaration]
              )
            ) {
              _context6.next = 142;
              break;
            }

            //there's one more reason we might have failed to decode it: it might be a
            //constant state variable.  Unfortunately, we don't know how to decode all
            //those at the moment, but we can handle the ones we do know how to decode.
            //In the future hopefully we will decode all of them
            debug(
              'referencedDeclaration %d',
              indexDefinition.referencedDeclaration
            );
            indexConstantDeclaration =
              scopes[indexDefinition.referencedDeclaration].definition;

            debug('indexConstantDeclaration %O', indexConstantDeclaration);

            if (!indexConstantDeclaration.constant) {
              _context6.next = 140;
              break;
            }

            indexConstantDefinition = indexConstantDeclaration.value;
            //next line filters out constants we don't know how to handle

            if (
              !DecodeUtils.Definition.isSimpleConstant(indexConstantDefinition)
            ) {
              _context6.next = 140;
              break;
            }

            debug('about to decode simple constant');
            return _context6.delegateYield(
              decode(keyDefinition, {
                definition: indexConstantDeclaration.value
              }),
              't3',
              139
            );

          case 139:
            indexValue = _context6.t3;

          case 140:
            _context6.next = 143;
            break;

          case 142:
            //there's still one more reason we might have failed to decode it:
            //certain (silent) type conversions aren't sourcemapped either.
            //(thankfully, any type conversion that actually *does* something seems
            //to be sourcemapped.)  So if we've failed to decode it, we try again
            //with the argument of the type conversion, if it is one; we leave
            //indexValue undefined so the loop will continue
            //(note that this case is last for a reason; if this were earlier, it
            //would catch *non*-silent type conversions, which we want to just read
            //off the stack)
            if (indexDefinition.kind === 'typeConversion') {
              indexDefinition = indexDefinition.arguments[0];
            }
            //otherwise, we've just totally failed to decode it, so we mark
            //indexValue as null (as distinct from undefined) to indicate this.  In
            //the future, we should be able to decode all mapping keys, but we're
            //not quite there yet, sorry (because we can't yet handle all constant
            //state variables)
            else {
              indexValue = null;
            }

          case 143:
            _context6.next = 111;
            break;

          case 145:
            //end subsection: key decoding

            debug('index value %O', indexValue);
            debug('keyDefinition %o', keyDefinition);

            //whew! But we're not done yet -- we need to turn this decoded key into
            //an actual path (assuming we *did* decode it)
            //OK, not an actual path -- we're just going to use a simple offset for
            //the path.  But that's OK, because the mappedPaths reducer will turn
            //it into an actual path.

            if (!(indexValue !== null)) {
              _context6.next = 166;
              break;
            }

            path = fetchBasePath(
              baseExpression,
              mappedPaths,
              currentAssignments,
              currentDepth
            );

            _slot = { path: path };

            //we need to do things differently depending on whether we're dealing
            //with an array or mapping

            _context6.t4 = DecodeUtils.Definition.typeClass(baseExpression);
            _context6.next =
              _context6.t4 === 'array'
                ? 153
                : _context6.t4 === 'mapping'
                ? 156
                : 160;
            break;

          case 153:
            _slot.hashPath = DecodeUtils.Definition.isDynamicArray(
              baseExpression
            );
            _slot.offset = indexValue.muln(
              (0, _truffleDecoder.storageSize)(
                node,
                referenceDeclarations,
                allocations
              ).words
            );
            return _context6.abrupt('break', 161);

          case 156:
            _slot.key = indexValue;
            _slot.keyEncoding = DecodeUtils.Definition.keyEncoding(
              keyDefinition
            );
            _slot.offset = new _bn2.default(0);
            return _context6.abrupt('break', 161);

          case 160:
            debug('unrecognized index access!');

          case 161:
            debug('slot %O', _slot);

            //now, map it! (and do the assign as well)
            _context6.next = 164;
            return (0, _effects.put)(
              actions.mapPathAndAssign(
                address,
                _slot,
                assignments,
                DecodeUtils.Definition.typeIdentifier(node),
                DecodeUtils.Definition.typeIdentifier(baseExpression)
              )
            );

          case 164:
            _context6.next = 169;
            break;

          case 166:
            //if we failed to decode, just do the assign from above
            debug('failed to decode, just assigning');
            _context6.next = 169;
            return (0, _effects.put)(actions.assign(assignments));

          case 169:
            return _context6.abrupt('break', 195);

          case 170:
            //HACK: we use the alternate stack in this case

            //we're going to start by doing the same thing as in the default case
            //(see below) -- getting things ready for an assignment.  Then we're
            //going to forget this for a bit while we handle the rest...
            assignments = _extends(
              {},
              preambleAssignments,
              literalAssignments(node, alternateStack, currentDepth)
            );

            debug('Member access case');

            //MemberAccess uses expression, not baseExpression
            baseExpression = node.expression;

            //if this isn't a storage struct, or the element isn't of reference type,
            //we'll just do the assignment and quit out (again, note that mappings
            //aren't caught by isReference)

            if (
              !(
                DecodeUtils.Definition.typeClass(baseExpression) !== 'struct' ||
                (DecodeUtils.Definition.isReference(node)
                  ? DecodeUtils.Definition.referenceType(baseExpression) !==
                    'storage'
                  : !DecodeUtils.Definition.isMapping(node))
              )
            ) {
              _context6.next = 178;
              break;
            }

            debug('Member case bailed out early');
            _context6.next = 177;
            return (0, _effects.put)(actions.assign(assignments));

          case 177:
            return _context6.abrupt('break', 195);

          case 178:
            //but if it is a storage struct, we have to map the path as well
            path = fetchBasePath(
              baseExpression,
              mappedPaths,
              currentAssignments,
              currentDepth
            );

            slot = { path: path };

            structId = DecodeUtils.Definition.typeId(baseExpression);
            memberAllocation =
              allocations[structId].members[node.referencedDeclaration];

            slot.offset = memberAllocation.pointer.storage.from.slot.offset.clone();

            debug('slot %o', slot);
            _context6.next = 186;
            return (0, _effects.put)(
              actions.mapPathAndAssign(
                address,
                slot,
                assignments,
                DecodeUtils.Definition.typeIdentifier(node),
                DecodeUtils.Definition.typeIdentifier(baseExpression)
              )
            );

          case 186:
            if (!(node.typeDescriptions == undefined)) {
              _context6.next = 188;
              break;
            }

            return _context6.abrupt('break', 195);

          case 188:
            debug('decoding expression value %O', node.typeDescriptions);
            debug('default case');
            debug('currentDepth %d node.id %d', currentDepth, node.id);

            assignments = _extends(
              {},
              preambleAssignments,
              literalAssignments(node, stack, currentDepth)
            );
            _context6.next = 194;
            return (0, _effects.put)(actions.assign(assignments));

          case 194:
            return _context6.abrupt('break', 195);

          case 195:
          case 'end':
            return _context6.stop();
        }
      }
    },
    _marked6,
    this
  );
}

function reset() {
  return regeneratorRuntime.wrap(
    function reset$(_context7) {
      while (1) {
        switch ((_context7.prev = _context7.next)) {
          case 0:
            _context7.next = 2;
            return (0, _effects.put)(actions.reset());

          case 2:
          case 'end':
            return _context7.stop();
        }
      }
    },
    _marked7,
    this
  );
}

function recordAllocations() {
  var contracts,
    referenceDeclarations,
    storageAllocations,
    memoryAllocations,
    calldataAllocations;
  return regeneratorRuntime.wrap(
    function recordAllocations$(_context8) {
      while (1) {
        switch ((_context8.prev = _context8.next)) {
          case 0:
            _context8.next = 2;
            return (0, _effects.select)(
              _selectors2.default.views.userDefinedTypes.contractDefinitions
            );

          case 2:
            contracts = _context8.sent;

            debug('contracts %O', contracts);
            _context8.next = 6;
            return (0, _effects.select)(
              _selectors2.default.views.referenceDeclarations
            );

          case 6:
            referenceDeclarations = _context8.sent;

            debug('referenceDeclarations %O', referenceDeclarations);
            storageAllocations = (0, _truffleDecoder.getStorageAllocations)(
              referenceDeclarations,
              contracts
            );

            debug('storageAllocations %O', storageAllocations);
            memoryAllocations = (0, _truffleDecoder.getMemoryAllocations)(
              referenceDeclarations
            );
            calldataAllocations = (0, _truffleDecoder.getCalldataAllocations)(
              referenceDeclarations
            );
            _context8.next = 14;
            return (0, _effects.put)(
              actions.allocate(
                storageAllocations,
                memoryAllocations,
                calldataAllocations
              )
            );

          case 14:
          case 'end':
            return _context8.stop();
        }
      }
    },
    _marked8,
    this
  );
}

function literalAssignments(node, stack, currentDepth) {
  var top = stack.length - 1;

  var literal = (0, _truffleDecoder.readStack)(
    stack,
    top - DecodeUtils.Definition.stackSize(node) + 1,
    top
  );

  var assignment = (0, _helpers.makeAssignment)(
    { astId: node.id, stackframe: currentDepth },
    { literal: literal }
  );

  return _defineProperty({}, assignment.id, assignment);
}

//takes a parameter list as given in the AST
function assignParameters(parameters, top, functionDepth) {
  var reverseParameters = parameters.slice().reverse();
  //reverse is in-place, so we use slice() to clone first
  debug('reverseParameters %o', parameters);

  var currentPosition = top;
  var assignments = {};

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (
      var _iterator = reverseParameters[Symbol.iterator](), _step;
      !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
      _iteratorNormalCompletion = true
    ) {
      var parameter = _step.value;

      var words = DecodeUtils.Definition.stackSize(parameter);
      var pointer = {
        stack: {
          from: currentPosition - words + 1,
          to: currentPosition
        }
      };
      var assignment = (0, _helpers.makeAssignment)(
        { astId: parameter.id, stackframe: functionDepth },
        pointer
      );
      assignments[assignment.id] = assignment;
      currentPosition -= words;
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

  return assignments;
}

function fetchBasePath(
  baseNode,
  mappedPaths,
  currentAssignments,
  currentDepth
) {
  var fullId = (0, _helpers.stableKeccak256)({
    astId: baseNode.id,
    stackframe: currentDepth
  });
  //base expression is an expression, and so has a literal assigned to
  //it
  var offset = DecodeUtils.Conversion.toBN(
    currentAssignments.byId[fullId].ref.literal
  );
  return { offset: offset };
}

function saga() {
  return regeneratorRuntime.wrap(
    function saga$(_context9) {
      while (1) {
        switch ((_context9.prev = _context9.next)) {
          case 0:
            _context9.next = 2;
            return (0, _effects.takeEvery)(_actions.TICK, tickSaga);

          case 2:
          case 'end':
            return _context9.stop();
        }
      }
    },
    _marked9,
    this
  );
}

exports.default = (0, _helpers.prefixName)('data', saga);
