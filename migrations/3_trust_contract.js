const DROTokenTrust = artifacts.require('DROTokenTrust.sol');

module.exports = function(deployer) {
  deployer.deploy(DROTokenTrust);
};