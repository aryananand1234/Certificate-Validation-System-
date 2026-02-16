/**
 * Application constants and enums
 */

// User role definitions
export const USER_ROLES = {
  ADMIN: 'admin',
  COLLEGE: 'college',
  STUDENT: 'student',
  PUBLIC: 'public'
};

// Connection status states
export const CONNECTION_STATUS = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error'
};

// Transaction status
export const TX_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed'
};

// Network configurations
export const NETWORKS = {
  1: {
    name: 'Ethereum Mainnet',
    chainId: '0x1',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    explorer: 'https://etherscan.io',
    symbol: 'ETH'
  },
  11155111: {
    name: 'Sepolia Testnet',
    chainId: '0xaa36a7',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    explorer: 'https://sepolia.etherscan.io',
    symbol: 'SepoliaETH'
  },
  137: {
    name: 'Polygon Mainnet',
    chainId: '0x89',
    rpcUrl: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    symbol: 'MATIC'
  },
  80001: {
    name: 'Mumbai Testnet',
    chainId: '0x13881',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    explorer: 'https://mumbai.polygonscan.com',
    symbol: 'MATIC'
  }
};

// Certificate status
export const CERTIFICATE_STATUS = {
  ACTIVE: 'active',
  REVOKED: 'revoked',
  PENDING: 'pending'
};

// Error messages
export const ERROR_MESSAGES = {
  NO_METAMASK: 'MetaMask not detected. Please install MetaMask extension.',
  NO_ACCOUNTS: 'No accounts found. Please unlock MetaMask.',
  WRONG_NETWORK: 'Please switch to the correct network.',
  CONTRACT_ERROR: 'Smart contract interaction failed.',
  TRANSACTION_REJECTED: 'Transaction was rejected by user.',
  INSUFFICIENT_FUNDS: 'Insufficient funds for transaction.',
  UNAUTHORIZED: 'You are not authorized to perform this action.'
};
