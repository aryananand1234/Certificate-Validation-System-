# 🎓 Certificate Validation System

A modern blockchain-based certificate validation platform built with React, Solidity, and Web3. Features role-based access control, certificate revocation, QR code verification, and responsive design.

## 📸 Screenshots

### Home Landing Page
![Home Landing Page](Screenshots/home-landing.png.png)

### Wallet Connection
![Wallet Connect](Screenshots/wallet-connect.png.png)

### Blockchain Features
![Blockchain Features](Screenshots/blockchain-features.png.png)

## ✨ Features

### 🔐 Security & Access Control
- **Role-Based System**: Admin, College, Student, and Public user roles
- **Certificate Revocation**: Authorized users can revoke certificates with reasons
- **Enhanced Smart Contract**: Solidity 0.8.0 with comprehensive access modifiers
- **Ownership Transfer**: Admin can transfer contract ownership

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first, works on all devices
- **Modern Landing Page**: Hero section, features, how-it-works flow
- **Role-Based Dashboards**: Customized views for Admins and Colleges
- **Enhanced Navigation**: User dropdown menu with balance and role display
- **Professional Styling**: Gradient backgrounds, smooth animations, modern cards

### 📱 Advanced Features
- **QR Code Generation**: Each certificate gets a unique QR code
- **Certificate Printing**: Print-ready certificate templates
- **Network Switcher**: One-click network switching in MetaMask
- **Event History**: Real-time blockchain event tracking
- **Copy to Clipboard**: Easy address copying functionality
- **Live Certificate Feed**: Real-time display of latest certificate issuances
- **Printable Verifications**: Export PDF-ready certificate summaries

### ⛓️ Blockchain Support
- **Sepolia Testnet**: Modern testnet (replaces deprecated Ropsten)
- **Polygon Support**: Ready for Polygon/Mumbai deployment
- **Better MetaMask Integration**: Handle account/network changes gracefully
- **Enhanced Error Handling**: User-friendly error messages

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- [MetaMask browser extension](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en)
- Sepolia testnet ETH ([Get from faucet](https://sepoliafaucet.com/))

### Installation

1. **Clone and Install**
   ```bash
   git clone https://github.com/aryananand1234/Certificate-Validation-System-.git
   cd Certificate-Validation-System-main
   npm install
   ```

2. **Deploy Smart Contract**
   - Open [Remix IDE](https://remix.ethereum.org/)
   - Copy content from **[smart_contract.txt](smart_contract.txt)** or `contracts/CertificateValidation.sol`
   - Paste in Remix IDE
   - Select compiler version: `0.8.0`
   - Select environment: **"Injected Provider - MetaMask"**
   - Make sure MetaMask is on **Sepolia Testnet** (or your preferred network)
   - Click **"Deploy"**
   - Copy the deployed contract address

3. **Configure Application**
   
   Edit **[src/config.js](src/config.js)** and replace with your deployed contract address:
   ```javascript
   export const contractAddress = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
   export const targetNetworkId = 11155111; // Sepolia
   export const targetNetworkName = 'Sepolia Testnet';
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```
   
   Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🎯 Usage Guide

### For Admins (Contract Owners)

1. **Connect Wallet**: Use the wallet that deployed the contract
2. **Access Admin Dashboard**: Navigate to `/admin` or use *Manage Colleges* page
3. **Add Colleges**:
   - Enter college wallet address
   - Enter college name
   - Click "Add College"
   - View emitted `CollegeAdded` events for auditing
4. **Monitor Activity**: View stats and recent certificate events

### For Colleges

1. **Get Approved**: Contact admin to add your wallet address via `addCollege` function
2. **Connect Wallet**: Connect your approved wallet
3. **Access College Dashboard**: Navigate to `/college` or *Add Certificate* page
4. **Issue Certificates**:
   - Navigate to *Add Certificate*
   - Enter student's wallet address
   - Fill in first name, last name, and course
   - Click "Issue Certificate" (button enabled when wallet connected and on correct network)
5. **View History**: See all certificates you've issued in the certificate feed

### For Public Users

1. **Verify Certificates**: Navigate to *View Certificate*
2. **Enter Address**: Input student's wallet address
3. **View Results**:
   - See certificate details (full name and course)
   - Check revocation status
   - Scan QR code
   - Use *Print / Save* action to export PDF-ready certificate summary

### Revoking Certificates

**Who can revoke**: Admin or the college that issued the certificate

1. Go to certificate verification page
2. Search for the certificate
3. Click "Revoke Certificate"
4. Enter revocation reason
5. Confirm transaction in MetaMask

## 🔧 Configuration Options

### Network Configuration

**Sepolia Testnet (Recommended)**:
```javascript
targetNetworkId: 11155111
targetChainId: '0xaa36a7'
```

**Mumbai (Polygon Testnet)**:
```javascript
targetNetworkId: 80001
targetChainId: '0x13881'
```

**Polygon Mainnet**:
```javascript
targetNetworkId: 137
targetChainId: '0x89'
```

## 🔐 Smart Contract Functions

### Admin Functions
- `addCollege(address, name)` - Add approved college
- `removeCollege(address)` - Remove college approval
- `transferOwnership(address)` - Transfer contract ownership
- `revokeCertificate(studentAddress, reason)` - Revoke any certificate

### College Functions
- `issueCertificate(student, firstName, lastName, course)` - Issue certificate
- `revokeCertificate(studentAddress, reason)` - Revoke own certificate

### Public Functions
- `viewCertificate(student)` - View certificate details
- `isApprovedCollege(address)` - Check college status
- `getCollegeDetails(address)` - Get college info
- `getTotalCertificates()` - Get total count
- `getTotalColleges()` - Get college count

## 📁 Project Structure

```
Certificate-Validation-System/
├── contracts/
│   └── CertificateValidation.sol      # Enhanced smart contract
├── src/
│   ├── components/
│   │   ├── common/                    # Reusable components
│   │   │   ├── Loader.js
│   │   │   └── NetworkSwitcher.js
│   │   ├── dashboards/               # Role-based dashboards
│   │   │   ├── AdminDashboard.js
│   │   │   └── CollegeDashboard.js
│   │   ├── certificates/             # Certificate components
│   │   │   └── EnhancedCertificateViewer.js
│   │   ├── pages/                    # Page components
│   │   │   └── ModernHome.js
│   │   ├── AddCertificate.js
│   │   ├── AdminColleges.js
│   │   ├── CertificateFeed.js
│   │   ├── Home.js
│   │   └── ViewCertificate.js
│   ├── context/
│   │   └── Web3Context.js            # Web3 state management
│   ├── utils/
│   │   ├── constants.js              # App constants
│   │   └── formatters.js             # Utility functions
│   ├── config.js                     # Contract ABI & config
│   ├── App.js                        # Main App component
│   ├── AppNew.js                     # Enhanced App variant
│   ├── AppEnhanced.css               # Modern global styles
│   └── index.js                      # Entry point
├── build/                            # Production build
├── public/                           # Static assets
├── Screenshots/                      # Project screenshots
├── package.json
├── DEPLOYMENT.md                     # Deployment guide
├── QUICK_START.md                    # Quick start guide
├── README_ENHANCED.md                # Enhanced README
└── smart_contract.txt                # Smart contract code
```

## 🐛 Troubleshooting

### MetaMask Issues
- **Not connecting**: Refresh page and unlock MetaMask
- **Wrong network**: Use network switcher component or manually switch in MetaMask
- **Transaction failing**: Check gas fees and account balance

### Contract Errors
- **"Only owner"**: Connect with the wallet that deployed the contract
- **"Only approved college"**: Ensure your wallet is registered via `addCollege`
- **"Certificate already exists"**: Use a different student wallet address

### UI Issues
- **Submit button disabled**: Ensure wallet is connected and on correct network
- **Data not loading**: Verify contract address in `src/config.js`
- **Events not showing**: Check event block lookback settings

## 🚢 Deployment

### Build Production Bundle
```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

### Deploy to Hosting

**Vercel**:
```bash
npm i -g vercel
vercel --prod
```

**Netlify**:
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=build
```

## 📝 License

MIT License - Feel free to use for educational or commercial purposes.

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 🔗 Useful Links

- [Remix IDE](https://remix.ethereum.org/) - Smart contract deployment
- [Sepolia Faucet](https://sepoliafaucet.com/) - Get test ETH
- [MetaMask](https://metamask.io/) - Web3 wallet
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [Solidity Documentation](https://docs.soliditylang.org/)

---

**Built with ❤️ using React, Solidity, and Web3**

*This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).*

