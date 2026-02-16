// Contract Address - Replace with your deployed contract address
export const contractAddress = '0x0000000000000000000000000000000000000000';

// Target network metadata - Using Sepolia (recommended testnet)
export const targetNetworkId = 11155111;
export const targetNetworkName = 'Sepolia Testnet';
export const targetChainId = '0xaa36a7';

// Number of blocks to look back when fetching past events
export const eventBlockLookback = 5000;

// Network RPC URLs (for adding network to MetaMask)
export const networkConfig = {
  chainId: targetChainId,
  chainName: targetNetworkName,
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'SepoliaETH',
    decimals: 18
  },
  rpcUrls: ['https://sepolia.infura.io/v3/'],
  blockExplorerUrls: ['https://sepolia.etherscan.io']
};

// Contract ABI - Updated for enhanced contract with revocation support
// Note: If using the legacy contract, keep the old ABI or update after deploying the new contract
export const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "student", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "firstName", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "lastName", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "course", "type": "string"},
      {"indexed": true, "internalType": "address", "name": "issuer", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "CertificateIssued",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "student", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "revokedBy", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "reason", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "CertificateRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "collegeAddress", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "CollegeAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "collegeAddress", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "CollegeRemoved",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "collegeAddress", "type": "address"},
      {"internalType": "string", "name": "name", "type": "string"}
    ],
    "name": "addCollege",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "student", "type": "address"},
      {"internalType": "string", "name": "firstName", "type": "string"},
      {"internalType": "string", "name": "lastName", "type": "string"},
      {"internalType": "string", "name": "course", "type": "string"}
    ],
    "name": "issueCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "student", "type": "address"},
      {"internalType": "string", "name": "reason", "type": "string"}
    ],
    "name": "revokeCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "collegeAddress", "type": "address"}],
    "name": "removeCollege",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "collegeAddress", "type": "address"}],
    "name": "isApprovedCollege",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "student", "type": "address"}],
    "name": "viewCertificate",
    "outputs": [
      {"internalType": "string", "name": "firstName", "type": "string"},
      {"internalType": "string", "name": "lastName", "type": "string"},
      {"internalType": "string", "name": "course", "type": "string"},
      {"internalType": "address", "name": "issuer", "type": "address"},
      {"internalType": "uint256", "name": "issuedAt", "type": "uint256"},
      {"internalType": "bool", "name": "isRevoked", "type": "bool"},
      {"internalType": "string", "name": "revocationReason", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "collegeAddress", "type": "address"}],
    "name": "getCollegeDetails",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "bool", "name": "isApproved", "type": "bool"},
      {"internalType": "uint256", "name": "registeredAt", "type": "uint256"},
      {"internalType": "uint256", "name": "certificatesIssued", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalColleges",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalCertificates",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllColleges",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
