'use strict';

var _slicedToArray = (function() {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;
    try {
      for (
        var _i = arr[Symbol.iterator](), _s;
        !(_n = (_s = _i.next()).done);
        _n = true
      ) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i['return']) _i['return']();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  return function(arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError(
        'Invalid attempt to destructure non-iterable instance'
      );
    }
  };
})();

var _createClass = (function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ('value' in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  } else {
    return Array.from(arr);
  }
}

function _asyncToGenerator(fn) {
  return function() {
    var gen = fn.apply(this, arguments);
    return new Promise(function(resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }
        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(
            function(value) {
              step('next', value);
            },
            function(err) {
              step('throw', err);
            }
          );
        }
      }
      return step('next');
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var debugModule = require('debug');
var debug = debugModule('debugger:session');
var configureStore = require('../store');
var controller = require('../controller/actions');
var actions = require('./actions');
var data = require('../data/selectors');
var session = require('../session/selectors');
var dataSagas = require('../data/sagas');
var controllerSagas = require('../controller/sagas');
var sagas = require('./sagas');
var controllerSelector = require('../controller/selectors');
var rootSaga = require('./sagas');
var reducer = require('./reducers');

/**
 * Debugger Session
 */

var Session = (function() {
  /**
   * @param {Array<Contract>} contracts - contract definitions
   * @param {Array<String>} files - array of filenames for sourceMap indexes
   * @param {Web3Provider} provider - web3 provider
   * txHash parameter is now optional!
   * @private
   */
  function Session(contracts, files, provider, txHash) {
    var _this = this;

    _classCallCheck(this, Session);

    /**
     * @private
     */
    var _configureStore = configureStore(reducer, rootSaga),
      store = _configureStore.store,
      sagaMiddleware = _configureStore.sagaMiddleware;

    this._store = store;
    this._sagaMiddleware = sagaMiddleware;

    var _Session$normalize = Session.normalize(contracts, files),
      contexts = _Session$normalize.contexts,
      sources = _Session$normalize.sources;

    // record contracts

    this._store.dispatch(actions.recordContracts(contexts, sources));

    //set up the ready listener
    this._ready = new Promise(function(accept, reject) {
      var unsubscribe = _this._store.subscribe(function() {
        if (_this.view(session.status.ready)) {
          debug('ready!');
          unsubscribe();
          accept();
        } else if (_this.view(session.status.errored)) {
          debug('error!');
          unsubscribe();
          reject(_this.view(session.status.error));
        }
      });
    });

    //note that txHash is now optional
    this._store.dispatch(actions.start(provider, txHash));
  }

  _createClass(
    Session,
    [
      {
        key: 'ready',
        value: (function() {
          var _ref = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee() {
              return regeneratorRuntime.wrap(
                function _callee$(_context) {
                  while (1) {
                    switch ((_context.prev = _context.next)) {
                      case 0:
                        _context.next = 2;
                        return this._ready;

                      case 2:
                      case 'end':
                        return _context.stop();
                    }
                  }
                },
                _callee,
                this
              );
            })
          );

          function ready() {
            return _ref.apply(this, arguments);
          }

          return ready;
        })()
      },
      {
        key: 'readyAgainAfterLoading',
        value: (function() {
          var _ref2 = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee2(
              sessionAction
            ) {
              var _this2 = this;

              return regeneratorRuntime.wrap(
                function _callee2$(_context2) {
                  while (1) {
                    switch ((_context2.prev = _context2.next)) {
                      case 0:
                        return _context2.abrupt(
                          'return',
                          new Promise(function(accept, reject) {
                            var hasStartedWaiting = false;
                            debug('reready listener set up');
                            var unsubscribe = _this2._store.subscribe(
                              function() {
                                debug('reready?');
                                if (hasStartedWaiting) {
                                  if (_this2.view(session.status.ready)) {
                                    debug('reready!');
                                    unsubscribe();
                                    accept(true);
                                  } else if (
                                    _this2.view(session.status.errored)
                                  ) {
                                    unsubscribe();
                                    debug('error!');
                                    reject(_this2.view(session.status.error));
                                  }
                                } else {
                                  if (_this2.view(session.status.waiting)) {
                                    debug('started waiting');
                                    hasStartedWaiting = true;
                                  }
                                  return;
                                }
                              }
                            );
                            _this2.dispatch(sessionAction);
                          })
                        );

                      case 1:
                      case 'end':
                        return _context2.stop();
                    }
                  }
                },
                _callee2,
                this
              );
            })
          );

          function readyAgainAfterLoading(_x) {
            return _ref2.apply(this, arguments);
          }

          return readyAgainAfterLoading;
        })()

        /**
         * Split up artifacts into "contexts" and "sources", dividing artifact
         * data into appropriate buckets.
         *
         * Multiple contracts can be defined in the same source file, but have
         * different bytecodes.
         *
         * This iterates over the contracts and collects binaries separately
         * from sources, using the optional `files` argument to force
         * source ordering.
         * @private
         */
      },
      {
        key: 'view',
        value: function view(selector) {
          return selector(this.state);
        }
      },
      {
        key: 'dispatch',
        value: (function() {
          var _ref3 = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee3(action) {
              return regeneratorRuntime.wrap(
                function _callee3$(_context3) {
                  while (1) {
                    switch ((_context3.prev = _context3.next)) {
                      case 0:
                        this._store.dispatch(action);

                        return _context3.abrupt('return', true);

                      case 2:
                      case 'end':
                        return _context3.stop();
                    }
                  }
                },
                _callee3,
                this
              );
            })
          );

          function dispatch(_x2) {
            return _ref3.apply(this, arguments);
          }

          return dispatch;
        })()

        /**
         * @private
         * Allows running any saga -- for internal use only!
         * Using this could seriously screw up the debugger state if you
         * don't know what you're doing!
         */
      },
      {
        key: '_runSaga',
        value: (function() {
          var _ref4 = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee4(saga) {
              var _sagaMiddleware;

              for (
                var _len = arguments.length,
                  args = Array(_len > 1 ? _len - 1 : 0),
                  _key = 1;
                _key < _len;
                _key++
              ) {
                args[_key - 1] = arguments[_key];
              }

              return regeneratorRuntime.wrap(
                function _callee4$(_context4) {
                  while (1) {
                    switch ((_context4.prev = _context4.next)) {
                      case 0:
                        _context4.next = 2;
                        return (_sagaMiddleware = this._sagaMiddleware).run
                          .apply(
                            _sagaMiddleware,
                            [saga].concat(_toConsumableArray(args))
                          )
                          .toPromise();

                      case 2:
                        return _context4.abrupt('return', _context4.sent);

                      case 3:
                      case 'end':
                        return _context4.stop();
                    }
                  }
                },
                _callee4,
                this
              );
            })
          );

          function _runSaga(_x3) {
            return _ref4.apply(this, arguments);
          }

          return _runSaga;
        })()
      },
      {
        key: 'interrupt',
        value: (function() {
          var _ref5 = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee5() {
              return regeneratorRuntime.wrap(
                function _callee5$(_context5) {
                  while (1) {
                    switch ((_context5.prev = _context5.next)) {
                      case 0:
                        _context5.next = 2;
                        return this.dispatch(actions.interrupt());

                      case 2:
                        _context5.next = 4;
                        return this.dispatch(controller.interrupt());

                      case 4:
                      case 'end':
                        return _context5.stop();
                    }
                  }
                },
                _callee5,
                this
              );
            })
          );

          function interrupt() {
            return _ref5.apply(this, arguments);
          }

          return interrupt;
        })()
      },
      {
        key: 'doneStepping',
        value: (function() {
          var _ref6 = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee6(
              stepperAction
            ) {
              var _this3 = this;

              return regeneratorRuntime.wrap(
                function _callee6$(_context6) {
                  while (1) {
                    switch ((_context6.prev = _context6.next)) {
                      case 0:
                        return _context6.abrupt(
                          'return',
                          new Promise(function(resolve) {
                            var hasStarted = false;
                            var unsubscribe = _this3._store.subscribe(
                              function() {
                                var isStepping = _this3.view(
                                  controllerSelector.isStepping
                                );

                                if (isStepping && !hasStarted) {
                                  hasStarted = true;
                                  debug('heard step start');
                                  return;
                                }

                                if (!isStepping && hasStarted) {
                                  debug('heard step stop');
                                  unsubscribe();
                                  resolve(true);
                                }
                              }
                            );
                            _this3.dispatch(stepperAction);
                          })
                        );

                      case 1:
                      case 'end':
                        return _context6.stop();
                    }
                  }
                },
                _callee6,
                this
              );
            })
          );

          function doneStepping(_x4) {
            return _ref6.apply(this, arguments);
          }

          return doneStepping;
        })()

        //returns true on success, false on already loaded, error object on failure
      },
      {
        key: 'load',
        value: (function() {
          var _ref7 = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee7(txHash) {
              return regeneratorRuntime.wrap(
                function _callee7$(_context7) {
                  while (1) {
                    switch ((_context7.prev = _context7.next)) {
                      case 0:
                        if (!this.view(session.status.loaded)) {
                          _context7.next = 2;
                          break;
                        }

                        return _context7.abrupt('return', false);

                      case 2:
                        _context7.prev = 2;
                        _context7.next = 5;
                        return this.readyAgainAfterLoading(
                          actions.loadTransaction(txHash)
                        );

                      case 5:
                        return _context7.abrupt('return', _context7.sent);

                      case 8:
                        _context7.prev = 8;
                        _context7.t0 = _context7['catch'](2);

                        this._runSaga(sagas.unload);
                        return _context7.abrupt('return', _context7.t0);

                      case 12:
                      case 'end':
                        return _context7.stop();
                    }
                  }
                },
                _callee7,
                this,
                [[2, 8]]
              );
            })
          );

          function load(_x5) {
            return _ref7.apply(this, arguments);
          }

          return load;
        })()

        //returns true on success, false on already unloaded
      },
      {
        key: 'unload',
        value: (function() {
          var _ref8 = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee8() {
              return regeneratorRuntime.wrap(
                function _callee8$(_context8) {
                  while (1) {
                    switch ((_context8.prev = _context8.next)) {
                      case 0:
                        if (this.view(session.status.loaded)) {
                          _context8.next = 2;
                          break;
                        }

                        return _context8.abrupt('return', false);

                      case 2:
                        debug('unloading');
                        _context8.next = 5;
                        return this._runSaga(sagas.unload);

                      case 5:
                        return _context8.abrupt('return', true);

                      case 6:
                      case 'end':
                        return _context8.stop();
                    }
                  }
                },
                _callee8,
                this
              );
            })
          );

          function unload() {
            return _ref8.apply(this, arguments);
          }

          return unload;
        })()

        //Note: count is an optional argument; default behavior is to advance 1
      },
      {
        key: 'advance',
        value: (function() {
          var _ref9 = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee9(count) {
              return regeneratorRuntime.wrap(
                function _callee9$(_context9) {
                  while (1) {
                    switch ((_context9.prev = _context9.next)) {
                      case 0:
                        _context9.next = 2;
                        return this.doneStepping(controller.advance(count));

                      case 2:
                        return _context9.abrupt('return', _context9.sent);

                      case 3:
                      case 'end':
                        return _context9.stop();
                    }
                  }
                },
                _callee9,
                this
              );
            })
          );

          function advance(_x6) {
            return _ref9.apply(this, arguments);
          }

          return advance;
        })()
      },
      {
        key: 'stepNext',
        value: (function() {
          var _ref10 = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee10() {
              return regeneratorRuntime.wrap(
                function _callee10$(_context10) {
                  while (1) {
                    switch ((_context10.prev = _context10.next)) {
                      case 0:
                        _context10.next = 2;
                        return this.doneStepping(controller.stepNext());

                      case 2:
                        return _context10.abrupt('return', _context10.sent);

                      case 3:
                      case 'end':
                        return _context10.stop();
                    }
                  }
                },
                _callee10,
                this
              );
            })
          );

          function stepNext() {
            return _ref10.apply(this, arguments);
          }

          return stepNext;
        })()
      },
      {
        key: 'stepOver',
        value: (function() {
          var _ref11 = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee11() {
              return regeneratorRuntime.wrap(
                function _callee11$(_context11) {
                  while (1) {
                    switch ((_context11.prev = _context11.next)) {
                      case 0:
                        _context11.next = 2;
                        return this.doneStepping(controller.stepOver());

                      case 2:
                        return _context11.abrupt('return', _context11.sent);

                      case 3:
                      case 'end':
                        return _context11.stop();
                    }
                  }
                },
                _callee11,
                this
              );
            })
          );

          function stepOver() {
            return _ref11.apply(this, arguments);
          }

          return stepOver;
        })()
      },
      {
        key: 'stepInto',
        value: (function() {
          var _ref12 = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee12() {
              return regeneratorRuntime.wrap(
                function _callee12$(_context12) {
                  while (1) {
                    switch ((_context12.prev = _context12.next)) {
                      case 0:
                        _context12.next = 2;
                        return this.doneStepping(controller.stepInto());

                      case 2:
                        return _context12.abrupt('return', _context12.sent);

                      case 3:
                      case 'end':
                        return _context12.stop();
                    }
                  }
                },
                _callee12,
                this
              );
            })
          );

          function stepInto() {
            return _ref12.apply(this, arguments);
          }

          return stepInto;
        })()
      },
      {
        key: 'stepOut',
        value: (function() {
          var _ref13 = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee13() {
              return regeneratorRuntime.wrap(
                function _callee13$(_context13) {
                  while (1) {
                    switch ((_context13.prev = _context13.next)) {
                      case 0:
                        _context13.next = 2;
                        return this.doneStepping(controller.stepOut());

                      case 2:
                        return _context13.abrupt('return', _context13.sent);

                      case 3:
                      case 'end':
                        return _context13.stop();
                    }
                  }
                },
                _callee13,
                this
              );
            })
          );

          function stepOut() {
            return _ref13.apply(this, arguments);
          }

          return stepOut;
        })()
      },
      {
        key: 'reset',
        value: (function() {
          var _ref14 = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee14() {
              var loaded;
              return regeneratorRuntime.wrap(
                function _callee14$(_context14) {
                  while (1) {
                    switch ((_context14.prev = _context14.next)) {
                      case 0:
                        loaded = this.view(session.status.loaded);

                        if (loaded) {
                          _context14.next = 3;
                          break;
                        }

                        return _context14.abrupt('return');

                      case 3:
                        _context14.next = 5;
                        return this._runSaga(controllerSagas.reset);

                      case 5:
                        return _context14.abrupt('return', _context14.sent);

                      case 6:
                      case 'end':
                        return _context14.stop();
                    }
                  }
                },
                _callee14,
                this
              );
            })
          );

          function reset() {
            return _ref14.apply(this, arguments);
          }

          return reset;
        })()

        //NOTE: breakpoints is an OPTIONAL argument for if you want to supply your
        //own list of breakpoints; leave it out to use the internal one (as
        //controlled by the functions below)
      },
      {
        key: 'continueUntilBreakpoint',
        value: (function() {
          var _ref15 = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee15(
              breakpoints
            ) {
              return regeneratorRuntime.wrap(
                function _callee15$(_context15) {
                  while (1) {
                    switch ((_context15.prev = _context15.next)) {
                      case 0:
                        _context15.next = 2;
                        return this.doneStepping(
                          controller.continueUntilBreakpoint(breakpoints)
                        );

                      case 2:
                        return _context15.abrupt('return', _context15.sent);

                      case 3:
                      case 'end':
                        return _context15.stop();
                    }
                  }
                },
                _callee15,
                this
              );
            })
          );

          function continueUntilBreakpoint(_x7) {
            return _ref15.apply(this, arguments);
          }

          return continueUntilBreakpoint;
        })()
      },
      {
        key: 'addBreakpoint',
        value: (function() {
          var _ref16 = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee16(
              breakpoint
            ) {
              return regeneratorRuntime.wrap(
                function _callee16$(_context16) {
                  while (1) {
                    switch ((_context16.prev = _context16.next)) {
                      case 0:
                        _context16.next = 2;
                        return this.dispatch(
                          controller.addBreakpoint(breakpoint)
                        );

                      case 2:
                        return _context16.abrupt('return', _context16.sent);

                      case 3:
                      case 'end':
                        return _context16.stop();
                    }
                  }
                },
                _callee16,
                this
              );
            })
          );

          function addBreakpoint(_x8) {
            return _ref16.apply(this, arguments);
          }

          return addBreakpoint;
        })()
      },
      {
        key: 'removeBreakpoint',
        value: (function() {
          var _ref17 = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee17(
              breakpoint
            ) {
              return regeneratorRuntime.wrap(
                function _callee17$(_context17) {
                  while (1) {
                    switch ((_context17.prev = _context17.next)) {
                      case 0:
                        _context17.next = 2;
                        return this.dispatch(
                          controller.removeBreakpoint(breakpoint)
                        );

                      case 2:
                        return _context17.abrupt('return', _context17.sent);

                      case 3:
                      case 'end':
                        return _context17.stop();
                    }
                  }
                },
                _callee17,
                this
              );
            })
          );

          function removeBreakpoint(_x9) {
            return _ref17.apply(this, arguments);
          }

          return removeBreakpoint;
        })()
      },
      {
        key: 'removeAllBreakpoints',
        value: (function() {
          var _ref18 = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee18() {
              return regeneratorRuntime.wrap(
                function _callee18$(_context18) {
                  while (1) {
                    switch ((_context18.prev = _context18.next)) {
                      case 0:
                        _context18.next = 2;
                        return this.dispatch(controller.removeAllBreakpoints());

                      case 2:
                        return _context18.abrupt('return', _context18.sent);

                      case 3:
                      case 'end':
                        return _context18.stop();
                    }
                  }
                },
                _callee18,
                this
              );
            })
          );

          function removeAllBreakpoints() {
            return _ref18.apply(this, arguments);
          }

          return removeAllBreakpoints;
        })()

        //deprecated -- decode is now *always* ready!
      },
      {
        key: 'decodeReady',
        value: (function() {
          var _ref19 = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee19() {
              return regeneratorRuntime.wrap(
                function _callee19$(_context19) {
                  while (1) {
                    switch ((_context19.prev = _context19.next)) {
                      case 0:
                        return _context19.abrupt('return', true);

                      case 1:
                      case 'end':
                        return _context19.stop();
                    }
                  }
                },
                _callee19,
                this
              );
            })
          );

          function decodeReady() {
            return _ref19.apply(this, arguments);
          }

          return decodeReady;
        })()
      },
      {
        key: 'variable',
        value: (function() {
          var _ref20 = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee20(name) {
              var definitions, refs;
              return regeneratorRuntime.wrap(
                function _callee20$(_context20) {
                  while (1) {
                    switch ((_context20.prev = _context20.next)) {
                      case 0:
                        definitions = this.view(
                          data.current.identifiers.definitions
                        );
                        refs = this.view(data.current.identifiers.refs);
                        _context20.next = 4;
                        return this._runSaga(
                          dataSagas.decode,
                          definitions[name],
                          refs[name]
                        );

                      case 4:
                        return _context20.abrupt('return', _context20.sent);

                      case 5:
                      case 'end':
                        return _context20.stop();
                    }
                  }
                },
                _callee20,
                this
              );
            })
          );

          function variable(_x10) {
            return _ref20.apply(this, arguments);
          }

          return variable;
        })()
      },
      {
        key: 'variables',
        value: (function() {
          var _ref21 = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee21() {
              var definitions,
                refs,
                decoded,
                _iteratorNormalCompletion,
                _didIteratorError,
                _iteratorError,
                _iterator,
                _step,
                _step$value,
                identifier,
                ref;

              return regeneratorRuntime.wrap(
                function _callee21$(_context21) {
                  while (1) {
                    switch ((_context21.prev = _context21.next)) {
                      case 0:
                        if (this.view(session.status.loaded)) {
                          _context21.next = 2;
                          break;
                        }

                        return _context21.abrupt('return', {});

                      case 2:
                        definitions = this.view(
                          data.current.identifiers.definitions
                        );
                        refs = this.view(data.current.identifiers.refs);
                        decoded = {};
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context21.prev = 8;
                        _iterator = Object.entries(refs)[Symbol.iterator]();

                      case 10:
                        if (
                          (_iteratorNormalCompletion = (_step = _iterator.next())
                            .done)
                        ) {
                          _context21.next = 19;
                          break;
                        }

                        (_step$value = _slicedToArray(_step.value, 2)),
                          (identifier = _step$value[0]),
                          (ref = _step$value[1]);

                        if (!(identifier in definitions)) {
                          _context21.next = 16;
                          break;
                        }

                        _context21.next = 15;
                        return this._runSaga(
                          dataSagas.decode,
                          definitions[identifier],
                          ref
                        );

                      case 15:
                        decoded[identifier] = _context21.sent;

                      case 16:
                        _iteratorNormalCompletion = true;
                        _context21.next = 10;
                        break;

                      case 19:
                        _context21.next = 25;
                        break;

                      case 21:
                        _context21.prev = 21;
                        _context21.t0 = _context21['catch'](8);
                        _didIteratorError = true;
                        _iteratorError = _context21.t0;

                      case 25:
                        _context21.prev = 25;
                        _context21.prev = 26;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                          _iterator.return();
                        }

                      case 28:
                        _context21.prev = 28;

                        if (!_didIteratorError) {
                          _context21.next = 31;
                          break;
                        }

                        throw _iteratorError;

                      case 31:
                        return _context21.finish(28);

                      case 32:
                        return _context21.finish(25);

                      case 33:
                        return _context21.abrupt('return', decoded);

                      case 34:
                      case 'end':
                        return _context21.stop();
                    }
                  }
                },
                _callee21,
                this,
                [[8, 21, 25, 33], [26, , 28, 32]]
              );
            })
          );

          function variables() {
            return _ref21.apply(this, arguments);
          }

          return variables;
        })()
      },
      {
        key: 'state',
        get: function get() {
          return this._store.getState();
        }
      }
    ],
    [
      {
        key: 'normalize',
        value: function normalize(contracts) {
          var files =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : null;

          var sourcesByPath = {};
          var contexts = [];
          var sources = void 0;

          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            var _loop = function _loop() {
              var contract = _step2.value;
              var contractName = contract.contractName,
                binary = contract.binary,
                sourceMap = contract.sourceMap,
                deployedBinary = contract.deployedBinary,
                deployedSourceMap = contract.deployedSourceMap,
                sourcePath = contract.sourcePath,
                source = contract.source,
                ast = contract.ast,
                abi = contract.abi,
                compiler = contract.compiler;

              var contractNode = ast.nodes.find(function(node) {
                return (
                  node.nodeType === 'ContractDefinition' &&
                  node.name === contractName
                );
              }); //ideally we'd hold this off till later, but that would break the
              //direction of the evm/solidity dependence, so we do it now

              var contractId = contractNode.id;
              var contractKind = contractNode.contractKind;

              debug('contractName %s', contractName);
              debug('sourceMap %o', sourceMap);
              debug('compiler %o', compiler);
              debug('abi %O', abi);

              sourcesByPath[sourcePath] = {
                sourcePath: sourcePath,
                source: source,
                ast: ast,
                compiler: compiler
              };

              if (binary && binary != '0x') {
                contexts.push({
                  contractName: contractName,
                  binary: binary,
                  sourceMap: sourceMap,
                  abi: abi,
                  compiler: compiler,
                  contractId: contractId,
                  contractKind: contractKind,
                  isConstructor: true
                });
              }

              if (deployedBinary && deployedBinary != '0x') {
                contexts.push({
                  contractName: contractName,
                  binary: deployedBinary,
                  sourceMap: deployedSourceMap,
                  abi: abi,
                  compiler: compiler,
                  contractId: contractId,
                  contractKind: contractKind,
                  isConstructor: false
                });
              }
            };

            for (
              var _iterator2 = contracts[Symbol.iterator](), _step2;
              !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done);
              _iteratorNormalCompletion2 = true
            ) {
              _loop();
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }

          if (!files) {
            sources = Object.values(sourcesByPath);
          } else {
            sources = files.map(function(file) {
              return sourcesByPath[file];
            });
          }

          return { contexts: contexts, sources: sources };
        }
      }
    ]
  );

  return Session;
})();

module.exports = Session;
