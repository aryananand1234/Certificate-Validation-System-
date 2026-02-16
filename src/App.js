import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Alert, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Home from './components/Home';
import AddCertificate from './components/AddCertificate';
import ViewCertificate from './components/ViewCertificate';
import AdminColleges from './components/AdminColleges';
import Web3 from 'web3';
import {
  contractAddress,
  contractABI,
  targetNetworkId,
  targetNetworkName,
  eventBlockLookback
} from './config';

class App extends Component {
  providerListenersAttached = false;
  mounted = false;
  state = {
    account: '',
    contract: null,
    web3: null,
    connectionStatus: 'idle',
    connectionError: '',
    networkId: null,
    networkName: '',
    recentCertificates: [],
    collegeEvents: [],
    isFetchingEvents: false
  };

  componentDidMount() {
    this.mounted = true;
    this.initialize();
  }

  componentWillUnmount() {
    this.mounted = false;
    if (window.ethereum && this.providerListenersAttached) {
      window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', this.handleChainChanged);
    }
  }

  safeSetState = (nextState, cb) => {
    if (this.mounted) {
      this.setState(nextState, cb);
    }
  };

  initialize = async () => {
    try {
      this.safeSetState({ connectionStatus: 'connecting', connectionError: '' });
      await this.loadWeb3();
      await this.loadBlockchainData();
    } catch (error) {
      this.safeSetState({
        connectionStatus: 'error',
        connectionError: error.message || 'Failed to connect to wallet.'
      });
    }
  };

  loadWeb3 = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      window.web3 = web3;
      this.safeSetState({ web3 });
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.attachProviderListeners();
      return;
    }

    if (window.web3) {
      const web3 = new Web3(window.web3.currentProvider);
      window.web3 = web3;
      this.safeSetState({ web3 });
      return;
    }

    throw new Error('Non-Ethereum browser detected. Please install MetaMask.');
  };

  attachProviderListeners = () => {
    if (!window.ethereum || this.providerListenersAttached) {
      return;
    }

    window.ethereum.on('accountsChanged', this.handleAccountsChanged);
    window.ethereum.on('chainChanged', this.handleChainChanged);
    this.providerListenersAttached = true;
  };

  handleAccountsChanged = (accounts) => {
    if (!accounts || !accounts.length) {
      this.safeSetState({
        account: '',
        contract: null,
        connectionStatus: 'disconnected'
      });
      return;
    }

    this.safeSetState({ account: accounts[0] }, () => this.refreshEventData());
  };

  handleChainChanged = () => {
    this.initialize();
  };

  loadBlockchainData = async () => {
    const web3 = this.state.web3 || window.web3;
    if (!web3) {
      throw new Error('Web3 provider not detected. Connect MetaMask and refresh.');
    }

    const accounts = await web3.eth.getAccounts();
    if (!accounts || !accounts.length) {
      throw new Error('No Ethereum accounts found. Unlock MetaMask and try again.');
    }

    const networkId = await web3.eth.net.getId();
    const networkName = this.resolveNetworkName(networkId);
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    this.safeSetState(
      {
        account: accounts[0],
        contract,
        web3,
        networkId,
        networkName,
        connectionStatus: 'connected'
      },
      () => this.refreshEventData(contract)
    );
  };

  resolveNetworkName = (networkId) => {
    const mapping = {
      1: 'Ethereum Mainnet',
      3: 'Ropsten Test Network',
      4: 'Rinkeby Test Network',
      5: 'Goerli Test Network',
      42: 'Kovan Test Network',
      11155111: 'Sepolia Test Network'
    };

    return mapping[networkId] || `Chain ID ${networkId}`;
  };

  refreshEventData = async (contractInstance) => {
    const contract = contractInstance || this.state.contract;
    const web3 = this.state.web3 || window.web3;
    if (!contract || !web3) {
      return;
    }

    this.safeSetState({ isFetchingEvents: true });

    try {
      const latestBlock = await web3.eth.getBlockNumber();
      const fromBlock = Math.max(latestBlock - (eventBlockLookback || 5000), 0);

      const [certificateEvents, collegeEvents] = await Promise.all([
        contract.getPastEvents('CertificateAdded', {
          fromBlock,
          toBlock: 'latest'
        }),
        contract.getPastEvents('CollegeAdded', {
          fromBlock,
          toBlock: 'latest'
        })
      ]);

      const normalizedCertificates = certificateEvents
        .map((event) => ({
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          student: event.returnValues.student,
          fname: event.returnValues.fname,
          lname: event.returnValues.lname,
          course: event.returnValues.course
        }))
        .sort((a, b) => b.blockNumber - a.blockNumber)
        .slice(0, 10);

      const normalizedColleges = collegeEvents
        .map((event) => ({
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          collegeAddress: event.returnValues.collegeAddress,
          name: event.returnValues.name
        }))
        .sort((a, b) => b.blockNumber - a.blockNumber)
        .slice(0, 10);

      this.safeSetState({
        recentCertificates: normalizedCertificates,
        collegeEvents: normalizedColleges,
        isFetchingEvents: false
      });
    } catch (error) {
      this.safeSetState({
        isFetchingEvents: false,
        connectionError: error.message || 'Unable to load blockchain events.'
      });
    }
  };

  renderConnectionBanner = () => {
    const { connectionStatus, connectionError, networkId, networkName } = this.state;
    const networkMismatch =
      targetNetworkId && networkId && Number(networkId) !== Number(targetNetworkId);

    if (networkMismatch) {
      return (
        <Alert variant="warning" className="mt-3">
          Connected to {networkName}. Switch to {targetNetworkName} to interact with the deployed
          contract.
        </Alert>
      );
    }

    if (connectionStatus === 'error' && connectionError) {
      return (
        <Alert variant="danger" className="mt-3">
          {connectionError}
        </Alert>
      );
    }

    return null;
  };

  renderAccountSummary = () => {
    const { account, connectionStatus, networkName } = this.state;
    const shortAccount = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not connected';

    return (
      <div className="account-info mb-3">
        <div>Wallet: {shortAccount}</div>
        <div>
          Status:{' '}
          <Badge variant="light" className="text-uppercase">
            {connectionStatus}
          </Badge>
        </div>
        <div>Network: {networkName || 'Unknown'}</div>
      </div>
    );
  };

  render() {
    const { recentCertificates, collegeEvents, isFetchingEvents } = this.state;
    const networkMismatch =
      targetNetworkId &&
      this.state.networkId &&
      Number(this.state.networkId) !== Number(targetNetworkId);

    return (
      <Router>
        <div className="App">
          <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
              <Navbar.Brand as={Link} to="/">
                Certificate Validation System
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="ml-auto">
                  <Nav.Link as={Link} to="/">
                    Home
                  </Nav.Link>
                  <Nav.Link as={Link} to="/add">
                    Add Certificate
                  </Nav.Link>
                  <Nav.Link as={Link} to="/view">
                    View Certificate
                  </Nav.Link>
                  <Nav.Link as={Link} to="/admin">
                    Manage Colleges
                  </Nav.Link>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>

          <Container className="mt-4">
            {this.renderAccountSummary()}
            {this.renderConnectionBanner()}

            <Switch>
              <Route
                exact
                path="/"
                render={() => (
                  <Home
                    recentCertificates={recentCertificates}
                    isFetchingEvents={isFetchingEvents}
                    expectedNetworkName={targetNetworkName}
                  />
                )}
              />
              <Route
                path="/add"
                render={() => (
                  <AddCertificate
                    contract={this.state.contract}
                    account={this.state.account}
                    web3={this.state.web3}
                    networkMismatch={networkMismatch}
                  />
                )}
              />
              <Route
                path="/view"
                render={() => (
                  <ViewCertificate
                    contract={this.state.contract}
                    web3={this.state.web3}
                    networkMismatch={networkMismatch}
                  />
                )}
              />
              <Route
                path="/admin"
                render={() => (
                  <AdminColleges
                    contract={this.state.contract}
                    account={this.state.account}
                    networkMismatch={networkMismatch}
                    expectedNetworkName={targetNetworkName}
                    collegeEvents={collegeEvents}
                  />
                )}
              />
            </Switch>
          </Container>
        </div>
      </Router>
    );
  }
}

export default App;
