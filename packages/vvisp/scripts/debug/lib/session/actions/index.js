'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.start = start;
exports.loadTransaction = loadTransaction;
exports.interrupt = interrupt;
exports.unloadTransaction = unloadTransaction;
exports.ready = ready;
exports.wait = wait;
exports.error = error;
exports.clearError = clearError;
exports.recordContracts = recordContracts;
exports.saveTransaction = saveTransaction;
exports.saveReceipt = saveReceipt;
exports.saveBlock = saveBlock;
var START = (exports.START = 'SESSION_START');
function start(provider, txHash) {
  return {
    type: START,
    provider: provider,
    txHash: txHash //OPTIONAL
  };
}

var LOAD_TRANSACTION = (exports.LOAD_TRANSACTION = 'LOAD_TRANSACTION');
function loadTransaction(txHash) {
  return {
    type: LOAD_TRANSACTION,
    txHash: txHash
  };
}

var INTERRUPT = (exports.INTERRUPT = 'SESSION_INTERRUPT');
function interrupt() {
  return { type: INTERRUPT };
}

var UNLOAD_TRANSACTION = (exports.UNLOAD_TRANSACTION = 'UNLOAD_TRANSACTION');
function unloadTransaction() {
  return {
    type: UNLOAD_TRANSACTION
  };
}

var READY = (exports.READY = 'SESSION_READY');
function ready() {
  return {
    type: READY
  };
}

var WAIT = (exports.WAIT = 'SESSION_WAIT');
function wait() {
  return {
    type: WAIT
  };
}

var ERROR = (exports.ERROR = 'SESSION_ERROR');
function error(error) {
  return {
    type: ERROR,
    error: error
  };
}

var CLEAR_ERROR = (exports.CLEAR_ERROR = 'CLEAR_ERROR');
function clearError() {
  return {
    type: CLEAR_ERROR
  };
}

var RECORD_CONTRACTS = (exports.RECORD_CONTRACTS = 'RECORD_CONTRACTS');
function recordContracts(contexts, sources) {
  return {
    type: RECORD_CONTRACTS,
    contexts: contexts,
    sources: sources
  };
}

var SAVE_TRANSACTION = (exports.SAVE_TRANSACTION = 'SAVE_TRANSACTION');
function saveTransaction(transaction) {
  return {
    type: SAVE_TRANSACTION,
    transaction: transaction
  };
}

var SAVE_RECEIPT = (exports.SAVE_RECEIPT = 'SAVE_RECEIPT');
function saveReceipt(receipt) {
  return {
    type: SAVE_RECEIPT,
    receipt: receipt
  };
}

var SAVE_BLOCK = (exports.SAVE_BLOCK = 'SAVE_BLOCK');
function saveBlock(block) {
  return {
    type: SAVE_BLOCK,
    block: block
  };
}
