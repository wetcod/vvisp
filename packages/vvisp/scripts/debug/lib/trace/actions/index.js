'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.saveSteps = saveSteps;
exports.next = next;
exports.tick = tick;
exports.tock = tock;
exports.endTrace = endTrace;
exports.reset = reset;
exports.unloadTransaction = unloadTransaction;
exports.backtick = backtick;
var SAVE_STEPS = (exports.SAVE_STEPS = 'SAVE_STEPS');
function saveSteps(steps) {
  return {
    type: SAVE_STEPS,
    steps: steps
  };
}

var NEXT = (exports.NEXT = 'NEXT');
function next() {
  return { type: NEXT };
}

var TICK = (exports.TICK = 'TICK');
function tick() {
  return { type: TICK };
}

var TOCK = (exports.TOCK = 'TOCK');
function tock() {
  return { type: TOCK };
}

var END_OF_TRACE = (exports.END_OF_TRACE = 'EOT');
function endTrace() {
  return { type: END_OF_TRACE };
}

var RESET = (exports.RESET = 'TRACE_RESET');
function reset() {
  return { type: RESET };
}

var UNLOAD_TRANSACTION = (exports.UNLOAD_TRANSACTION =
  'TRACE_UNLOAD_TRANSACTION');
function unloadTransaction() {
  return { type: UNLOAD_TRANSACTION };
}

var BACKTICK = (exports.BACKTICK = 'BACKTICK');
function backtick() {
  return { type: BACKTICK };
}
