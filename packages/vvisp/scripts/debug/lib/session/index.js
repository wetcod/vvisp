const debugModule = require('debug');
const debug = debugModule('debugger:session');
const configureStore = require('../store');
const controller = require('../controller/actions');
const actions = require('./actions');
const data = require('../data/selectors');
const controllerSelector = require('../controller/selectors');
const rootSaga = require('./sagas');
const reducer = require('./reducers');

class Session {
  constructor(contracts, files, txHash, provider) {
    this._store = configureStore(reducer, rootSaga);
    let { contexts, sources } = Session.normalize(contracts, files);

    this._store.dispatch(actions.recordContracts(contexts, sources));
    this._store.dispatch(actions.start(txHash, provider));
  }

  async ready() {
    return new Promise((accept, reject) => {
      this._store.subscribe(() => {
        if (this.state.session.status == 'ACTIVE') {
          accept();
        } else if (typeof this.state.session.status == 'object') {
          reject(this.state.session.status.error);
        }
      });
    });
  }

  static normalize(contracts, files = null) {
    let sourcesByPath = {};
    let contexts = [];
    let sources;

    for (let contract of contracts) {
      let {
        contractName,
        binary,
        sourceMap,
        deployedBinary,
        deployedSourceMap,
        sourcePath,
        source,
        ast,
        compiler
      } = contract;

      debug('sourceMap %o', sourceMap);
      debug('compiler %o', compiler);

      sourcesByPath[sourcePath] = { sourcePath, source, ast };

      if (binary && binary != '0x') {
        contexts.push({
          contractName,
          binary,
          sourceMap
        });
      }

      if (deployedBinary && deployedBinary != '0x') {
        contexts.push({
          contractName,
          binary: deployedBinary,
          sourceMap: deployedSourceMap,
          compiler
        });
      }
    }

    if (!files) {
      sources = Object.values(sourcesByPath);
    } else {
      sources = files.map(file => sourcesByPath[file]);
    }

    return { contexts, sources };
  }

  get state() {
    return this._store.getState();
  }

  view(selector) {
    return selector(this.state);
  }

  async dispatch(action) {
    this._store.dispatch(action);

    return true;
  }

  async interrupt() {
    return this.dispatch(controller.interrupt());
  }

  async doneStepping(stepperAction) {
    return new Promise(resolve => {
      let hasStarted = false;
      let hasResolved = false;
      const unsubscribe = this._store.subscribe(() => {
        const isStepping = this.view(controllerSelector.isStepping);

        if (isStepping && !hasStarted) {
          hasStarted = true;
          debug('heard step start');
          return;
        }

        if (!isStepping && hasStarted && !hasResolved) {
          hasResolved = true;
          debug('heard step stop');
          unsubscribe();
          resolve(true);
        }
      });
      this.dispatch(stepperAction);
    });
  }

  async advance(count = 1) {
    return await this.doneStepping(controller.advance(count));
  }

  async stepNext() {
    return await this.doneStepping(controller.stepNext());
  }

  async stepOver() {
    return await this.doneStepping(controller.stepOver());
  }

  async stepInto() {
    return await this.doneStepping(controller.stepInto());
  }

  async stepOut() {
    return await this.doneStepping(controller.stepOut());
  }

  async reset() {
    return await this.doneStepping(controller.reset());
  }

  async continueUntilBreakpoint() {
    return await this.doneStepping(controller.continueUntilBreakpoint());
  }

  async addBreakpoint(breakpoint) {
    return this.dispatch(controller.addBreakpoint(breakpoint));
  }

  async removeBreakpoint(breakpoint) {
    return this.dispatch(controller.removeBreakpoint(breakpoint));
  }

  async removeAllBreakpoints() {
    return this.dispatch(controller.removeAllBreakpoints());
  }

  async decodeReady() {
    return new Promise(resolve => {
      let haveResolved = false;
      const unsubscribe = this._store.subscribe(() => {
        const subscriptionDecodingStarted = this.view(data.proc.decodingKeys);

        debug('following decoding started: %d', subscriptionDecodingStarted);

        if (subscriptionDecodingStarted <= 0 && !haveResolved) {
          haveResolved = true;
          unsubscribe();
          resolve();
        }
      });

      const decodingStarted = this.view(data.proc.decodingKeys);

      debug('initial decoding started: %d', decodingStarted);

      if (decodingStarted <= 0) {
        haveResolved = true;
        unsubscribe();
        resolve();
      }
    });
  }

  async variable(name) {
    await this.decodeReady();

    const definitions = this.view(data.current.identifiers.definitions);
    const refs = this.view(data.current.identifiers.refs);

    const decode = this.view(data.views.decoder);
    return await decode(definitions[name], refs[name]);
  }

  async variables() {
    debug('awaiting decodeReady');
    await this.decodeReady();
    debug('decode now ready');

    return await this.view(data.current.identifiers.decoded);
    debug('got variables');
  }
}

module.exports = Session;
