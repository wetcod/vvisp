'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.init = init;
exports.inspect = inspect;
exports.fetchBinary = fetchBinary;
exports.receiveBinary = receiveBinary;
exports.receiveTrace = receiveTrace;
exports.receiveCall = receiveCall;
exports.error = error;
var INIT_WEB3 = (exports.INIT_WEB3 = 'INIT_WEB3');
function init(provider) {
  return {
    type: INIT_WEB3,
    provider: provider
  };
}

var INSPECT = (exports.INSPECT = 'INSPECT_TRANSACTION');
function inspect(txHash) {
  return {
    type: INSPECT,
    txHash: txHash
  };
}

var FETCH_BINARY = (exports.FETCH_BINARY = 'FETCH_BINARY');
function fetchBinary(address, block) {
  return {
    type: FETCH_BINARY,
    address: address,
    block: block //optional
  };
}

var RECEIVE_BINARY = (exports.RECEIVE_BINARY = 'RECEIVE_BINARY');
function receiveBinary(address, binary) {
  return {
    type: RECEIVE_BINARY,
    address: address,
    binary: binary
  };
}

var RECEIVE_TRACE = (exports.RECEIVE_TRACE = 'RECEIVE_TRACE');
function receiveTrace(trace) {
  return {
    type: RECEIVE_TRACE,
    trace: trace
  };
}

var RECEIVE_CALL = (exports.RECEIVE_CALL = 'RECEIVE_CALL');
function receiveCall(_ref) {
  var address = _ref.address,
    binary = _ref.binary,
    data = _ref.data,
    storageAddress = _ref.storageAddress,
    status = _ref.status,
    sender = _ref.sender,
    value = _ref.value,
    gasprice = _ref.gasprice,
    block = _ref.block;

  return {
    type: RECEIVE_CALL,
    address: address,
    binary: binary,
    data: data,
    storageAddress: storageAddress,
    status: status, //only used for creation calls at present!
    sender: sender,
    value: value,
    gasprice: gasprice,
    block: block
  };
}

var ERROR_WEB3 = (exports.ERROR_WEB3 = 'ERROR_WEB3');
function error(error) {
  return {
    type: ERROR_WEB3,
    error: error
  };
}
