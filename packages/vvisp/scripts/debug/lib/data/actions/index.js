'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.scope = scope;
exports.declare = declare;
exports.assign = assign;
exports.mapPathAndAssign = mapPathAndAssign;
exports.reset = reset;
exports.defineType = defineType;
exports.allocate = allocate;
var SCOPE = (exports.SCOPE = 'SCOPE');
function scope(id, pointer, parentId, sourceId) {
  return {
    type: SCOPE,
    id: id,
    pointer: pointer,
    parentId: parentId,
    sourceId: sourceId
  };
}

var DECLARE = (exports.DECLARE = 'DECLARE_VARIABLE');
function declare(node) {
  return {
    type: DECLARE,
    node: node
  };
}

var ASSIGN = (exports.ASSIGN = 'ASSIGN');
function assign(assignments) {
  return {
    type: ASSIGN,
    assignments: assignments
  };
}

var MAP_PATH_AND_ASSIGN = (exports.MAP_PATH_AND_ASSIGN = 'MAP_PATH_AND_ASSIGN');
function mapPathAndAssign(
  address,
  slot,
  assignments,
  typeIdentifier,
  parentType
) {
  return {
    type: MAP_PATH_AND_ASSIGN,
    address: address,
    slot: slot,
    assignments: assignments,
    typeIdentifier: typeIdentifier,
    parentType: parentType
  };
}

var RESET = (exports.RESET = 'DATA_RESET');
function reset() {
  return { type: RESET };
}

var DEFINE_TYPE = (exports.DEFINE_TYPE = 'DEFINE_TYPE');
function defineType(node) {
  return {
    type: DEFINE_TYPE,
    node: node
  };
}

var ALLOCATE = (exports.ALLOCATE = 'ALLOCATE');
function allocate(storage, memory, calldata) {
  return {
    type: ALLOCATE,
    storage: storage,
    memory: memory,
    calldata: calldata
  };
}
