import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import SITAPreferencesContract from "./contracts/SITApreferences2.json";
import {encryptPreferences, decryptPreferences, genKey, hashKey} from "./crypto-methods";
import web3 from "web3";

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

    this.setApprovedAddresses = this.setApprovedAddresses.bind(this);

    this.preferencesFormRef = React.createRef(); // Create reference for our PreferencesForm Component
    // This reference is used when preferences are retrieved, so that the form can be updated to show these preferences

    this.approvedAddressesRef = React.createRef(); // Create reference for our ApprovedAddresses Component
    // This reference is used when approved addresses are retrieved alongside preferences, so that the approved addresses drop-down can be updated to show approved addresseses
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
    console.log(hashKey("fb9467f6b13f11d5f77af36b703344cd5bc45d2cdd507b051172e7e4d37fcb69"));
    
    //this.approvedAddressesRef.current.updateApprovedAddresses(["test1","test2","test3"]);
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
    this.preferencesFormRef.current.updatePrefs(this.state.pref);
  }

  outputPref(){
    console.log("prefs: ", this.state.pref);
  }

  setApprovedAddresses(newApprovedAddresses){
    this.approvedAddressesRef.current.updateApprovedAddresses(newApprovedAddresses);
  }


  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div className="TopBar">
        <YourAccount address = {this.state.address}/>
        <KeyManagement setKey = {this.setKey} setPref = {this.setPref} setApprovedAddresses = {this.setApprovedAddresses} address = {this.state.address} contract = {this.state.contract} />
        </div>
        <div className="Body">
          <PreferencesForm ref = {this.preferencesFormRef} address = {this.state.address} contract = {this.state.contract} getKey = {this.getKey}/>
          <ApprovedAddresses ref = {this.approvedAddressesRef} address = {this.state.address} contract = {this.state.contract} getKey = {this.getKey} />
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
    // !!! Want to make a "Please save your current key so you don't forget it before proceeding"
    this.setState({key: genKey()}, this.setStateKey );
    this.props.setApprovedAddresses([]); // Resets the approved addresses field on creation of a new key
  }

  async onRetrievePreferences(event){
    event.preventDefault();
    var retrPref = await this.props.contract.methods.getPreferences(this.props.address, hashKey(this.state.key)).call({from: this.props.address}); // Attempts to retrieve preferences for this address + key combo
    // !!! How to make pop-up appear when this returns an error to tell the user these preferences weren't found

    var decPref = decryptPreferences(retrPref,this.state.key); // Decrypts the retrieved encrypted preferences
    this.props.setPref(decPref); // Calls the method to update prefs in app state
    
    var approvedAddresses = await this.props.contract.methods.getApprovedAddresses(hashKey(this.state.key)).call({from:this.props.address });
    // Get the approved addresses for this preferences set
    this.props.setApprovedAddresses(approvedAddresses); // Calls the method to update the approved addresses in the ApprovedAddresses drop-down
  }

  async onDeletePreferences(){
    // !!! Want to make an are you sure? confirmation
    var success = await this.props.contract.methods.deletePreferences(hashKey(this.state.key)).send({from: this.props.address});
    console.log(success); // !!! Message to user based on success (Preferences deleted!, or Preferences not found)
    if(success){
      this.setState({key: ''}, this.setStateKey); // Clears secret key input after preferences deleted
      this.props.setPref('0000'); // Resets preference form back to default
    }
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
      this.updatePrefs = this.updatePrefs.bind(this);


  }

  updatePrefs(prefs){
    this.setState({spatial: prefs[0], identity: prefs[1], temporal: prefs[2], activity: prefs[3]})
  }

  handleChange(event){
    console.log("target: ", event.target.id);
    console.log("value:", event.target.value);
    if(event.target.id === "spatial"){
      this.setState({spatial: event.target.value});
    }

    if(event.target.id === "identity"){
      this.setState({identity: event.target.value});
    }

    if(event.target.id === "temporal"){
      this.setState({temporal: event.target.value});
    }

    if(event.target.id === "activity"){
      this.setState({activity: event.target.value});
    }
    
  }

  async onSubmit(event){
    event.preventDefault();
    var prefs =  this.state.spatial + this.state.identity + this.state.temporal + this.state.activity; // Combines the dimensions into 1 string
    console.log("prefs: ", prefs);
    var key = this.props.getKey();

    if(key.length !== 64){ // Checks key is of right length, otherwise don't try and encrypt (encryption with wrong key length causes error)
      console.log("Key wrong length"); // Need to have this cause an alert or some message informing wrong key length
    }
    else{
      var encPref = encryptPreferences(prefs,key);
      console.log("encPref: ", encPref);
      await this.props.contract.methods.setPreferences(encPref,hashKey(this.props.getKey())).send({from: this.props.address});
    }
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

class ApprovedAddresses extends Component{
  constructor(props){
    super(props);
    this.state = {approvedAddresses: [], newAddress: '', selectedAddress: ''};

    this.updateApprovedAddresses = this.updateApprovedAddresses.bind(this);
    this.handleNewAddressChange = this.handleNewAddressChange.bind(this);
    this.handleRemoveAddressChange = this.handleRemoveAddressChange.bind(this);
    this.onAddAddress = this.onAddAddress.bind(this);
    this.onRemoveAddress = this.onRemoveAddress.bind(this)
  }

  updateApprovedAddresses(newApprovedAddresses){ // Updates approved addresses with a new list of approved addresses(called externally)
    this.setState({approvedAddresses: newApprovedAddresses});
    this.setState({selectedAddress: this.state.approvedAddresses[0]});
  }

  handleNewAddressChange(event){
    event.preventDefault();
    this.setState({newAddress: event.target.value});
  }

  handleRemoveAddressChange(event){
    event.preventDefault();
    console.log("selected value: ",event.target.value);
    this.setState({selectedAddress: event.target.value});
  }

  async onAddAddress(event){
    event.preventDefault();
    console.log(web3.utils.isAddress(this.state.newAddress));
    if((web3.utils.isAddress(this.state.newAddress)) && !(this.state.approvedAddresses.includes(this.state.newAddress)) && !(this.state.newAddress === this.props.address)){
      var success = await this.props.contract.methods.addApprovedAddress(this.state.newAddress,hashKey(this.props.getKey())).send({from: this.props.address});
      if(success){
        this.setState({newAddress: ''});
        this.getNewAddressList();
      }
    }
    else if(!(web3.utils.isAddress(this.state.newAddress))){
      console.log("Not an address"); // !!! Want a pop-up here explaining address isn't valid
    }
    else if(this.state.newAddress === this.props.address){
      console.log("Can't add your own address"); // !!! Want a pop-up here explaining address isn't valid
    }
    else if(this.state.approvedAddresses.includes(this.state.newAddress)){
      console.log("Address already approved"); // !!! Want a pop-up here explaining address isn't valid
    }

  }

  async onRemoveAddress(event){
    event.preventDefault();
    console.log(this.state.selectedAddress);
    console.log(web3.utils.isAddress(this.state.selectedAddress));
    var success = await this.props.contract.methods.removeApprovedAddress(this.state.selectedAddress, hashKey(this.props.getKey())).send({from: this.props.address});
    console.log("success: ", success);
    this.getNewAddressList();
  }

  async getNewAddressList(){
    var newApprovedAddresses = await this.props.contract.methods.getApprovedAddresses(hashKey(this.props.getKey())).call({from:this.props.address });
    this.setState({approvedAddresses: newApprovedAddresses }); 
  }

  render(){
    let addressList = this.state.approvedAddresses.length > 0 // If there is an approved address
    && this.state.approvedAddresses.map((address) => {
      console.log("address: ", address); // Iterate through the approved addresses and map them to a select option for the drop-down
      return(
        <option key={address} value={address}>{address}</option>
      )

    }, this);

    return(
      <div>
        <form onSubmit={this.onRemoveAddress}>
          <label>
            Approved Addresses:
            <select id="approvedAddressSelect" value={this.state.selectedAddress} onChange={this.handleRemoveAddressChange}>
              {addressList} 
            </select>
            <input type="submit" value="Remove this address"></input>
          </label>
        </form>
        <br/>
        <form onSubmit={this.onAddAddress}>
        <label>
          Add an Approved Address:
          <input type="text" value={this.state.newAddress} onChange={this.handleNewAddressChange}/>
        </label>
        <input type="submit" value="Add new address"></input>
      </form>

      </div>
    );
  }
}


export default App;