import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import SITAPreferencesContract from "./contracts/SITApreferences2.json";
import {encryptPreferences, decryptPreferences, genKey, hashKey} from "./crypto-methods";
import web3 from "web3";
import {Container, Button, Navbar, Form, Row, Col, Modal} from 'react-bootstrap/';

import "./App.css";
import "./bootstrap.min.css"

class App extends Component {
  constructor(props){
    super(props);
    this.state = { storageValue: 0, web3: null, accounts: null, contract: null, address: '0x0', key: '', pref: '', modalShow: false, cancelNeeded: null, modalTitle: '', modalBody: '',modalOkMessage: '', modalOkFunction: null};
    this.setKey = this.setKey.bind(this);
    this.setPref = this.setPref.bind(this);
    this.getKey = this.getKey.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.showModal = this.showModal.bind(this);

    this.setApprovedAddresses = this.setApprovedAddresses.bind(this);

    this.preferencesFormRef = React.createRef(); // Create reference for our PreferencesForm Component
    // This reference is used when preferences are retrieved, so that the form can be updated to show these preferences

    this.approvedAddressesRef = React.createRef(); // Create reference for our ApprovedAddresses Component
    // This reference is used when approved addresses are retrieved alongside preferences, so that the approved addresses drop-down can be updated to show approved addresseses

    this.keyManagementRef = React.createRef();
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

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, address: account}); // runExample is run here
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
    
    if(window.ethereum) {
      window.ethereum.on('accountsChanged', function () { // Refreshes page on account change
            window.location.reload(true);
          });
      window.ethereum.on('chainChanged', () => { // Refreshes page on network change
        window.location.reload(true);
       });
      }
  }


  setKey(newKey){
    this.setState({key: newKey});
    if(newKey === ''){ // When delete all preferences completes it will reset the secret key box like so
      this.keyManagementRef.current.setNewKey();
    }
    
    
  }

  getKey(){
    return(this.state.key);
  }

  setPref(prefs){
    this.setState({pref: prefs});
    this.preferencesFormRef.current.updatePrefs(this.state.pref);
  }


  setApprovedAddresses(newApprovedAddresses){
    this.approvedAddressesRef.current.updateApprovedAddresses(newApprovedAddresses);
  }

  closeModal(){
    this.setState({modalShow: false});
  }

  showModal(cancel, title, body, okMessage, okFunction){
    this.setState({cancelNeeded: cancel, modalTitle: title, modalBody: body, modalShow: true, modalOkMessage: okMessage, modalOkFunction: okFunction});
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract. If you haven't already, please log in to your account using the MetaMask extension.</div>;
    }
    return (
      <div className="app">
        <Navbar className="navbar-top" variant="light"  expand="lg">
          <Container>
          <YourAccount address = {this.state.address}/>
          <KeyManagement ref={this.keyManagementRef} setKey = {this.setKey} getKey={this.getKey} setPref = {this.setPref} setApprovedAddresses = {this.setApprovedAddresses} address = {this.state.address} contract = {this.state.contract} showModal={this.showModal} closeModal={this.closeModal}/>
          </Container>
        </Navbar>
        <br/>
        <Container className="body">
          <Row>
            <Col xs="7"> 
           <PreferencesForm ref = {this.preferencesFormRef} address = {this.state.address} contract = {this.state.contract} getKey = {this.getKey} showModal={this.showModal} closeModal={this.closeModal}/>
           </Col>
           <Col>
            <ApprovedAddresses ref = {this.approvedAddressesRef} address = {this.state.address} contract = {this.state.contract} getKey = {this.getKey} showModal={this.showModal} closeModal={this.closeModal} />
          </Col>
          </Row>
        </Container>

        <Container className="modal">
        <Modal show={this.state.modalShow} backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>{this.state.modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{this.state.modalBody}</Modal.Body>
        <Modal.Footer>
          {this.state.cancelNeeded === true &&
           <Button variant="secondary" onClick={this.closeModal}>
            Cancel
         </Button>
          }
          <Button variant="primary" onClick={this.state.modalOkFunction}>
           {this.state.modalOkMessage}
          </Button>
        </Modal.Footer>
      </Modal>
      </Container>   
      
      <Navbar className="navbar-bottom" variant="light"  expand="lg">
        <Container>
          <Col><p>Produced by Joel Gibson</p></Col>
          <Col><a href="https://github.com/JoelGibson20/react" target="_blank" rel="noopener noreferrer">GitHub Link</a></Col>
          <Col>
          <DeleteAllPreferences setKey = {this.setKey} setPref = {this.setPref} address = {this.state.address} contract = {this.state.contract} getKey = {this.getKey} showModal={this.showModal} closeModal={this.closeModal}/>
          </Col>
        </Container>
      </Navbar>

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
      <Container id="yourAccountContainer">
      <div id="yourAccountDiv">
        <h4>Your Account:</h4>
			  <p id="yourAccount">  {address} </p>
      </div>
      </Container>	
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
    this.setNewKey = this.setNewKey.bind(this);
    this.setStateKey = this.setStateKey.bind(this);
    this.deleteModal = this.deleteModal.bind(this);
    this.newKeyModal = this.newKeyModal.bind(this);
  }
  

  setNewKey(){ // Outside method to be used with ref to reset key when all preferences deleted
    this.setState({key: ''});
  }

  setStateKey(){
    this.props.setKey(this.state.key);
    this.keyError();
  }

  handleChange(event){
    event.preventDefault();
    this.setState({key: event.target.value}, this.setStateKey);
  }

  onGetNewKey(){
    this.setState({key: genKey()}, this.setStateKey );
    this.props.setApprovedAddresses([]); // Resets the approved addresses field on creation of a new key
    this.props.closeModal();
  }

  async onRetrievePreferences(event){
    event.preventDefault();
    if(!this.keyError()){
      try{
        var retrPref = await this.props.contract.methods.getPreferences(this.props.address, hashKey(this.state.key)).call({from: this.props.address}); // Attempts to retrieve preferences for this address + key combo
        var decPref = decryptPreferences(retrPref,this.state.key); // Decrypts the retrieved encrypted preferences
        this.props.setPref(decPref); // Calls the method to update prefs in app state
        
        var approvedAddresses = await this.props.contract.methods.getApprovedAddresses(hashKey(this.state.key)).call({from:this.props.address });
        // Get the approved addresses for this preferences set
        this.props.setApprovedAddresses(approvedAddresses); // Calls the method to update the approved addresses in the ApprovedAddresses drop-down
        this.props.showModal(false, "Success!", "Preferences retrieved for this key.", "OK", this.props.closeModal);
      }
      catch{
        this.props.showModal(false, "Failure!", "Preferences unable to be retrieved, key not in use.", "OK", this.props.closeModal);
      }
  }
  }

  async onDeletePreferences(){
      if(this.keyError()){
        this.props.showModal(false, "Failure!", "Invalid key. Please enter a valid key.", "OK", this.props.closeModal);
      }
      else{
        this.props.closeModal();
        try{
          var retrPref = await this.props.contract.methods.getPreferences(this.props.address, hashKey(this.state.key)).call({from: this.props.address}); // Attempts to retrieve preferences for this address + key combo to see if there's anything to delete
          var success = await this.props.contract.methods.deletePreferences(hashKey(this.state.key)).send({from: this.props.address});

          if(success){
            this.setState({key: ''}, this.setStateKey); // Clears secret key input after preferences deleted
            this.props.setPref('0000'); // Resets preference form back to default
            this.props.showModal(false, "Success!", "Preferences deleted under this key.", "OK", this.props.closeModal);
          }
        }
        catch(e){
          if(!(e.code === 4001)){ //Error code for user cancelling MetaMask tranasction
            this.props.showModal(false, "Failure!", "No preferences found for this key, nothing to delete.", "OK", this.props.closeModal);
          }
        }
      }
  }

  keyError(){ // Checks inputted key for problems
    const keyInput = document.querySelector("[name=keyInput]");
    var re = /[0-9A-Fa-f]{64}/g; // Hexadecimal regex expression

    if(this.state.key.length === 0){ // Key can't be blank
      keyInput.setCustomValidity("Key can't be blank");
      return(true);
    }
    else if(this.state.key.length > 64 || this.state.key.length < 64 ){ // Key must be 64 characters long
      keyInput.setCustomValidity("Key must be 64 characters long");
      return(true);
    }
    else if(!re.test(this.state.key)){ // Key must be hexadecimal (checked using regex)
      keyInput.setCustomValidity("Key must be hexadecimal");
      return(true);
    }
    else{ 
      keyInput.setCustomValidity(""); // No problems, no warning displayed
      return(false);
    }
  }

  newKeyModal(){
    if(this.state.key.length === 0){ // Doesn't prompt you to save your key if there isn't one in the box
      this.onGetNewKey();
    }
    else{
      this.props.showModal(true, "Remember to save your key!", "Please save your key so you don't forget it. Click cancel if you need to do this.", "Proceed", this.onGetNewKey)
    }
  }

  deleteModal(){
    this.props.showModal(true, "Are you sure you want to delete these preferences?", "Once deleted you will not be able to get these preferences back.", "Proceed", this.onDeletePreferences)
  }

  render(){
    return(
      <Container id="keyManagementDiv">
        
      <Form onSubmit={this.onRetrievePreferences}>
        <Row>
          <label>
            <h4>Secret Key:</h4>
            </label>
        </Row>
        <Row>
          <Col>
          <Form.Control className="keyInput" type="text" size="sm" placeholder="Enter your secret key" id="keyInput" name="keyInput" value={this.state.key} onChange={this.handleChange} />
          </Col>
        </Row>
        
        <Row className="keyManagementButtons"> 
        <Col><Button className="dangerButton" size="sm" variant="danger" onClick={this.deleteModal}>Delete These Preferences</Button></Col>
        <Col><Button className="secondaryButton" size="sm" variant="secondary" onClick={this.newKeyModal}>Get New Key</Button></Col>
        <Col><Button className="primaryButton" size="sm" variant="primary" type="submit">
          Retrieve
        </Button>
        </Col>
        
        </Row>
      </Form>

      </Container>
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
    var key = this.props.getKey();
    var re = /[0-9A-Fa-f]{64}/g; // Hexadecimal regex expression

    if(key.length !== 64){ // Checks key is of right length, otherwise don't try and encrypt (encryption with wrong key length causes error)
      this.props.showModal(false, "Failure!", "Key is the wrong length, please use a valid key.", "OK", this.props.closeModal)
    }
    else if(!re.test(key)){
      this.props.showModal(false, "Failure!", "Key must be hexadecimal, please use a valid key.", "OK", this.props.closeModal)
    }
    else{
      var encPref = encryptPreferences(prefs,key);
      var success = await this.props.contract.methods.setPreferences(encPref,hashKey(this.props.getKey())).send({from: this.props.address});
      if (success){
        this.props.showModal(false, "Success!", "Preferences stored under this key.", "OK", this.props.closeModal)
      }
    }
  }

  render(){
    return(
      <Container>
            <h3>Define Your Preferences</h3>
              <Form onSubmit={this.onSubmit}>
                <label>
                  Spatial:
                  </label>
                  <Form.Select size="lg" className="dimensionInput" as="select" id="spatial" value={this.state.spatial} onChange={this.handleChange}>
                    <option value="0">0. No Information</option>
                    <option value="1">1. Aggregation</option>
                    <option value="2">2. Obfuscation</option>
                    <option value="3">3. Regulation</option>
                    <option value="4">4. Full Information</option>
                  </Form.Select>
                
                
                <label>
                  Identity:
                  </label>
                  <Form.Select size="lg" className="dimensionInput" as="select" id="identity" value={this.state.identity} onChange={this.handleChange}>
                    <option value="0">0. No Information</option>
                    <option value="1">1. Aggregation</option>
                    <option value="2">2. Obfuscation</option>
                    <option value="3">3. Regulation</option>
                    <option value="4">4. Full Information</option>
                  </Form.Select>
              
                
                <label>
                  Temporal:
                </label>
                  <Form.Select size="lg" className="dimensionInput" as="select" id="temporal" value={this.state.temporal} onChange={this.handleChange}>
                    <option value="0">0. No Information</option>
                    <option value="1">1. Aggregation</option>
                    <option value="2">2. Obfuscation</option>
                    <option value="3">3. Regulation</option>
                    <option value="4">4. Full Information</option>
                  </Form.Select>
      
                
                <label>
                  Activity:
                </label>
                  <Form.Select size="lg" className="dimensionInput" as="select" id="activity" value={this.state.activity} onChange={this.handleChange}>
                    <option value="0">0. No Information</option>
                    <option value="1">1. Aggregation</option>
                    <option value="2">2. Obfuscation</option>
                    <option value="3">3. Regulation</option>
                    <option value="4">4. Full Information</option>
                  </Form.Select>

                <Button className="submitButton" size="lg" variant="primary" type="submit">
                    Submit
                </Button>
              </Form>
      </Container>
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
    this.onRemoveAddress = this.onRemoveAddress.bind(this);
    this.addAddressModal = this.addAddressModal.bind(this);
    this.removeAddressModal = this.removeAddressModal.bind(this);
  }

  updateApprovedAddresses(newApprovedAddresses){ // Updates approved addresses with a new list of approved addresses(called externally)
    this.setState({approvedAddresses: newApprovedAddresses});
    this.setState({selectedAddress: this.state.approvedAddresses[0]});
  }

  handleNewAddressChange(event){
    event.preventDefault();
    this.setState({newAddress: event.target.value}, this.newAddressError);
  }

  handleRemoveAddressChange(event){
    event.preventDefault();
    this.setState({selectedAddress: event.target.value});
  }

  async onAddAddress(){
    this.props.closeModal();
    try{
      var retrPref = await this.props.contract.methods.getPreferences(this.props.address, hashKey(this.props.getKey())).call({from: this.props.address}); // Attempts to retrieve preferences for this address + key combo to see if there's anything to delete
      if((web3.utils.isAddress(this.state.newAddress)) && !(this.state.approvedAddresses.includes(this.state.newAddress)) && !(this.state.newAddress === this.props.address)){
        var success = await this.props.contract.methods.addApprovedAddress(this.state.newAddress,hashKey(this.props.getKey())).send({from: this.props.address});
        if(success){
          this.setState({newAddress: ''});
          this.getNewAddressList();
          this.props.showModal(false, "Success!", "Approved address added.", "OK", this.props.closeModal);
        }
      }
    }
  
    catch(e){
      if(!(e.code === 4001)){ //Error code for user cancelling MetaMask tranasction
        this.props.showModal(false, "Failure!", "No preferences found for this key. Please set some preferences before adding approved addresses.", "OK", this.props.closeModal);
      }
    }
    
  }


  newAddressError(){
    const newAddressInput = document.querySelector("[name=newAddressInput]");

    if(!(web3.utils.isAddress(this.state.newAddress))){ // Input address must be a valid web3 address
      newAddressInput.setCustomValidity("Not an address");
      
    }
    else if(this.state.newAddress === this.props.address){ // Input address can't be the user's address
      newAddressInput.setCustomValidity("Can't add your own address");
    }
    else if(this.state.approvedAddresses.includes(this.state.newAddress)){ // Input address can't be a duplicate of an already approved address
      newAddressInput.setCustomValidity("Address already approved");
    }
    else{
      newAddressInput.setCustomValidity(""); // No warning for valid address
    }

  }

  async onRemoveAddress(){
    this.props.closeModal();
    var success = await this.props.contract.methods.removeApprovedAddress(this.state.selectedAddress, hashKey(this.props.getKey())).send({from: this.props.address});
    if(success){
      this.getNewAddressList();
      this.props.showModal(false, "Success!", "Approved address removed.", "OK", this.props.closeModal) 
    }
    
  }

  async getNewAddressList(){
    var newApprovedAddresses = await this.props.contract.methods.getApprovedAddresses(hashKey(this.props.getKey())).call({from:this.props.address });
    this.setState({approvedAddresses: newApprovedAddresses }); 
    this.setState({selectedAddress: this.state.approvedAddresses[0]});
  }

  addAddressModal(event){
    event.preventDefault();
    this.props.showModal(true, "Are you sure you want to add this approved address?", "Adding this approved address will allow these preferences to be retrieved by the user at this address.", "Proceed", this.onAddAddress);
  }

  removeAddressModal(event){
    event.preventDefault();
    if(web3.utils.isAddress(this.state.selectedAddress)){
      this.props.showModal(true, "Are you sure you want to remove this approved address?", "Once removed this address will no longer be able to retrieve these preferences.", "Proceed", this.onRemoveAddress);
    }
  }

  render(){
    let addressList = this.state.approvedAddresses.length > 0 // If there is an approved address
    && this.state.approvedAddresses.map((address) => {
     // Iterate through the approved addresses and map them to a select option for the drop-down
      return(
        <option key={address} value={address}>{address}</option>
      )

    }, this);

    return(
      <Container>
        <h3>Approved Addresses</h3>
        <Form onSubmit={this.removeAddressModal}>
          <label>
            Approved Addresses:
            <Form.Select as="select" className="select" size="lg"  id="approvedAddressSelect" value={this.state.selectedAddress} onChange={this.handleRemoveAddressChange}>
              {addressList}
              </Form.Select>
              <Button className="dangerButton" size="lg" variant="danger" type="submit">
                    Remove this address
                </Button>
          </label>
        </Form>
        
        <Form className="newAddressForm" onSubmit={this.addAddressModal}>
        <label>
          Add an Approved Address:
          <Form.Control className="select" type="text" size="lg" placeholder="Enter new address to approve" value={this.state.newAddress} onChange={this.handleNewAddressChange}></Form.Control>
        
      
          <Button className="primaryButton" size="lg" variant="primary" type="submit" id="newAddressInput" name="newAddressInput">
                    Add new address
          </Button>
        </label>
      </Form>
      </Container>
    );
  }
}

class DeleteAllPreferences extends Component{
  constructor(props){
    super(props);

    this.onDeleteAllPreferences = this.onDeleteAllPreferences.bind(this);
    this.deleteAllModal = this.deleteAllModal.bind(this);
  }

  async onDeleteAllPreferences(){
    this.props.closeModal();
    try{
      var success = await this.props.contract.methods.deleteAllPreferences().send({from: this.props.address});

      if(success){
        this.props.setKey(''); // Clears secret key input after preferences deleted
        this.props.setPref('0000'); // Resets preference form back to default
        this.props.showModal(false, "Success!", "All preferences deleted for this account..", "OK", this.props.closeModal);
      }
      else{
        this.props.showModal(false, "Failure!", "Something went wrong.", "OK", this.props.closeModal);
      }
    }
    catch(e){
      if(!(e.code === 4001)){ //Error code for user cancelling MetaMask tranasction
        this.props.showModal(false, "Failure!", "No preferences found, nothing to delete.", "OK", this.props.closeModal);
      }
    }


  }

  deleteAllModal(){
    this.props.showModal(true, "Are you sure you want to delete ALL your preferences?", "Proceeding will delete all preferences under all keys attached to your account. Once deleted you will not be able to get these preferences back. This is an emergency measure.", "Proceed", this.onDeleteAllPreferences);
  }
  render(){
    return(
      <Container>
        <Button className="dangerButton" size="sm" variant="danger" onClick={this.deleteAllModal}>
            Delete All Preferences
        </Button>
      </Container>
    );
  }
}

export default App;