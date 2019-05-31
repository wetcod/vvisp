'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _reselectTree = require('reselect-tree');

var PAST_END_OF_TRACE = {
  depth: -1, //this is the part that matters!
  //the rest of this is just to look like a trace step
  error: '',
  gas: 0,
  memory: [],
  stack: [],
  storage: {},
  gasCost: 0,
  op: 'STOP',
  pc: -1 //this is not at all valid but that's fine
};

var trace = (0, _reselectTree.createSelectorTree)({
  /**
   * trace.index
   *
   * current step index
   */
  index: function index(state) {
    return state.trace.proc.index;
  },

  /*
   * trace.loaded
   * is a trace loaded?
   */
  loaded: (0, _reselectTree.createLeaf)(['/steps'], function(steps) {
    return steps !== null;
  }),

  /**
   * trace.finished
   * is the trace finished?
   */
  finished: function finished(state) {
    return state.trace.proc.finished;
  },

  /**
   * trace.finishedOrUnloaded
   *
   * is the trace finished, including if it's unloaded?
   */
  finishedOrUnloaded: (0, _reselectTree.createLeaf)(
    ['/finished', '/loaded'],
    function(finished, loaded) {
      return finished || !loaded;
    }
  ),

  /**
   * trace.steps
   *
   * all trace steps
   */
  steps: function steps(state) {
    return state.trace.transaction.steps;
  },

  /**
   * trace.stepsRemaining
   *
   * number of steps remaining in trace
   */
  stepsRemaining: (0, _reselectTree.createLeaf)(
    ['./steps', './index'],
    function(steps, index) {
      return steps.length - index;
    }
  ),

  /**
   * trace.step
   *
   * current trace step
   */
  step: (0, _reselectTree.createLeaf)(
    ['./steps', './index'],
    function(steps, index) {
      return steps ? steps[index] : null;
    } //null if no tx loaded
  ),

  /**
   * trace.next
   *
   * next trace step
   * HACK: if at the end,
   * we will return a spoofed "past end" step
   */
  next: (0, _reselectTree.createLeaf)(['./steps', './index'], function(
    steps,
    index
  ) {
    return index < steps.length - 1 ? steps[index + 1] : PAST_END_OF_TRACE;
  }),

  /*
   * trace.nextOfSameDepth
   * next trace step that's at the same depth as this one
   * NOTE: if there is none, will return undefined
   * (should not be used in such cases)
   */
  nextOfSameDepth: (0, _reselectTree.createLeaf)(
    ['./steps', './index'],
    function(steps, index) {
      var depth = steps[index].depth;
      return steps.slice(index + 1).find(function(step) {
        return step.depth === depth;
      });
    }
  )
});

exports.default = trace;
