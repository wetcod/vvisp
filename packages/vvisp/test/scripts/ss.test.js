const rewire = require('rewire');
const path = require('path');
const chai = require('chai');

chai.use(require('chai-as-promised')).should();
const showState = rewire('../../scripts/show-state');
const StorageTableBuilder = require('../../scripts/show-state/storageTableBuilder');

describe('# show-state script test', function() {
  const CONTRACTS_DIR = path.join('./contracts');
  const CONTRACT_PATH1 = path.join(CONTRACTS_DIR, 'test', 'ShowStateA.sol');

  it('should be one', function() {
    const compile = showState.__get__('compile');
    const getLinearContractIds = showState.__get__('getLinearContractIds');
    const getContractNodesById = showState.__get__('getContractNodesById');

    const solcOutput = await compile(CONTRACT_PATH1);
    const baseAst = solcOutput.sources[CONTRACT_PATH1].ast;
    const linearIds = getLinearContractIds(baseAst, 'ShowStateA');
    const nodesById = getContractNodesById(solcOutput);
    const linearNodes = linearIds.map(id => nodesById[id]);

    const storageTableBuilder = new StorageTableBuilder(linearNodes);
    const storageTable = storageTableBuilder.build(linearNodes);

    for (let i = 0; i < storageTable.length; ++i) {
      console.log(storageTable[i]);
    }
  });
})