const chai = require('chai');
chai.use(require('chai-as-promised')).should();

const showState = require('../../scripts/show-state');

const a = 1;
describe('# show-state script test', () => {
  const CONTRACTS_DIR = path.join('./contracts');
  const CONTRACT_PATH1 = path.join(CONTRACTS_DIR, 'test', 'SecondA.sol');
  const CONTRACT_PATH2 = path.join(CONTRACTS_DIR, 'test', 'Attachment.sol');

  it('should be one', () => {
    a.should.equal(1);
  });

  it('should be two', () => {
    a.should.equal(2);
  });
})