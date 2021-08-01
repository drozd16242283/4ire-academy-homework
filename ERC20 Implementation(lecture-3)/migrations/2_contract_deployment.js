const DROCoinContract = artifacts.require('DROCoinContract.sol');

module.exports = function(deployer, network, accounts) {
  deployer.deploy(DROCoinContract, {from: accounts[0]});
};