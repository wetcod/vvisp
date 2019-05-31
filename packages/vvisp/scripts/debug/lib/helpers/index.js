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

exports.isDeliberatelySkippedNodeType = isDeliberatelySkippedNodeType;
exports.isSkippedNodeType = isSkippedNodeType;
exports.prefixName = prefixName;
exports.extractPrimarySource = extractPrimarySource;
exports.keccak256 = keccak256;
exports.stableKeccak256 = stableKeccak256;
exports.makeAssignment = makeAssignment;
exports.isCallMnemonic = isCallMnemonic;
exports.isShortCallMnemonic = isShortCallMnemonic;
exports.isDelegateCallMnemonicBroad = isDelegateCallMnemonicBroad;
exports.isDelegateCallMnemonicStrict = isDelegateCallMnemonicStrict;
exports.isStaticCallMnemonic = isStaticCallMnemonic;
exports.isCreateMnemonic = isCreateMnemonic;
exports.isNormalHaltingMnemonic = isNormalHaltingMnemonic;

var _truffleDecodeUtils = require('truffle-decode-utils');

var utils = _interopRequireWildcard(_truffleDecodeUtils);

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

var stringify = require('json-stable-stringify');

/** AST node types that are skipped by stepNext() to filter out some noise */
function isDeliberatelySkippedNodeType(node) {
  var skippedTypes = ['ContractDefinition', 'VariableDeclaration'];
  return skippedTypes.includes(node.nodeType);
}

//HACK
//these aren't the only types of skipped nodes, but determining all skipped
//nodes would be too difficult
function isSkippedNodeType(node) {
  var otherSkippedTypes = ['VariableDeclarationStatement', 'Mapping'];
  return (
    isDeliberatelySkippedNodeType(node) ||
    otherSkippedTypes.includes(node.nodeType) ||
    node.nodeType.includes('TypeName') || //HACK
    //skip string literals too -- we'll handle that manually
    (node.typeDescriptions !== undefined && //seems this sometimes happens?
      utils.Definition.typeClass(node) === 'stringliteral')
  );
}

function prefixName(prefix, fn) {
  Object.defineProperty(fn, 'name', {
    value: prefix + '.' + fn.name,
    configurable: true
  });

  return fn;
}

/*
 * extract the primary source from a source map
 * (i.e., the source for the first instruction, found
 * between the second and third colons)
 * (this is something of a HACK)
 */
function extractPrimarySource(sourceMap) {
  return parseInt(sourceMap.match(/^[^:]+:[^:]+:([^:]+):/)[1]);
}

/**
 * @return 0x-prefix string of keccak256 hash
 */
function keccak256() {
  var _utils$EVM;

  return utils.Conversion.toHexString(
    (_utils$EVM = utils.EVM).keccak256.apply(_utils$EVM, arguments)
  );
}

/**
 * Given an object, return a stable hash by first running it through a stable
 * stringify operation before hashing
 */
function stableKeccak256(obj) {
  return keccak256({ type: 'string', value: stringify(obj) });
}

/*
 * used by data; takes an id object and a ref (pointer) and returns a full
 * corresponding assignment object
 */
function makeAssignment(idObj, ref) {
  var id = stableKeccak256(idObj);
  return _extends({}, idObj, { id: id, ref: ref });
}

/*
 * Given a mmemonic, determine whether it's the mnemonic of a calling
 * instruction (does NOT include creation instructions)
 */
function isCallMnemonic(op) {
  var calls = ['CALL', 'DELEGATECALL', 'STATICCALL', 'CALLCODE'];
  return calls.includes(op);
}

/*
 * returns true for mnemonics for calls that take only 6 args instead of 7
 */
function isShortCallMnemonic(op) {
  var shortCalls = ['DELEGATECALL', 'STATICCALL'];
  return shortCalls.includes(op);
}

/*
 * returns true for mnemonics for calls that delegate storage
 */
function isDelegateCallMnemonicBroad(op) {
  var delegateCalls = ['DELEGATECALL', 'CALLCODE'];
  return delegateCalls.includes(op);
}

/*
 * returns true for mnemonics for calls that delegate everything
 */
function isDelegateCallMnemonicStrict(op) {
  var delegateCalls = ['DELEGATECALL'];
  return delegateCalls.includes(op);
}

/*
 * returns true for mnemonics for static calls
 */
function isStaticCallMnemonic(op) {
  var delegateCalls = ['STATICCALL'];
  return delegateCalls.includes(op);
}

/*
 * Given a mmemonic, determine whether it's the mnemonic of a creation
 * instruction
 */
function isCreateMnemonic(op) {
  var creates = ['CREATE', 'CREATE2'];
  return creates.includes(op);
}

/*
 * Given a mmemonic, determine whether it's the mnemonic of a normal
 * halting instruction
 */
function isNormalHaltingMnemonic(op) {
  var halts = ['STOP', 'RETURN', 'SELFDESTRUCT', 'SUICIDE'];
  //the mnemonic SUICIDE is no longer used, but just in case, I'm including it
  return halts.includes(op);
}
