'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.addContext = addContext;
exports.normalizeContexts = normalizeContexts;
exports.addInstance = addInstance;
exports.saveGlobals = saveGlobals;
exports.call = call;
exports.create = create;
exports.returnCall = returnCall;
exports.fail = fail;
exports.store = store;
exports.load = load;
exports.reset = reset;
exports.unloadTransaction = unloadTransaction;
var ADD_CONTEXT = (exports.ADD_CONTEXT = 'EVM_ADD_CONTEXT');
function addContext(_ref) {
  var contractName = _ref.contractName,
    binary = _ref.binary,
    sourceMap = _ref.sourceMap,
    compiler = _ref.compiler,
    abi = _ref.abi,
    contractId = _ref.contractId,
    contractKind = _ref.contractKind,
    isConstructor = _ref.isConstructor;

  return {
    type: ADD_CONTEXT,
    contractName: contractName,
    binary: binary,
    sourceMap: sourceMap,
    compiler: compiler,
    abi: abi,
    contractId: contractId,
    contractKind: contractKind,
    isConstructor: isConstructor
  };
}

var NORMALIZE_CONTEXTS = (exports.NORMALIZE_CONTEXTS =
  'EVM_NORMALIZE_CONTEXTS');
function normalizeContexts() {
  return { type: NORMALIZE_CONTEXTS };
}

var ADD_INSTANCE = (exports.ADD_INSTANCE = 'EVM_ADD_INSTANCE');
function addInstance(address, context, binary) {
  return {
    type: ADD_INSTANCE,
    address: address,
    context: context,
    binary: binary
  };
}

var SAVE_GLOBALS = (exports.SAVE_GLOBALS = 'SAVE_GLOBALS');
function saveGlobals(origin, gasprice, block) {
  return {
    type: SAVE_GLOBALS,
    origin: origin,
    gasprice: gasprice,
    block: block
  };
}

var CALL = (exports.CALL = 'CALL');
function call(address, data, storageAddress, sender, value) {
  return {
    type: CALL,
    address: address,
    data: data,
    storageAddress: storageAddress,
    sender: sender,
    value: value
  };
}

var CREATE = (exports.CREATE = 'CREATE');
function create(binary, storageAddress, sender, value) {
  return {
    type: CREATE,
    binary: binary,
    storageAddress: storageAddress,
    sender: sender,
    value: value
  };
}

var RETURN = (exports.RETURN = 'RETURN');
function returnCall() {
  return {
    type: RETURN
  };
}

var FAIL = (exports.FAIL = 'FAIL');
function fail() {
  return {
    type: FAIL
  };
}

var STORE = (exports.STORE = 'STORE');
function store(address, slot, value) {
  return {
    type: STORE,
    address: address,
    slot: slot,
    value: value
  };
}

var LOAD = (exports.LOAD = 'LOAD');
function load(address, slot, value) {
  return {
    type: LOAD,
    address: address,
    slot: slot,
    value: value
  };
}

var RESET = (exports.RESET = 'EVM_RESET');
function reset(storageAddress) {
  return {
    type: RESET,
    storageAddress: storageAddress
  };
}

var UNLOAD_TRANSACTION = (exports.UNLOAD_TRANSACTION =
  'EVM_UNLOAD_TRANSACTION');
function unloadTransaction() {
  return {
    type: UNLOAD_TRANSACTION
  };
}
