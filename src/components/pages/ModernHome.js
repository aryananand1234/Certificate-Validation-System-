/**
 * Enhanced Modern Home Page
 */
import React, { Component } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { withWeb3 } from '../../context/Web3Context';
import Loader from '../common/Loader';
import { targetNetworkName } from '../../config';
import './ModernHome.css';

class ModernHome extends Component {
  getDashboardPath = () => {
    const { web3Context } = this.props;
    
    if (web3Context.isOwner) return '/admin';
    if (web3Context.userRole === 'college') return '/college';
    return '/verify';
  };

  getDashboardLabel = () => {
    const { web3Context } = this.props;
    
    if (web3Context.isOwner) return 'Admin Dashboard';
    if (web3Context.userRole === 'college') return 'College Dashboard';
    return 'Verify Certificates';
  };

  render() {
    const { web3Context } = this.props;

    return (
      <div className="modern-home">
        {/* Hero Section */}
        <section className="hero-section">
          <Container>
            <Row className="align-items-center">
              <Col lg={6} className="hero-content">
                <Badge variant="primary" className="hero-badge">Blockchain-Powered</Badge>
                <h1 className="hero-title">
                  Certificate Validation System
                </h1>
                <p className="hero-subtitle">
                  Issue, verify, and manage academic certificates securely on the blockchain. 
                  Tamper-proof, transparent, and instantly verifiable.
                </p>
                <div className="hero-buttons">
                  {web3Context.account ? (
                    <Button
                      as={Link}
                      to={this.getDashboardPath()}
                      variant="primary"
                      size="lg"
                      className="hero-btn"
                    >
                      {this.getDashboardLabel()} →
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      className="hero-btn"
                      onClick={web3Context.initializeWeb3}
                    >
                      Connect Wallet
                    </Button>
                  )}
                  <Button
                    as={Link}
                    to="/verify"
                    variant="outline-light"
                    size="lg"
                    className="hero-btn-outline"
                  >
                    Verify Certificate
                  </Button>
                </div>
                {web3Context.account && (
                  <div className="connection-status">
                    <span className="status-dot"></span>
                    Connected to {web3Context.networkName}
                  </div>
                )}
              </Col>
              <Col lg={6} className="hero-visual">
                <div className="floating-card">
                  <div className="certificate-mockup">
                    <div className="mockup-header"></div>
                    <div className="mockup-line"></div>
                    <div className="mockup-line short"></div>
                    <div className="mockup-badge">✓ Verified</div>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <Container>
            <div className="section-header text-center">
              <h2>Why Choose Blockchain Certificates?</h2>
              <p>Experience the next generation of credential verification</p>
            </div>
            <Row>
              <Col md={4}>
                <Card className="feature-card">
                  <div className="feature-icon">🔒</div>
                  <Card.Body>
                    <Card.Title>Tamper-Proof</Card.Title>
                    <Card.Text>
                      Certificates are cryptographically secured on the blockchain, making them impossible to forge or alter.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="feature-card">
                  <div className="feature-icon">⚡</div>
                  <Card.Body>
                    <Card.Title>Instant Verification</Card.Title>
                    <Card.Text>
                      Verify any certificate in seconds using wallet addresses or QR codes. No waiting, no intermediaries.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="feature-card">
                  <div className="feature-icon">🌍</div>
                  <Card.Body>
                    <Card.Title>Globally Accessible</Card.Title>
                    <Card.Text>
                      Access certificates from anywhere in the world. Truly portable and universally verifiable credentials.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works-section">
          <Container>
            <div className="section-header text-center">
              <h2>How It Works</h2>
              <p>Simple, secure, and transparent process</p>
            </div>
            <Row>
              <Col md={3} className="step">
                <div className="step-number">1</div>
                <h4>Connect Wallet</h4>
                <p>Connect your MetaMask wallet to access the platform</p>
              </Col>
              <Col md={3} className="step">
                <div className="step-number">2</div>
                <h4>Get Approved</h4>
                <p>Colleges get approved by the system administrator</p>
              </Col>
              <Col md={3} className="step">
                <div className="step-number">3</div>
                <h4>Issue Certificates</h4>
                <p>Approved colleges issue certificates to student wallets</p>
              </Col>
              <Col md={4} className="step">
                <div className="step-number">4</div>
                <h4>Verify Instantly</h4>
                <p>Anyone can verify certificates using wallet addresses</p>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Stats Section */}
        {web3Context.account && (
          <section className="stats-section">
            <Container>
              <Row className="text-center">
                <Col md={4}>
                  <div className="stat-box">
                    <div className="stat-icon">🎓</div>
                    <div className="stat-number">—</div>
                    <div className="stat-label">Certificates Issued</div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="stat-box">
                    <div className="stat-icon">🏫</div>
                    <div className="stat-number">—</div>
                    <div className="stat-label">Approved Colleges</div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="stat-box">
                    <div className="stat-icon">✓</div>
                    <div className="stat-number">100%</div>
                    <div className="stat-label">Verification Rate</div>
                  </div>
                </Col>
              </Row>
            </Container>
          </section>
        )}

        {/* CTA Section */}
        <section className="cta-section">
          <Container>
            <Card className="cta-card">
              <Card.Body className="text-center">
                <h3>Ready to Get Started?</h3>
                <p>Connect your wallet and start issuing or verifying certificates today</p>
                {!web3Context.account ? (
                  <>
                    <Button
                      variant="light"
                      size="lg"
                      onClick={web3Context.initializeWeb3}
                      className="cta-button"
                    >
                      Connect MetaMask Wallet
                    </Button>
                    <p className="small text-white-50 mt-3">
                      Make sure you're connected to {targetNetworkName}
                    </p>
                  </>
                ) : (
                  <Button
                    as={Link}
                    to={this.getDashboardPath()}
                    variant="light"
                    size="lg"
                    className="cta-button"
                  >
                    Go to {this.getDashboardLabel()} →
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Container>
        </section>
      </div>
    );
  }
}

export default withWeb3(ModernHome);
