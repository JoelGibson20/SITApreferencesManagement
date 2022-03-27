var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var SITApreferences2 = artifacts.require("./SITApreferences2.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(SITApreferences2);
};
