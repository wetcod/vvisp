'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.addSource = addSource;
exports.jump = jump;
exports.externalCall = externalCall;
exports.externalReturn = externalReturn;
exports.reset = reset;
var ADD_SOURCE = (exports.ADD_SOURCE = 'SOLIDITY_ADD_SOURCE');
function addSource(source, sourcePath, ast, compiler) {
  return {
    type: ADD_SOURCE,
    source: source,
    sourcePath: sourcePath,
    ast: ast,
    compiler: compiler
  };
}

var JUMP = (exports.JUMP = 'JUMP');
function jump(jumpDirection) {
  return {
    type: JUMP,
    jumpDirection: jumpDirection
  };
}

var EXTERNAL_CALL = (exports.EXTERNAL_CALL = 'EXTERNAL_CALL');
function externalCall() {
  return { type: EXTERNAL_CALL };
}

var EXTERNAL_RETURN = (exports.EXTERNAL_RETURN = 'EXTERNAL_RETURN');
function externalReturn() {
  return { type: EXTERNAL_RETURN };
}

var RESET = (exports.RESET = 'SOLIDITY_RESET');
function reset() {
  return { type: RESET };
}
