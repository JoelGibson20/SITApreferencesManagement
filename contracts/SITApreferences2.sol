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
/// @param approvedAddress Approved Address used.
/// @param userAddress Address used.
/// @param hashKey Hashed key used.
error ApprovedAddressNotFound(address approvedAddress,address userAddress, string hashKey);

/// Can't remove your own address from approved addresses.
/// @param userAddress Your address.
/// @param hashKey Hashed key used.
error CantRemoveOwnAddress(address userAddress, string hashKey);

/// This address already exists approvedAddresses for this address + H(key) combination.
/// @param approvedAddress Approved Address used.
/// @param userAddress Address used.
/// @param hashKey Hashed key used.
error ApprovedAddressAlreadyExists(address approvedAddress,address userAddress, string hashKey);
 
contract SITApreferences2{
    mapping(bytes => string) private userpreferences; // Mapping bytes (address + key) to string of encrypted preferences
    // Need to use bytes to be able to concatenate the address and key, should change later to a particular size bytes when we know address and key combined size

    mapping(address => string[]) private usedKeys; // Mapping user's address to string array of the H(key)s in use for a user

    mapping(bytes => address[]) private approvedAddresses; // Mapping address + H(key) to approved addresses that can read those preferences

    constructor(){}

    function setPreferences(string memory preferences, string memory key) public returns(bool success){ 
      require(keccak256(bytes(preferences)) != keccak256(bytes("")), "Preferences must be a string.");
      require(keccak256(bytes(key)) != keccak256(bytes("")), "Key must be a string.");
      // Stores user's preferences in the contract under the key, can only modify your own preferences

      if (!(keyInUse(msg.sender,key))){ 
        // If the key isn't already in use it needs to be added to the array in the usedKey mapping
        usedKeys[msg.sender].push(key);
      }

      bytes memory keyBytes = abi.encodePacked(key); // Convert string parameter for the secret key to bytes
      userpreferences[abi.encodePacked(msg.sender, keyBytes)] = preferences; // Store the preference array mapped under address + secret key as the mapping key
      return(true);
    }

    function getPreferences(address userAddress,string memory key) public view returns(string memory preferences){
      // Attempts to retrieve preferences stored under the provided address + H(key) combination
      bytes memory keyBytes = abi.encodePacked(key); // Convert string parameter for the secret key to bytes

      if( (msg.sender == userAddress) ||(approvedAddressExists(userAddress, key, msg.sender))){
        // Only addresses approved by the user are allowed to retrieve the encrypted preferences
        if(keyInUse(userAddress, key)){
          // Make sure the key is in use (and thus the preferences attempting to be retrieved exist)
          return(userpreferences[abi.encodePacked(userAddress, keyBytes)]);
        }
        else{
          // Return error indicating this preferences set isn't found
          revert PreferencesNotFound(userAddress, key);
        }
      }
      else{
        // Return error indicating the user isn't approved to retrieve these preferences
        revert ApprovedAddressNotFound(msg.sender,userAddress,key);
      }
    }

    function deletePreferences(string memory keyHash) public returns(bool success){
      // Attempts to delete a user's preferences stored under the provided H(key), only callable on your own preferences
      bytes memory keyBytes = abi.encodePacked(keyHash); // Convert string parameter for the secret key to bytes

      // Delete just leaves all the entries under these keys as the default ('' for strings, and empty arrays)
      // getPreferences, getApprovedAddresses etc don't work as the key is no longer in use
      if(keyInUse(msg.sender,keyHash)){
        // Only delete preferences if the key is use
        delete approvedAddresses[abi.encodePacked(msg.sender, keyBytes)];
        delete userpreferences[abi.encodePacked(msg.sender, keyBytes)]; 

        for(uint i; i < usedKeys[msg.sender].length; i++){ // Iterate through the user's keys
          if (keccak256(bytes(usedKeys[msg.sender][i])) == keccak256(bytes(keyHash))){ // Compare the key in usedKeys array and the key the user has entered
            usedKeys[msg.sender][i] = usedKeys[msg.sender][(usedKeys[msg.sender].length) - 1]; // Set the key to be deleted equal to the last key in the array
            usedKeys[msg.sender].pop(); // Remove the last key in the array
            return(true);
          }
        }
      }
      else{
        // Return error indicating the key isn't in use
        revert KeyNotInUse(msg.sender, keyHash);
      }

    }

    function keyInUse(address userAddress, string memory keyHash) private view returns(bool keyExists){ 
      // Helper function to check if a key already exists in keysUsed
      keyExists = false; // Boolean value for whether the key exists or not

      for(uint i; i < usedKeys[userAddress].length; i++){ // Iterate through the user's keys
        if (keccak256(bytes(usedKeys[userAddress][i])) == keccak256(bytes(keyHash))){ // Compare the key in usedKeys array and the key the user has entered
          keyExists = true; 
        }
      }

      return(keyExists);
    }

    function addApprovedAddress(address approvedAddress, string memory keyHash) public returns(bool success){
      // Attempts to add an approved address for the provided address + H(key) combination, only callable on own preferences
      
      if(keyInUse(msg.sender,keyHash)){
        // Only add approved address if the preferences exist
        if (approvedAddressExists(msg.sender, keyHash,approvedAddress)){
          // Prevents duplicate entries in approvedAddresses, returns error
          return(true); // Success as address already approved
        }
        // If approved address isn't already present
        bytes memory keyBytes = abi.encodePacked(keyHash); // Convert string parameter for the secret key to bytes
        approvedAddresses[abi.encodePacked(msg.sender, keyBytes)].push(approvedAddress); // Add approved address to list
        return (true);
      }
      else{
        // Returns error if key doesn't exist
        revert KeyNotInUse(msg.sender, keyHash);
      }

    }

    function getApprovedAddresses(string memory keyHash) public view returns(address[] memory addresses){
      // Gets list of approved addresses for address + H(key) combination, only callable on own preferences
       if(keyInUse(msg.sender,keyHash)){
         // Only retrieve approved addresses if the key is in use
        bytes memory keyBytes = abi.encodePacked(keyHash);
        return(approvedAddresses[abi.encodePacked(msg.sender, keyBytes)]);
       }
       else{
         // Returns error if key doesn't exist
         revert KeyNotInUse(msg.sender, keyHash);
       }
    }

    function removeApprovedAddress(address removeAddress, string memory keyHash) public returns (bool success){ 
      // Removes an approved address for address + H(key) combination, only callable on own preferences

      if(removeAddress == msg.sender){
        // User not allowed to remove their own address
        revert CantRemoveOwnAddress(msg.sender, keyHash);
      }

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
        // If we loop through all approved addresses without finding it return error
        revert ApprovedAddressNotFound(removeAddress,msg.sender,keyHash);
      }
      else{
        // Returns error if key doesn't exist
        revert KeyNotInUse(msg.sender, keyHash);
      }
      
    }

    function approvedAddressExists(address userAddress, string memory keyHash, address approvedAddress) private view returns (bool success){ 
      // Helper function which checks if an address exists in approved addresses for address + H(key) combination

      if(keyInUse(userAddress,keyHash)){ // Don't waste computing power (and thus Ethereum) looping through if the key isn't being used
        bytes memory keyBytes = abi.encodePacked(keyHash);
        address[] memory approvedAddressList = approvedAddresses[abi.encodePacked(userAddress, keyBytes)];
        for(uint i; i < approvedAddressList.length; i++){  // Iterates through the users approved addresses
          if (approvedAddressList[i] == approvedAddress){ // Checks if the address exists in approvedAddresses
            return(true);
          }
        }
        return(false);
      }
      else{
        // Provide Approved Address not found error instead of key not in use error to prevent leaking whether a user is using 
        // a certain key (necessary as this function is called in getPreferences, which can be called by not just the preferences owner)
        revert ApprovedAddressNotFound(approvedAddress,userAddress,keyHash); 
      }

    }

    function deleteAllPreferences() public returns (bool success){
      // The nuclear option. Allows user to delete all preference sets stored for them without providing the key.
      // For use in case a user wants to delete a preference set but has forgotten the key

      string[] memory keysInUse = usedKeys[msg.sender]; // Gets all the keys the user has

      if(keysInUse.length == 0){ // Returns false if there are no preferences to delete
        revert KeyNotInUse(msg.sender, "any");
      }

      for(uint i; i < keysInUse.length; i++){ // Iterates through all the keys the user has
        deletePreferences(keysInUse[i]); // Deletes the preference set under this key
      }

      return(true);
    }

}