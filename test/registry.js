const { assertRevert } = require('./helpers/assertRevert');

const Registry = artifacts.require('./Registry.sol');
let registry;

// function publish(address[] _subjects, bytes32[] _actions, bytes32[] _types, string _cids)
contract('Registry', (accounts) => {
  beforeEach(async () => {
    registry = await Registry.new();
  });

  it('should register a Person CID to one account by same account', async () => {
    const register = await registry.publish([accounts[1]], ['create'], ['Person'], 'Qma', { from: accounts[1] });
    assert.equal(register.logs[0].args.issuer, accounts[1]);
    assert.equal(register.logs[0].args.subject, accounts[1]);
    assert.equal(web3.toAscii(register.logs[0].args.action).replace(/\u0000/g, ''), 'create');
    assert.equal(web3.toAscii(register.logs[0].args.contentType).replace(/\u0000/g, ''), 'Person');
    assert.equal(register.logs[0].args.cid, 'Qma');
  });

  // register a Person CID to one account by another issuer
  it('register a Person CID to one account by another issuer', async () => {
    const register = await registry.publish([accounts[1]], ['create'], ['Person'], 'Qma', { from: accounts[2] });
    assert.equal(register.logs[0].args.issuer, accounts[2]);
    assert.equal(register.logs[0].args.subject, accounts[1]);
    assert.equal(web3.toAscii(register.logs[0].args.action).replace(/\u0000/g, ''), 'create');
    assert.equal(web3.toAscii(register.logs[0].args.contentType).replace(/\u0000/g, ''), 'Person');
    assert.equal(register.logs[0].args.cid, 'Qma');
  });

  // register a Person CID with mismatch lengths of subjects/actions/_types (should fail)
  it('register a Person CID with mismatch lengths of subjects/actions/_types (should fail)', async () => {
    assertRevert(registry.publish([accounts[1]], ['create', 'delete'], ['Person'], 'Qma', { from: accounts[1] }));
  });

  // register a Person CID with no cids (should fail)
  it('register a Person CID with no cids (should fail)', async () => {
    assertRevert(registry.publish([accounts[1]], ['create'], ['Person'], '', { from: accounts[2] }));
  });

  // register a Person & MusicGroup CID to one account
  it('register a Person & MusicGroup CID to one account in 2 txes', async () => {
    const register = await registry.publish([accounts[1]], ['create'], ['Person'], 'Qma', { from: accounts[1] });
    const register2 = await registry.publish([accounts[1]], ['create'], ['MusicGroup'], 'Qma', { from: accounts[1] });
    assert.equal(register.logs[0].args.issuer, accounts[1]);
    assert.equal(register2.logs[0].args.issuer, accounts[1]);
    assert.equal(web3.toAscii(register.logs[0].args.contentType).replace(/\u0000/g, ''), 'Person');
    assert.equal(web3.toAscii(register2.logs[0].args.contentType).replace(/\u0000/g, ''), 'MusicGroup');
  });

  it('register a Person & MusicGroup CID in one tx to one account', async () => {
    const register = await registry.publish([accounts[1], accounts[1]], ['create', 'create'], ['Person', 'MusicGroup'], 'Qma|Qmb', { from: accounts[1] });
    assert.equal(register.logs[0].args.issuer, accounts[1]);
    assert.equal(register.logs[0].args.subject, accounts[1]);
    assert.equal(web3.toAscii(register.logs[0].args.action).replace(/\u0000/g, ''), 'create');
    assert.equal(web3.toAscii(register.logs[0].args.contentType).replace(/\u0000/g, ''), 'Person');
    assert.equal(register.logs[0].args.cid, 'Qma');
    assert.equal(register.logs[1].args.issuer, accounts[1]);
    assert.equal(register.logs[1].args.subject, accounts[1]);
    assert.equal(web3.toAscii(register.logs[1].args.action).replace(/\u0000/g, ''), 'create');
    assert.equal(web3.toAscii(register.logs[1].args.contentType).replace(/\u0000/g, ''), 'MusicGroup');
    assert.equal(register.logs[1].args.cid, 'Qmb');
  });

  it('remove a Person CID', async () => {
    const register = await registry.publish([accounts[1]], ['delete'], ['Person'], 'Qma', { from: accounts[1] });
    assert.equal(register.logs[0].args.issuer, accounts[1]);
    assert.equal(register.logs[0].args.subject, accounts[1]);
    assert.equal(web3.toAscii(register.logs[0].args.action).replace(/\u0000/g, ''), 'delete');
    assert.equal(web3.toAscii(register.logs[0].args.contentType).replace(/\u0000/g, ''), 'Person');
    assert.equal(register.logs[0].args.cid, 'Qma');
  });

  it('update a MusicGroup (delete then create new one)', async () => {
    const register = await registry.publish([accounts[1], accounts[1]], ['delete', 'create'], ['MusicGroup', 'MusicGroup'], 'Qma|Qmb', { from: accounts[1] });
    assert.equal(register.logs[0].args.issuer, accounts[1]);
    assert.equal(register.logs[0].args.subject, accounts[1]);
    assert.equal(web3.toAscii(register.logs[0].args.action).replace(/\u0000/g, ''), 'delete');
    assert.equal(web3.toAscii(register.logs[0].args.contentType).replace(/\u0000/g, ''), 'MusicGroup');
    assert.equal(register.logs[0].args.cid, 'Qma');
    assert.equal(register.logs[1].args.issuer, accounts[1]);
    assert.equal(register.logs[1].args.subject, accounts[1]);
    assert.equal(web3.toAscii(register.logs[1].args.action).replace(/\u0000/g, ''), 'create');
    assert.equal(web3.toAscii(register.logs[1].args.contentType).replace(/\u0000/g, ''), 'MusicGroup');
    assert.equal(register.logs[1].args.cid, 'Qmb');
  });
  it('record previous block number', async () => {
    var number = web3.eth.blockNumber;
    const register = await registry.publish([accounts[1], accounts[1]], ['delete', 'create'], ['MusicGroup', 'MusicGroup'], 'Qma|Qmb', { from: accounts[1] });
    assert.equal(register.logs[0].args.prevblock, number);
  })
});
