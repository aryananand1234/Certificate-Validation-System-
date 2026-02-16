/**
 * Web3 Context - Centralized state management for wallet and blockchain interactions
 */
import React, { createContext, Component } from 'react';
import Web3 from 'web3';
import { contractAddress, contractABI } from '../config';
import { CONNECTION_STATUS, ERROR_MESSAGES } from '../utils/constants';

export const Web3Context = createContext();

export class Web3Provider extends Component {
  state = {
    web3: null,
    account: '',
    contract: null,
    networkId: null,
    networkName: '',
    balance: '0',
    connectionStatus: CONNECTION_STATUS.IDLE,
    connectionError: '',
    userRole: null,
    isOwner: false
  };

  componentDidMount() {
    this.mounted = true;
    this.initializeWeb3();
  }

  componentWillUnmount() {
    this.mounted = false;
    this.removeProviderListeners();
  }

  safeSetState = (newState, callback) => {
    if (this.mounted) {
      this.setState(newState, callback);
    }
  };

  initializeWeb3 = async () => {
    try {
      this.safeSetState({ connectionStatus: CONNECTION_STATUS.CONNECTING });
      
      if (!window.ethereum) {
        throw new Error(ERROR_MESSAGES.NO_METAMASK);
      }

      const web3 = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error(ERROR_MESSAGES.NO_ACCOUNTS);
      }

      const networkId = await web3.eth.net.getId();
      const networkName = this.resolveNetworkName(networkId);
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const balance = await web3.eth.getBalance(accounts[0]);

      // Check if user is contract owner
      let isOwner = false;
      try {
        const owner = await contract.methods.owner().call();
        isOwner = owner.toLowerCase() === accounts[0].toLowerCase();
      } catch (err) {
        console.warn('Could not fetch contract owner:', err);
      }

      // Determine user role
      const userRole = await this.determineUserRole(contract, accounts[0], isOwner);

      this.safeSetState({
        web3,
        account: accounts[0],
        contract,
        networkId,
        networkName,
        balance: web3.utils.fromWei(balance, 'ether'),
        connectionStatus: CONNECTION_STATUS.CONNECTED,
        connectionError: '',
        userRole,
        isOwner
      });

      this.attachProviderListeners();
    } catch (error) {
      this.safeSetState({
        connectionStatus: CONNECTION_STATUS.ERROR,
        connectionError: error.message || 'Failed to connect to wallet'
      });
    }
  };

  determineUserRole = async (contract, account, isOwner) => {
    if (isOwner) return 'admin';

    try {
      const isCollege = await contract.methods.checkcoll(account).call();
      if (isCollege) return 'college';
    } catch (err) {
      console.warn('Could not check college status:', err);
    }

    return 'public';
  };

  resolveNetworkName = (networkId) => {
    const networks = {
      1: 'Ethereum Mainnet',
      11155111: 'Sepolia Testnet',
      3: 'Ropsten (Deprecated)',
      4: 'Rinkeby (Deprecated)',
      5: 'Goerli Testnet',
      137: 'Polygon Mainnet',
      80001: 'Mumbai Testnet'
    };
    return networks[networkId] || `Unknown Network (${networkId})`;
  };

  attachProviderListeners = () => {
    if (!window.ethereum || this.listenersAttached) return;

    window.ethereum.on('accountsChanged', this.handleAccountsChanged);
    window.ethereum.on('chainChanged', this.handleChainChanged);
    this.listenersAttached = true;
  };

  removeProviderListeners = () => {
    if (!window.ethereum || !this.listenersAttached) return;

    window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged);
    window.ethereum.removeListener('chainChanged', this.handleChainChanged);
    this.listenersAttached = false;
  };

  handleAccountsChanged = (accounts) => {
    if (!accounts || accounts.length === 0) {
      this.safeSetState({
        account: '',
        connectionStatus: CONNECTION_STATUS.DISCONNECTED,
        userRole: null,
        isOwner: false
      });
    } else {
      this.initializeWeb3();
    }
  };

  handleChainChanged = () => {
    this.initializeWeb3();
  };

  switchNetwork = async (targetChainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }]
      });
      return true;
    } catch (error) {
      console.error('Failed to switch network:', error);
      return false;
    }
  };

  render() {
    const contextValue = {
      ...this.state,
      initializeWeb3: this.initializeWeb3,
      switchNetwork: this.switchNetwork
    };

    return (
      <Web3Context.Provider value={contextValue}>
        {this.props.children}
      </Web3Context.Provider>
    );
  }
}

// HOC to inject Web3 context into components
export const withWeb3 = (Component) => {
  return (props) => (
    <Web3Context.Consumer>
      {(context) => <Component {...props} web3Context={context} />}
    </Web3Context.Consumer>
  );
};
