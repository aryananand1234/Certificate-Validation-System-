/**
 * Utility functions for formatting addresses, dates, and other data
 */

/**
 * Shorten Ethereum address for display
 * @param {string} address - Full Ethereum address
 * @param {number} startChars - Characters to show at start (default: 6)
 * @param {number} endChars - Characters to show at end (default: 4)
 * @returns {string} Shortened address
 */
export const shortenAddress = (address, startChars = 6, endChars = 4) => {
  if (!address || address.length < startChars + endChars) {
    return address || '';
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Format timestamp to readable date
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format block number with commas
 * @param {number} blockNumber
 * @returns {string} Formatted block number
 */
export const formatBlockNumber = (blockNumber) => {
  return blockNumber ? blockNumber.toLocaleString() : 'N/A';
};

/**
 * Validate Ethereum address format
 * @param {string} address
 * @returns {boolean}
 */
export const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Copy text to clipboard
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

/**
 * Get explorer URL for transaction
 * @param {string} txHash
 * @param {number} networkId
 * @returns {string}
 */
export const getExplorerUrl = (txHash, networkId) => {
  const explorers = {
    1: 'https://etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    137: 'https://polygonscan.com',
    80001: 'https://mumbai.polygonscan.com'
  };
  
  const baseUrl = explorers[networkId] || 'https://etherscan.io';
  return `${baseUrl}/tx/${txHash}`;
};
