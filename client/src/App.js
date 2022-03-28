import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";
import SITAPreferencesContract from "./contracts/SITApreferences2.json";
import cryptoMethods, {encryptPreferences, decryptPreferences, genKey} from "./crypto-methods";

import "./App.css";

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SITAPreferencesContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SITAPreferencesContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample); // runExample is run here
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => { 
    //console.log(decryptPreferences(encryptPreferences("1234","test"), "test")); // Tests encryption and decryption methods
    const { accounts, contract } = this.state;
    var key = genKey();
    encryptPreferences("1222", key);

   /*  await contract.methods.setPreferences("1234","test").send({from: accounts[0]});
    const pref1 = await contract.methods.getPreferences(accounts[0],"test").call()
    console.log("pref1 = ", pref1) //Preferences successfully stored and retrieved
    
    // Can't store encrypted preferences as crypto-js.aes returns a CipherParams object that our contract can't store
    const encPref = encryptPreferences("1234", "test2");
    console.log("encPref = " + encPref);
    // Calling setPreferences with encrypted string
    await contract.methods.setPreferences(encPref,"test2").send({from: accounts[0]});  
    const pref2 = await contract.methods.getPreferences(accounts[0],"test2").call(); 
    console.log("pref2 = " ,pref2); 

    const decPref2 = decryptPreferences(pref2, "test2");
    console.log("decPref2 = " + decPref2); */
    
/* 
    // Stores a given value, 5 by default.
    await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ storageValue: response }); */ 
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>
        <p>
          If your contracts compiled and migrated successfully, below will show
          a stored value of 5 (by default).
        </p>
        <p>
          Try changing the value stored on <strong>line 42</strong> of App.js.
        </p>
        <div>The stored value is: {this.state.storageValue}</div>
      </div>
    );
  }
}

export default App;
