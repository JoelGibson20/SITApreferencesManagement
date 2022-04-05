import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import SITAPreferencesContract from "./contracts/SITApreferences2.json";
import {encryptPreferences, decryptPreferences, genKey, hashKey} from "./crypto-methods";

import "./App.css";

class App extends Component {
  constructor(props){
    super(props);
    this.state = { storageValue: 0, web3: null, accounts: null, contract: null, address: '0x0', key: ''};
    this.setKey = this.setKey.bind(this);
    this.outputKey = this.outputKey.bind(this);
  }

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

      var account = web3.currentProvider.selectedAddress;
      console.log("test:", account);
/*       web3.eth.getCoinbase(function(err,account){
        if(err === null){
          console.log("account: ", account);
          this.setState({address: account});
        }
      });
       */

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, address: account}, this.runExample); // runExample is run here
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => { 
    const { accounts, contract } = this.state;

    var key = genKey();
    console.log("key: ", key);
    //var key = this.state.key; // Generates an AES key (returned in hexadecimal)
    var encPref = encryptPreferences("Hello testing test testing yes", key); //Encrypts text using AES-256 (used to encrypt SITA preferences string eg: "1234")
    console.log("encPref = ", encPref);
    await contract.methods.setPreferences(encPref,hashKey(key)).send({from: this.state.address}); // Stores encrypted preferences (as hex string) in the contract
    var retrPref = await contract.methods.getPreferences(this.state.address,hashKey(key)).call({from: this.state.address}); // Retrieves the encrypted preferences hex string from the contract
    console.log("retrPref = ", retrPref);
    console.log(decryptPreferences(retrPref,key)); // Decrypts the preferences 
    
    /*
    // Stores a given value, 5 by default.
    await contract.methods.set(5).send({ from: accounts[0] });
    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();
    // Update state with the result.
    this.setState({ storageValue: response }); */ 
  };

  setKey(newKey){
    //console.log("Key received: ",newKey);
    this.setState({key: newKey}, this.outputKey);
  }

  outputKey(){
    console.log("state key: ",this.state.key);
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div className="TopBar">
        <YourAccount address = {this.state.address}/>
        <KeyManagement setKey = {this.setKey} address = {this.state.address} contract = {this.state.contract} />
        </div>
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

class YourAccount extends Component{
	constructor(props){
		super(props);
	}

	
	render(){
    const address = this.props.address;
		return(	
			<p> Your Account: {address} </p>
		);
	}
}

class KeyManagement extends Component{
  constructor(props){
    super(props);
    this.state = {key: '', address: props.address, contract: props.contract};

    this.handleChange = this.handleChange.bind(this);
    this.onGetNewKey = this.onGetNewKey.bind(this);
    this.onRetrievePreferences = this.onRetrievePreferences.bind(this);
    this.onDeletePreferences= this.onDeletePreferences.bind(this);
    this.setStateKey= this.setStateKey.bind(this);
  }

  setStateKey(){
    this.props.setKey(this.state.key);
  }

  handleChange(event){
    event.preventDefault();
    this.setState({key: event.target.value}, this.setStateKey);
  }

  onGetNewKey(){
    this.setState({key: genKey()}, this.setStateKey );
  }

  async onRetrievePreferences(event){
    event.preventDefault();
    console.log("address: ", this.props.address);
    var retrPref = await this.props.contract.methods.getPreferences(this.props.address, hashKey(this.state.key)).call({from: this.props.address});
    // How to make pop-up appear when this returns an error to tell the user these preferences weren't found
    console.log("retrPref = ", retrPref)
    var decPref = decryptPreferences(retrPref,this.state.key);
    console.log("decPref: ", decPref);
    // Will require calling of a app component method here to set the preferences state. This will then be fed to the preferences form
  }

  onDeletePreferences(){
    console.log("delete");
  }

  render(){
    return(
      <div>
      <form onSubmit={this.onRetrievePreferences}>
        <label>
          Secret Key:
          <input type="text" value={this.state.key} onChange={this.handleChange}/>
        </label>
        <input type="submit" value="Retrieve"></input>
      </form>
      <br/>
      <button onClick={this.onGetNewKey}>Get New Key</button>
      <button onClick={this.onDeletePreferences}>Delete These Preferences</button>
      </div>
    );
  }
}


export default App;