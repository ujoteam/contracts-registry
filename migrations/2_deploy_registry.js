const Registry = artifacts.require('./Registry.sol');

module.exports = (deployer, network) => {
  if (network === 'rinkeby') {
    deployer.deploy(Registry);
  }
};
