pragma solidity ^0.8.4;
 
// These custom errors unfortunately do not display in the Truffle Console
// https://github.com/trufflesuite/truffle/issues/4123

/// Preferences not found for this address + H(key) combination.
/// @param userAddress Address used.
/// @param hashKey Hashed key used.
error PreferencesNotFound(address userAddress, string hashKey);

/// This address + H(key) combination was not found.
/// @param userAddress Address used.
/// @param hashKey Hashed key used.
error KeyNotInUse(address userAddress, string hashKey);

/// This address was not found in approvedAddresses for this address + H(key) combination.
/// @param approvedAddress Approved Address.
/// @param userAddress Address used.
/// @param hashKey Hashed key used.
error ApprovedAddressNotFound(address approvedAddress,address userAddress, string hashKey);
 
contract SITApreferences2{
    mapping(bytes => string) private userpreferences; // Mapping bytes (address + key) as you cant use struct or array as mapping keys
    // Need to use bytes to be able to concatenate the address and key, should change later to a particular size bytes when we know address and key combined size

    mapping(address => string[]) private usedKeys; // String array of the H(key) in use for a user

    mapping(bytes => address[]) private approvedAddresses; // Mapping linking address + H(key) to approved addresses

    constructor(){}

    function setPreferences(string memory preferences, string memory key) public returns(bool success){
      // Require statement here to ensure all dimensions are 0-4

      if (keyInUse(msg.sender,key) == false){ // If the key isn't already in use it needs to be added to the array in the usedKey mapping
        usedKeys[msg.sender].push(key);
        addApprovedAddress(msg.sender, key); // Adds the user's address to approved addresses the first time a key is used.
      }

      bytes memory keyBytes = abi.encodePacked(key); // Convert string parameter for the secret key to bytes
      userpreferences[abi.encodePacked(msg.sender, keyBytes)] = preferences; // Store the preference array mapped under address + secret key as the mapping key
      return(true); // Need to return upon success of setting, but need require statement
    }

    function getPreferences(address userAddress,string memory key) public returns(string memory preferences){
      bytes memory keyBytes = abi.encodePacked(key); // Convert string parameter for the secret key to bytes

      if(keyInUse(userAddress, key)){
        return(userpreferences[abi.encodePacked(userAddress, keyBytes)]);
      }
      else{
        revert PreferencesNotFound(userAddress, key);
      }

    }

    function keyInUse(address userAddress, string memory keyHash) private returns(bool keyExists){ // Helper function to check if a key already exists in keysUsed
      keyExists = false; // Boolean value for whether the key exists yet or not

      for(uint i; i < usedKeys[userAddress].length; i++){ // Iterate through the user's keys
        if (keccak256(bytes(usedKeys[userAddress][i])) == keccak256(bytes(keyHash))){ // Compare the key in usedKeys array and the key the user has entered
          keyExists = true; 
        }
      }

      return(keyExists);
    }

    function addApprovedAddress(address approvedAddress, string memory keyHash) public returns(bool success){
      if(keyInUse(msg.sender,keyHash)){
        bytes memory keyBytes = abi.encodePacked(keyHash);
        approvedAddresses[abi.encodePacked(msg.sender, keyBytes)].push(approvedAddress);
        return (true);
      }
      else{
        return (false);
      }

    }

    function getApprovedAddresses(string memory keyHash) public returns(address[] memory addresses){
       if(keyInUse(msg.sender,keyHash)){
        bytes memory keyBytes = abi.encodePacked(keyHash);
        return(approvedAddresses[abi.encodePacked(msg.sender, keyBytes)]);
       }
       else{
         revert KeyNotInUse(msg.sender, keyHash);
       }
    }

    function removeApprovedAddress(address removeAddress, string memory keyHash) public returns (bool success){ // This should probably be converted to a helper function to prevent duplicate values, assuming hash-sets don't exist in Solidity
      if(keyInUse(msg.sender,keyHash)){ // Don't waste computing power (and thus Ethereum) looping through if the key isn't being used
        bytes memory keyBytes = abi.encodePacked(keyHash);
        address[] memory approvedAddressList = approvedAddresses[abi.encodePacked(msg.sender, keyBytes)]; // Gets the list to reduce the complexity of the for loop
        for(uint i; i < approvedAddressList.length; i++){  // Iterates through the users approved addresses
          if (approvedAddressList[i] == removeAddress){ // Attempts to find the address to be removed
            approvedAddresses[abi.encodePacked(msg.sender, keyBytes)][i] = approvedAddresses[abi.encodePacked(msg.sender, keyBytes)][approvedAddressList.length - 1]; // Sets the index of address to be removed to be equal to the last address in the array
            approvedAddresses[abi.encodePacked(msg.sender, keyBytes)].pop(); // Pops the last address in the array, the last address now occupies [i] 
            return (true);
          }
        }
        revert ApprovedAddressNotFound(removeAddress,msg.sender,keyHash);
      }
      else{
        revert KeyNotInUse(msg.sender, keyHash); // I think we're getting this revert even though key is in use?
      }
      
    }

}