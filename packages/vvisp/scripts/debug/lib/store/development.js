'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = configureStore;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _remoteReduxDevtools = require('remote-redux-devtools');

var _common = require('./common');

var _common2 = _interopRequireDefault(_common);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var debug = (0, _debug2.default)('debugger:store:development');

function configureStore(reducer, saga, initialState) {
  var composeEnhancers = (0, _remoteReduxDevtools.composeWithDevTools)({
    realtime: false,
    actionsBlacklist: [
      'RECEIVE_TRACE',
      'SCOPE',
      'DECLARE_VARIABLE',
      'ASSIGN',
      'ADVANCE',
      'SAVE_STEPS',
      'BEGIN_STEP',
      'NEXT'
    ],
    stateSanitizer: function stateSanitizer(state) {
      return {
        // session: state.session,
        // context: state.context,
        // evm: state.evm,
        // solidity: state.solidity,
        // data: state.data,
      };
    },

    startOn: 'SESSION_READY',
    name: 'truffle-debugger',
    hostname: 'localhost',
    port: 11117
  });

  return (0, _common2.default)(reducer, saga, initialState, composeEnhancers);
}
