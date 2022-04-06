import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import SITAPreferencesContract from "./contracts/SITApreferences2.json";
import {encryptPreferences, decryptPreferences, genKey, hashKey} from "./crypto-methods";

import "./App.css";

class App extends Component {
  constructor(props){
    super(props);
    this.state = { storageValue: 0, web3: null, accounts: null, contract: null, address: '0x0', key: '', pref: ''};
    this.setKey = this.setKey.bind(this);
    this.outputKey = this.outputKey.bind(this);

    this.setPref = this.setPref.bind(this);
    this.outputPref = this.outputPref.bind(this);
    this.getKey = this.getKey.bind(this);
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

    /* var key = genKey();
    console.log("key: ", key);
    //var key = this.state.key; // Generates an AES key (returned in hexadecimal)
    var encPref = encryptPreferences("Hello testing test testing yes", key); //Encrypts text using AES-256 (used to encrypt SITA preferences string eg: "1234")
    console.log("encPref = ", encPref);
    await contract.methods.setPreferences(encPref,hashKey(key)).send({from: this.state.address}); // Stores encrypted preferences (as hex string) in the contract
    var retrPref = await contract.methods.getPreferences(this.state.address,hashKey(key)).call({from: this.state.address}); // Retrieves the encrypted preferences hex string from the contract
    console.log("retrPref = ", retrPref);
    console.log(decryptPreferences(retrPref,key)); // Decrypts the preferences  */
    
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

  getKey(){
    return(this.state.key);
  }

  outputKey(){ // Remove this, just a testing method to show the key was passed and set properly
    console.log("state key: ",this.state.key);
  }

  setPref(prefs){
    this.setState({pref: prefs}, this.outputPref);
  }

  outputPref(){
    console.log("prefs: ", this.state.pref);
  }


  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div className="TopBar">
        <YourAccount address = {this.state.address}/>
        <KeyManagement setKey = {this.setKey} setPref = {this.setPref} address = {this.state.address} contract = {this.state.contract} />
        </div>
        <div className="Body">
          <PreferencesForm address = {this.state.address} contract = {this.state.contract} getKey = {this.getKey}/>
        </div>
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
    var retrPref = await this.props.contract.methods.getPreferences(this.props.address, hashKey(this.state.key)).call({from: this.props.address}); // Attempts to retrieve preferences for this address + key combo
    // How to make pop-up appear when this returns an error to tell the user these preferences weren't found

    var decPref = decryptPreferences(retrPref,this.state.key); // Decrypts the retrieved encrypted preferences
    this.props.setPref(decPref); // Calls the method to update prefs in app state
  }

  async onDeletePreferences(){
    var success = await this.props.contract.methods.deletePreferences(hashKey(this.state.key)).send({from: this.props.address});
    console.log(success);
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

class PreferencesForm extends Component{
  constructor(props){
      super(props);
      this.state = {spatial: "0", identity: "0", temporal: "0", activity: "0"};

      this.handleChange = this.handleChange.bind(this);
      this.onSubmit = this.onSubmit.bind(this);


  }

  handleChange(event){
    console.log("target: ", event.target.id);
    console.log("value:", event.target.value);
    if(event.target.id == "spatial"){
      this.setState({spatial: event.target.value});
    }

    if(event.target.id == "identity"){
      this.setState({identity: event.target.value});
    }

    if(event.target.id == "temporal"){
      this.setState({temporal: event.target.value});
    }

    if(event.target.id == "activity"){
      this.setState({activity: event.target.value});
    }
    
  }

  async onSubmit(event){
    // !!! NEED TO PROVIDE AN INVALID KEY SIZE WARNING FOR WHEN NO KEY IS PROVIDED
    event.preventDefault();
    var prefs =  this.state.spatial + this.state.identity + this.state.temporal + this.state.activity;
    console.log("prefs: ", prefs);
    var encPref = encryptPreferences(prefs,this.props.getKey());
    console.log("encPref: ", encPref);
    await this.props.contract.methods.setPreferences(encPref,hashKey(this.props.getKey())).send({from: this.props.address});
  }

  render(){
    return(
        <div>
          <label>
            Define Your Preferences
              <form onSubmit={this.onSubmit}>
                <label>
                  Spatial:
                  <select id="spatial" value={this.state.spatial} onChange={this.handleChange}>
                    <option value="0">0. No Information</option>
                    <option value="1">1. Aggregation</option>
                    <option value="2">2. Obfuscation</option>
                    <option value="3">3. Regulation</option>
                    <option value="4">4. Full Information</option>
                  </select>
                </label>
                <br/>
                <label>
                  Identity:
                  <select id="identity" value={this.state.identity} onChange={this.handleChange}>
                    <option value="0">0. No Information</option>
                    <option value="1">1. Aggregation</option>
                    <option value="2">2. Obfuscation</option>
                    <option value="3">3. Regulation</option>
                    <option value="4">4. Full Information</option>
                  </select>
                </label>
                <br/>
                <label>
                  Temporal:
                  <select id="temporal" value={this.state.temporal} onChange={this.handleChange}>
                    <option value="0">0. No Information</option>
                    <option value="1">1. Aggregation</option>
                    <option value="2">2. Obfuscation</option>
                    <option value="3">3. Regulation</option>
                    <option value="4">4. Full Information</option>
                  </select>
                </label>
                <br/>
                <label>
                  Activity:
                  <select id="activity" value={this.state.activity} onChange={this.handleChange}>
                    <option value="0">0. No Information</option>
                    <option value="1">1. Aggregation</option>
                    <option value="2">2. Obfuscation</option>
                    <option value="3">3. Regulation</option>
                    <option value="4">4. Full Information</option>
                  </select>
                </label>
                <br/>
                <input type="submit" value="Submit" />
              </form>
          </label>
        </div>
    );
  }

}


export default App;