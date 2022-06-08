# Storing and managing user privacy preferences using blockchain
This repository contains my dissertation project. It is prototype DApp and smart contract which allow a user to store and manage privacy preferences stored on the blockchain. The paper can be read [here](https://github.com/JoelGibson20/SITApreferencesManagement/blob/main/Dissertation%20Paper.pdf).

## What exactly does this mean?
The user accesses the DApp (website) using an ordinary browser with the [**MetaMask**](https://metamask.io/) browser extension. Here they can define privacy preferences using the SITA dimensions described in the paper  [**The SITA principle for location privacy — Conceptual model and architecture**](https://www.researchgate.net/publication/286760053_The_SITA_principle_for_location_privacy_-_Conceptual_model_and_architecture). These preferences are stored AES encrypted on the blockchain, where the user, or others the user approves, can retrieve them.

These preferences are intended to be used by smart building systems. Users share these preferences with the smart building management system and it ensures collected data from its sensors meet the privacy preferences defined by users.

## Technologies
The smart contract is written in [**Solidity**](https://docs.soliditylang.org/en/v0.8.13/), using [**Truffle**](https://trufflesuite.com/truffle/). It is hosted on a test Ethereum blockchain using [**Ganache**](https://trufflesuite.com/ganache/).

The DApp is written in [**JavaScript**](https://www.javascript.com/) using [**React**](https://reactjs.org/), and styled using **CSS**, and [**React-Bootstrap**](https://react-bootstrap.github.io/).

## Running the project
This project requires [**Node Package Manager (NPM)**](https://www.npmjs.com/), and the [**Truffle Suite**](https://trufflesuite.com/).

1. Using **Ganache**, quick-start an Ethereum blockchain.
---
2. In the terminal navigate to `/client`. Then run the command :

   `truffle migrate --reset`

   This will deploy the contract from the   first address in **Ganache**.

---
3. Next run the DApp by running the command:

   `npm run start`

   This will start up the server and deploy the DApp to `localhost:3000`.
---
4. Click on the key icon next to an account in the Accounts list in **Ganache**, and copy the secret key. Open the MetaMask extension and select `import an account`. Paste the secret key and click import. Whilst on the DApp page, click `not connected` next to the account and it will connect to the DApp.

*You can now use the DApp*.

## Navigating the Repository

The contract can be found at:
**`contracts/SITApreferences2.sol`**

The DApp can be found at:
**`client/src/App.js`**

CSS styling can be found in:
**`client/src/App.css`**

Methods used to encrypt, decrypt, hash, and generate keys can be found here:
**`client/src/crypto-methods.js`**

