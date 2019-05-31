'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.advance = advance;
exports.stepNext = stepNext;
exports.stepOver = stepOver;
exports.stepInto = stepInto;
exports.stepOut = stepOut;
exports.reset = reset;
exports.interrupt = interrupt;
exports.continueUntilBreakpoint = continueUntilBreakpoint;
exports.addBreakpoint = addBreakpoint;
exports.removeBreakpoint = removeBreakpoint;
exports.removeAllBreakpoints = removeAllBreakpoints;
exports.startStepping = startStepping;
exports.doneStepping = doneStepping;
var ADVANCE = (exports.ADVANCE = 'ADVANCE');
function advance(count) {
  return { type: ADVANCE, count: count };
}

var STEP_NEXT = (exports.STEP_NEXT = 'STEP_NEXT');
function stepNext() {
  return { type: STEP_NEXT };
}

var STEP_OVER = (exports.STEP_OVER = 'STEP_OVER');
function stepOver() {
  return { type: STEP_OVER };
}

var STEP_INTO = (exports.STEP_INTO = 'STEP_INTO');
function stepInto() {
  return { type: STEP_INTO };
}

var STEP_OUT = (exports.STEP_OUT = 'STEP_OUT');
function stepOut() {
  return { type: STEP_OUT };
}

var RESET = (exports.RESET = 'RESET');
function reset() {
  return { type: RESET };
}

var INTERRUPT = (exports.INTERRUPT = 'CONTROLLER_INTERRUPT');
function interrupt() {
  return { type: INTERRUPT };
}

var CONTINUE = (exports.CONTINUE = 'CONTINUE');
function continueUntilBreakpoint(breakpoints) {
  //"continue" is not a legal name
  return {
    type: CONTINUE,
    breakpoints: breakpoints
  };
}

var ADD_BREAKPOINT = (exports.ADD_BREAKPOINT = 'ADD_BREAKPOINT');
function addBreakpoint(breakpoint) {
  return {
    type: ADD_BREAKPOINT,
    breakpoint: breakpoint
  };
}

var REMOVE_BREAKPOINT = (exports.REMOVE_BREAKPOINT = 'REMOVE_BREAKPOINT');
function removeBreakpoint(breakpoint) {
  return {
    type: REMOVE_BREAKPOINT,
    breakpoint: breakpoint
  };
}

var REMOVE_ALL_BREAKPOINTS = (exports.REMOVE_ALL_BREAKPOINTS =
  'REMOVE_ALL_BREAKPOINTS');
function removeAllBreakpoints() {
  return {
    type: REMOVE_ALL_BREAKPOINTS
  };
}

var START_STEPPING = (exports.START_STEPPING = 'START_STEPPING');
function startStepping() {
  return {
    type: START_STEPPING
  };
}

var DONE_STEPPING = (exports.DONE_STEPPING = 'DONE_STEPPING');
function doneStepping() {
  return {
    type: DONE_STEPPING
  };
}
