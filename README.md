This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### `Steps`

Install the [Metamask extension](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en) in your chrome browser.<br>
After logging in select **Ropsten Test Network** and don't forget to add some test Faucet by clicking on **Deposit**


Copy the text from **[smart_contract.txt](smart_contract.txt)**

Paste this in **Remix IDE**.<br>

> The contract now stores certificates per student wallet address and returns the full name and course details during verification. Make sure you redeploy this updated contract and replace the address inside `src/config.js`. Update the `targetNetworkId`/`targetNetworkName` exports in the same file if you deploy anywhere other than Ropsten.

You should select **Injected Web3** as an Environent inside the RemixIde.<br>

Then Compile and Deploy your smart contract.<br>

Copy the **Address** of deployed contract.<br> 
And replace the address value in **[src/config.js](src/config.js)** with your contract address.<br>

(We have to do above steps so that you will be owner of the smart contract and now you can add colleges using the `addCollege` function in Remix IDE after deploying the contract).<br>

### New UI capabilities

- **Wallet & network visibility:** The navbar shows the connected wallet, connection status, and current chain with clear warnings when MetaMask is pointed at the wrong network.
- **Manage Colleges route:** Contract owners can approve new colleges directly inside the dApp via the *Manage Colleges* page and immediately see the emitted `CollegeAdded` events.
- **Live certificate feed:** The home screen now displays the latest `CertificateAdded` events pulled from the last few thousand blocks so you can verify recent issuances at a glance.
- **Printable verifications:** Successful lookups expose a *Print / Save* action (powered by `print-js`) for exporting a PDF-ready certificate summary.

### Using the dApp

1. **Adding a certificate:** Navigate to *Add Certificate*, enter the student's wallet address along with their first name, last name, and course, then submit. Only approved colleges (added via the smart contract) can store certificates. The submit button stays disabled until your wallet is connected and the chain matches the `targetNetworkId` in `src/config.js`.
2. **Verifying a certificate:** Go to *View Certificate*, enter the same student wallet address, and the dApp will pull the stored first name, last name, and course from the blockchain. Click *Print / Save* after a successful lookup to export a shareable confirmation.
3. **Managing colleges:** Open *Manage Colleges*, connect with the wallet that deployed the contract, and call `addCollege` without leaving the UI. The page includes a log of the most recent college additions fetched from on-chain events for easy auditing.


In the project directory, you can run:

### `npm install`

This will install all the dependencies

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

