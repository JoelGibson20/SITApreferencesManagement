pragma solidity ^0.8.4;

import "../contracts/Assert/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/SITApreferences2.sol";

contract TestSITApreferences2{
    SITApreferences2 test = SITApreferences2(DeployedAddresses.SITApreferences2());
    //call setPreferences with a number of keys to delete in deleteAllPreferences

    function testSetPreferences() public{
        test.setPreferences("1234", "5df85e69b3ee5399114053c51acecedf735c15abe1beb6b04221320726795477d58d7465b660d2c9ed077ad03fb3105b50372d5cd26809c0f18f0270c2f00c85");
    }

    function testModifyPreferences() public{
        test.setPreferences("3241", "5df85e69b3ee5399114053c51acecedf735c15abe1beb6b04221320726795477d58d7465b660d2c9ed077ad03fb3105b50372d5cd26809c0f18f0270c2f00c85");
    }

    function testAddApprovedAddress() public{
        test.addApprovedAddress(0xE8B537C3D34C796f6b0a65A51dF1D431213af84F, "5df85e69b3ee5399114053c51acecedf735c15abe1beb6b04221320726795477d58d7465b660d2c9ed077ad03fb3105b50372d5cd26809c0f18f0270c2f00c85");
    }

    function testRemoveApprovedAddress() public{
        test.removeApprovedAddress(0xE8B537C3D34C796f6b0a65A51dF1D431213af84F, "5df85e69b3ee5399114053c51acecedf735c15abe1beb6b04221320726795477d58d7465b660d2c9ed077ad03fb3105b50372d5cd26809c0f18f0270c2f00c85");
    }

    function testDeletePreferences() public{
        test.deletePreferences("5df85e69b3ee5399114053c51acecedf735c15abe1beb6b04221320726795477d58d7465b660d2c9ed077ad03fb3105b50372d5cd26809c0f18f0270c2f00c85");
    }

    function testAdd1Key() public{
        test.setPreferences("1234", "5df85e69b3ee5399114053c51acecedf735c15abe1beb6b04221320726795477d58d7465b660d2c9ed077ad03fb3105b50372d5cd26809c0f18f0270c2f00c85");
    }
   
    function testDeleteAllPreferences1Key() public{
        //Here we need multiple keys to delete
        test.deleteAllPreferences();
    }

    function testAdd2Key() public{
        test.setPreferences("1234", "5df85e69b3ee5399114053c51acecedf735c15abe1beb6b04221320726795477d58d7465b660d2c9ed077ad03fb3105b50372d5cd26809c0f18f0270c2f00c85");
        test.setPreferences("1234", "0bdbb53518cf3e5d8a45cb9683319871f443bed0077fddeacd0fa4282e8d74a4bd9a23d1bea20726578dc6c10113b5ebe51ebd132fe39d909d50636ecf3b014b");
    }

    function testDeleteAllPreferences2Key() public{
        //Here we need multiple keys to delete
        test.deleteAllPreferences();
    }

    function testAdd3Key() public{
        test.setPreferences("1234", "5df85e69b3ee5399114053c51acecedf735c15abe1beb6b04221320726795477d58d7465b660d2c9ed077ad03fb3105b50372d5cd26809c0f18f0270c2f00c85");
        test.setPreferences("1234", "0bdbb53518cf3e5d8a45cb9683319871f443bed0077fddeacd0fa4282e8d74a4bd9a23d1bea20726578dc6c10113b5ebe51ebd132fe39d909d50636ecf3b014b");
        test.setPreferences("1234", "24aa375ade14dc7014534e11ddf200bbae87ffcf9a6fb6956238437aae02c1dc3c1e6f65e09ceb5d203381e46ddeee10883a78a101d67d8ef486038507556d28");

    }


    function testDeleteAllPreferences3Key() public{
        //Here we need multiple keys to delete
        test.deleteAllPreferences();
    }


}