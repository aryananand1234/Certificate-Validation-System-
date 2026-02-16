/**
 * Main Application Component - Enhanced with Web3Context and Modern Routing
 */
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Context
import { Web3Provider, Web3Context } from './context/Web3Context';

// Pages & Components
import ModernHome from './components/pages/ModernHome';
import AdminDashboard from './components/dashboards/AdminDashboard';
import CollegeDashboard from './components/dashboards/CollegeDashboard';
import EnhancedCertificateViewer from './components/certificates/EnhancedCertificateViewer';
import Loader from './components/common/Loader';

// Utils
import { shortenAddress } from './utils/formatters';
import { CONNECTION_STATUS } from './utils/constants';

class AppContent extends Component {
  static contextType = Web3Context;

  renderUserMenu() {
    const web3Context = this.context;
    const { account, isOwner, userRole, balance } = web3Context;

    if (!account) {
      return null;
    }

    let roleLabel = 'Public User';
    if (isOwner) roleLabel = 'Admin';
    else if (userRole === 'college') roleLabel = 'College';

    return (
      <Dropdown alignRight className="user-menu">
        <Dropdown.Toggle variant="outline-light" id="user-dropdown">
          <span className="user-address">{shortenAddress(account)}</span>
        </Dropdown.Toggle>

        <Dropdown.Menu className="dropdown-menu-custom">
          <Dropdown.Header>
            <div><strong>Role:</strong> {roleLabel}</div>
            <div className="small text-muted">{account}</div>
          </Dropdown.Header>
          <Dropdown.Divider />
          <Dropdown.Item disabled>
            Balance: {parseFloat(balance).toFixed(4)} ETH
          </Dropdown.Item>
          <Dropdown.Divider />
          {isOwner && (
            <Dropdown.Item as={Link} to="/admin">
              Admin Dashboard
            </Dropdown.Item>
          )}
          {userRole === 'college' && (
            <Dropdown.Item as={Link} to="/college">
              College Dashboard
            </Dropdown.Item>
          )}
          <Dropdown.Item as={Link} to="/verify">
            Verify Certificate
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  render() {
    const web3Context = this.context;

    if (web3Context.connectionStatus === CONNECTION_STATUS.CONNECTING) {
      return <Loader fullPage text="Connecting to wallet..." />;
    }

    return (
      <Router>
        <div className="App">
          {/* Navigation */}
          <Navbar bg="dark" variant="dark" expand="lg" className="navbar-custom">
            <Container>
              <Navbar.Brand as={Link} to="/" className="brand-logo">
                <span className="brand-icon">🎓</span>
                <span className="brand-text">CertiChain</span>
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="main-navbar" />
              <Navbar.Collapse id="main-navbar">
                <Nav className="ml-auto align-items-lg-center">
                  <Nav.Link as={Link} to="/" className="nav-link-custom">
                    Home
                  </Nav.Link>
                  <Nav.Link as={Link} to="/verify" className="nav-link-custom">
                    Verify
                  </Nav.Link>
                  {web3Context.isOwner && (
                    <Nav.Link as={Link} to="/admin" className="nav-link-custom">
                      Admin
                    </Nav.Link>
                  )}
                  {web3Context.userRole === 'college' && (
                    <Nav.Link as={Link} to="/college" className="nav-link-custom">
                      Dashboard
                    </Nav.Link>
                  )}
                  {web3Context.account ? (
                    this.renderUserMenu()
                  ) : (
                    <button
                      className="btn btn-connect"
                      onClick={web3Context.initializeWeb3}
                    >
                      Connect Wallet
                    </button>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>

          {/* Main Content */}
          <div className="main-content">
            <Switch>
              <Route exact path="/" component={ModernHome} />
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/college" component={CollegeDashboard} />
              <Route path="/verify/:address?" component={EnhancedCertificateViewer} />
              <Route path="*">
                <Container className="mt-5 text-center">
                  <h2>404 - Page Not Found</h2>
                  <p>
                    <Link to="/">Go to Home</Link>
                  </p>
                </Container>
              </Route>
            </Switch>
          </div>

          {/* Footer */}
          <footer className="app-footer">
            <Container>
              <div className="footer-content">
                <div className="footer-left">
                  <span className="brand-icon">🎓</span>
                  <span>CertiChain © 2026</span>
                </div>
                <div className="footer-right">
                  <span className="footer-link">Powered by Blockchain</span>
                  <span className="footer-divider">•</span>
                  <span className="footer-link">Secure & Transparent</span>
                </div>
              </div>
            </Container>
          </footer>
        </div>
      </Router>
    );
  }
}

// Main App with Context Provider
class App extends Component {
  render() {
    return (
      <Web3Provider>
        <AppContent />
      </Web3Provider>
    );
  }
}

export default App;
