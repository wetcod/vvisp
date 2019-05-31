'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.inspectTransaction = inspectTransaction;
exports.obtainBinaries = obtainBinaries;
exports.init = init;
exports.saga = saga;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _effects = require('redux-saga/effects');

var _helpers = require('../../helpers');

var _actions = require('../actions');

var actions = _interopRequireWildcard(_actions);

var _actions2 = require('../../session/actions');

var session = _interopRequireWildcard(_actions2);

var _bn = require('bn.js');

var _bn2 = _interopRequireDefault(_bn);

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

var _truffleDecodeUtils = require('truffle-decode-utils');

var DecodeUtils = _interopRequireWildcard(_truffleDecodeUtils);

var _adapter = require('../adapter');

var _adapter2 = _interopRequireDefault(_adapter);

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};
    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key))
          newObj[key] = obj[key];
      }
    }
    newObj.default = obj;
    return newObj;
  }
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var _marked = /*#__PURE__*/ regeneratorRuntime.mark(fetchTransactionInfo),
  _marked2 = /*#__PURE__*/ regeneratorRuntime.mark(fetchBinary),
  _marked3 = /*#__PURE__*/ regeneratorRuntime.mark(inspectTransaction),
  _marked4 = /*#__PURE__*/ regeneratorRuntime.mark(obtainBinaries),
  _marked5 = /*#__PURE__*/ regeneratorRuntime.mark(receiveBinary),
  _marked6 = /*#__PURE__*/ regeneratorRuntime.mark(init),
  _marked7 = /*#__PURE__*/ regeneratorRuntime.mark(saga);

var debug = (0, _debug2.default)('debugger:web3:sagas'); //just for utils!

function fetchTransactionInfo(adapter, _ref) {
  var txHash = _ref.txHash;
  var trace, tx, receipt, block, solidityBlock, storageAddress;
  return regeneratorRuntime.wrap(
    function fetchTransactionInfo$(_context) {
      while (1) {
        switch ((_context.prev = _context.next)) {
          case 0:
            debug('inspecting transaction');
            _context.prev = 1;
            _context.next = 4;
            return (0, _effects.apply)(adapter, adapter.getTrace, [txHash]);

          case 4:
            trace = _context.sent;
            _context.next = 13;
            break;

          case 7:
            _context.prev = 7;
            _context.t0 = _context['catch'](1);

            debug('putting error');
            _context.next = 12;
            return (0, _effects.put)(actions.error(_context.t0));

          case 12:
            return _context.abrupt('return');

          case 13:
            debug('got trace');
            _context.next = 16;
            return (0, _effects.put)(actions.receiveTrace(trace));

          case 16:
            _context.next = 18;
            return (0, _effects.apply)(adapter, adapter.getTransaction, [
              txHash
            ]);

          case 18:
            tx = _context.sent;

            debug('tx %O', tx);
            _context.next = 22;
            return (0, _effects.apply)(adapter, adapter.getReceipt, [txHash]);

          case 22:
            receipt = _context.sent;

            debug('receipt %O', receipt);
            _context.next = 26;
            return (0, _effects.apply)(adapter, adapter.getBlock, [
              tx.blockNumber
            ]);

          case 26:
            block = _context.sent;

            debug('block %O', block);

            _context.next = 30;
            return (0, _effects.put)(session.saveTransaction(tx));

          case 30:
            _context.next = 32;
            return (0, _effects.put)(session.saveReceipt(receipt));

          case 32:
            _context.next = 34;
            return (0, _effects.put)(session.saveBlock(block));

          case 34:
            //these ones get grouped together for convenience
            solidityBlock = {
              coinbase: block.miner,
              difficulty: new _bn2.default(block.difficulty),
              gaslimit: new _bn2.default(block.gasLimit),
              number: new _bn2.default(block.number),
              timestamp: new _bn2.default(block.timestamp)
            };

            if (!(tx.to != null)) {
              _context.next = 40;
              break;
            }

            _context.next = 38;
            return (0, _effects.put)(
              actions.receiveCall({
                address: tx.to,
                data: tx.input,
                storageAddress: tx.to,
                sender: tx.from,
                value: new _bn2.default(tx.value),
                gasprice: new _bn2.default(tx.gasPrice),
                block: solidityBlock
              })
            );

          case 38:
            _context.next = 43;
            break;

          case 40:
            storageAddress = _web2.default.utils.isAddress(
              receipt.contractAddress
            )
              ? receipt.contractAddress
              : DecodeUtils.EVM.ZERO_ADDRESS;
            _context.next = 43;
            return (0, _effects.put)(
              actions.receiveCall({
                binary: tx.input,
                storageAddress: storageAddress,
                status: receipt.status,
                sender: tx.from,
                value: new _bn2.default(tx.value),
                gasprice: new _bn2.default(tx.gasPrice),
                block: solidityBlock
              })
            );

          case 43:
          case 'end':
            return _context.stop();
        }
      }
    },
    _marked,
    this,
    [[1, 7]]
  );
}

function fetchBinary(adapter, _ref2) {
  var address = _ref2.address,
    block = _ref2.block;
  var binary;
  return regeneratorRuntime.wrap(
    function fetchBinary$(_context2) {
      while (1) {
        switch ((_context2.prev = _context2.next)) {
          case 0:
            debug('fetching binary for %s', address);
            _context2.next = 3;
            return (0, _effects.apply)(adapter, adapter.getDeployedCode, [
              address,
              block
            ]);

          case 3:
            binary = _context2.sent;

            debug('received binary for %s', address);
            _context2.next = 7;
            return (0, _effects.put)(actions.receiveBinary(address, binary));

          case 7:
          case 'end':
            return _context2.stop();
        }
      }
    },
    _marked2,
    this
  );
}

function inspectTransaction(txHash) {
  var action,
    trace,
    _ref3,
    address,
    binary,
    data,
    storageAddress,
    status,
    sender,
    value,
    gasprice,
    block;

  return regeneratorRuntime.wrap(
    function inspectTransaction$(_context3) {
      while (1) {
        switch ((_context3.prev = _context3.next)) {
          case 0:
            _context3.next = 2;
            return (0, _effects.put)(actions.inspect(txHash));

          case 2:
            _context3.next = 4;
            return (0, _effects.take)([
              actions.RECEIVE_TRACE,
              actions.ERROR_WEB3
            ]);

          case 4:
            action = _context3.sent;

            debug('action %o', action);

            if (!(action.type == actions.RECEIVE_TRACE)) {
              _context3.next = 11;
              break;
            }

            trace = action.trace;
            debug('received trace');
            _context3.next = 12;
            break;

          case 11:
            return _context3.abrupt('return', { error: action.error });

          case 12:
            _context3.next = 14;
            return (0, _effects.take)(actions.RECEIVE_CALL);

          case 14:
            _ref3 = _context3.sent;
            address = _ref3.address;
            binary = _ref3.binary;
            data = _ref3.data;
            storageAddress = _ref3.storageAddress;
            status = _ref3.status;
            sender = _ref3.sender;
            value = _ref3.value;
            gasprice = _ref3.gasprice;
            block = _ref3.block;

            debug('received call');

            return _context3.abrupt('return', {
              trace: trace,
              address: address,
              binary: binary,
              data: data,
              storageAddress: storageAddress,
              status: status,
              sender: sender,
              value: value,
              gasprice: gasprice,
              block: block
            });

          case 26:
          case 'end':
            return _context3.stop();
        }
      }
    },
    _marked3,
    this
  );
}

//NOTE: the block argument is optional
function obtainBinaries(addresses, block) {
  var tasks, binaries;
  return regeneratorRuntime.wrap(
    function obtainBinaries$(_context4) {
      while (1) {
        switch ((_context4.prev = _context4.next)) {
          case 0:
            _context4.next = 2;
            return (0, _effects.all)(
              addresses.map(function(address) {
                return (0, _effects.fork)(receiveBinary, address);
              })
            );

          case 2:
            tasks = _context4.sent;

            debug('requesting binaries');
            _context4.next = 6;
            return (0, _effects.all)(
              addresses.map(function(address) {
                return (0, _effects.put)(actions.fetchBinary(address, block));
              })
            );

          case 6:
            binaries = [];
            _context4.next = 9;
            return (0, _effects.join)(tasks);

          case 9:
            binaries = _context4.sent;

            debug('binaries %o', binaries);

            return _context4.abrupt('return', binaries);

          case 12:
          case 'end':
            return _context4.stop();
        }
      }
    },
    _marked4,
    this
  );
}

function receiveBinary(address) {
  var _ref4, binary;

  return regeneratorRuntime.wrap(
    function receiveBinary$(_context5) {
      while (1) {
        switch ((_context5.prev = _context5.next)) {
          case 0:
            _context5.next = 2;
            return (0, _effects.take)(function(action) {
              return (
                action.type == actions.RECEIVE_BINARY &&
                action.address == address
              );
            });

          case 2:
            _ref4 = _context5.sent;
            binary = _ref4.binary;

            debug('got binary for %s', address);

            return _context5.abrupt('return', binary);

          case 6:
          case 'end':
            return _context5.stop();
        }
      }
    },
    _marked5,
    this
  );
}

function init(provider) {
  return regeneratorRuntime.wrap(
    function init$(_context6) {
      while (1) {
        switch ((_context6.prev = _context6.next)) {
          case 0:
            _context6.next = 2;
            return (0, _effects.put)(actions.init(provider));

          case 2:
          case 'end':
            return _context6.stop();
        }
      }
    },
    _marked6,
    this
  );
}

function saga() {
  var _ref5, provider, adapter;

  return regeneratorRuntime.wrap(
    function saga$(_context7) {
      while (1) {
        switch ((_context7.prev = _context7.next)) {
          case 0:
            _context7.next = 2;
            return (0, _effects.take)(actions.INIT_WEB3);

          case 2:
            _ref5 = _context7.sent;
            provider = _ref5.provider;
            adapter = new _adapter2.default(provider);
            _context7.next = 7;
            return (0, _effects.takeEvery)(
              actions.INSPECT,
              fetchTransactionInfo,
              adapter
            );

          case 7:
            _context7.next = 9;
            return (0, _effects.takeEvery)(
              actions.FETCH_BINARY,
              fetchBinary,
              adapter
            );

          case 9:
          case 'end':
            return _context7.stop();
        }
      }
    },
    _marked7,
    this
  );
}

exports.default = (0, _helpers.prefixName)('web3', saga);
