/**
 * Network Switcher Component
 * Helps users switch to the correct network with one click
 */
import React, { Component } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { targetChainId, targetNetworkName, networkConfig } from '../../config';
import './NetworkSwitcher.css';

class NetworkSwitcher extends Component {
  state = {
    switching: false,
    error: ''
  };

  handleSwitchNetwork = async () => {
    this.setState({ switching: true, error: '' });

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not detected');
      }

      // Try to switch to the target network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }]
      });

      this.setState({ switching: false });
    } catch (switchError) {
      // Error code 4902 means the network isn't added to MetaMask
      if (switchError.code === 4902) {
        try {
          // Add the network to MetaMask
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig]
          });
          this.setState({ switching: false });
        } catch (addError) {
          this.setState({
            switching: false,
            error: 'Failed to add network. Please add it manually in MetaMask.'
          });
        }
      } else {
        this.setState({
          switching: false,
          error: switchError.message || 'Failed to switch network'
        });
      }
    }
  };

  render() {
    const { switching, error } = this.state;

    return (
      <Alert variant="warning" className="network-switcher">
        <Alert.Heading className="h6">Wrong Network</Alert.Heading>
        <p className="mb-3">
          Please switch to <strong>{targetNetworkName}</strong> to use this application.
        </p>
        <Button
          variant="warning"
          size="sm"
          onClick={this.handleSwitchNetwork}
          disabled={switching}
        >
          {switching ? 'Switching...' : `Switch to ${targetNetworkName}`}
        </Button>
        {error && <p className="text-danger mt-2 mb-0 small">{error}</p>}
      </Alert>
    );
  }
}

export default NetworkSwitcher;
