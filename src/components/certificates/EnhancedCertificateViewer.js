/**
 * Enhanced Certificate Viewer with QR Code and Revocation Support
 */
import React, { Component } from 'react';
import { Card, Form, Button, Alert, Row, Col, Badge, Modal } from 'react-bootstrap';
import QRCode from 'qrcode.react';
import printJS from 'print-js';
import { withWeb3 } from '../../context/Web3Context';
import Loader from '../common/Loader';
import NetworkSwitcher from '../common/NetworkSwitcher';
import { shortenAddress, formatDate, copyToClipboard, getExplorerUrl } from '../../utils/formatters';
import { targetNetworkId } from '../../config';
import './CertificateViewer.css';

class EnhancedCertificateViewer extends Component {
  state = {
    searchAddress: '',
    certificate: null,
    loading: false,
    error: '',
    showQRModal: false,
    revocationModal: {
      show: false,
      reason: '',
      submitting: false,
      error: ''
    },
    copySuccess: false
  };

  handleSearch = async (e) => {
    e.preventDefault();
    this.setState({ loading: true, error: '', certificate: null });

    const { web3Context } = this.props;
    const { contract, web3 } = web3Context;
    const { searchAddress } = this.state;

    try {
      // Check if Web3 and contract are initialized
      if (!web3 || !contract) {
        throw new Error('Please connect your wallet first. The smart contract is not initialized.');
      }

      if (!web3.utils.isAddress(searchAddress)) {
        throw new Error('Invalid Ethereum address');
      }

      const result = await contract.methods.viewCertificate(searchAddress).call();

      // Get college details
      let collegeInfo = { name: 'Unknown', address: result.issuer };
      try {
        const details = await contract.methods.getCollegeDetails(result.issuer).call();
        collegeInfo.name = details.name;
      } catch (err) {
        console.warn('Could not fetch college details:', err);
      }

      this.setState({
        loading: false,
        certificate: {
          student: searchAddress,
          firstName: result.firstName,
          lastName: result.lastName,
          course: result.course,
          issuer: result.issuer,
          issuedAt: result.issuedAt,
          isRevoked: result.isRevoked,
          revocationReason: result.revocationReason,
          college: collegeInfo
        }
      });
    } catch (error) {
      this.setState({
        loading: false,
        error: error.message || 'Certificate not found or failed to load'
      });
    }
  };

  handleCopy = async (text) => {
    const success = await copyToClipboard(text);
    if (success) {
      this.setState({ copySuccess: true });
      setTimeout(() => this.setState({ copySuccess: false }), 2000);
    }
  };

  handlePrint = () => {
    const { certificate } = this.state;
    if (!certificate) return;

    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
        <h1 style="text-align: center; color: #2d3748; border-bottom: 3px solid #667eea; padding-bottom: 20px;">
          Certificate of Completion
        </h1>
        <div style="margin-top: 40px;">
          <p style="font-size: 18px;"><strong>This is to certify that</strong></p>
          <h2 style="color: #667eea; margin: 20px 0;">${certificate.firstName} ${certificate.lastName}</h2>
          <p style="font-size: 18px;">has successfully completed</p>
          <h3 style="color: #2d3748; margin: 20px 0;">${certificate.course}</h3>
          <p style="font-size: 16px; margin-top: 40px;">
            <strong>Issued by:</strong> ${certificate.college.name}<br>
            <strong>Issued on:</strong> ${formatDate(certificate.issuedAt)}<br>
            <strong>Student Address:</strong> ${certificate.student}<br>
            <strong>Issuer Address:</strong> ${certificate.issuer}
          </p>
          ${certificate.isRevoked ? `
            <div style="margin-top: 30px; padding: 20px; background: #fff5f5; border-left: 4px solid #f56565;">
              <strong style="color: #c53030;">REVOKED</strong><br>
              <span style="color: #742a2a;">${certificate.revocationReason}</span>
            </div>
          ` : ''}
          <p style="margin-top: 40px; font-size: 12px; color: #718096; text-align: center;">
            Verified on blockchain - This certificate is cryptographically secured and tamper-proof
          </p>
        </div>
      </div>
    `;

    printJS({
      printable: printContent,
      type: 'raw-html'
    });
  };

  handleRevoke = async (e) => {
    e.preventDefault();
    const { revocationModal, certificate } = this.state;
    const { web3Context } = this.props;
    const { contract, account } = web3Context;

    this.setState({
      revocationModal: {
        ...revocationModal,
        submitting: true,
        error: ''
      }
    });

    try {
      // Check if Web3 and contract are initialized
      if (!contract || !account) {
        throw new Error('Please connect your wallet first');
      }

      await contract.methods
        .revokeCertificate(certificate.student, revocationModal.reason)
        .send({ from: account });

      this.setState({
        revocationModal: {
          show: false,
          reason: '',
          submitting: false,
          error: ''
        }
      });

      // Reload certificate
      await this.handleSearch({ preventDefault: () => {} });
    } catch (error) {
      this.setState({
        revocationModal: {
          ...revocationModal,
          submitting: false,
          error: error.message || 'Failed to revoke certificate'
        }
      });
    }
  };

  canRevoke = () => {
    const { web3Context } = this.props;
    const { certificate } = this.state;
    
    if (!certificate || certificate.isRevoked) return false;
    
    return (
      web3Context.isOwner ||
      (certificate.issuer && certificate.issuer.toLowerCase() === web3Context.account.toLowerCase())
    );
  };

  generateVerificationURL = () => {
    const { certificate } = this.state;
    if (!certificate) return '';
    
    const baseUrl = window.location.origin;
    return `${baseUrl}/verify/${certificate.student}`;
  };

  render() {
    const { web3Context } = this.props;
    const { searchAddress, certificate, loading, error, showQRModal, revocationModal, copySuccess } = this.state;
    const networkMismatch = web3Context.networkId && web3Context.networkId !== targetNetworkId;

    return (
      <div className="certificate-viewer-container">
        {networkMismatch && <NetworkSwitcher />}

        <Card className="search-card">
          <Card.Body>
            <Card.Title>Verify Certificate</Card.Title>
            <Form onSubmit={this.handleSearch}>
              <Form.Group>
                <Form.Label>Student Wallet Address or ENS</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="0x... or name.eth"
                  value={searchAddress}
                  onChange={(e) => this.setState({ searchAddress: e.target.value })}
                  required
                  disabled={loading || networkMismatch}
                />
                <Form.Text className="text-muted">
                  Enter the student's Ethereum wallet address to verify their certificate
                </Form.Text>
              </Form.Group>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || networkMismatch}
                className="mt-2"
              >
                {loading ? 'Searching...' : 'Verify Certificate'}
              </Button>
            </Form>
          </Card.Body>
        </Card>

        {error && (
          <Alert variant="danger" className="mt-3">
            <strong>Error:</strong> {error}
          </Alert>
        )}

        {loading && <Loader text="Verifying certificate on blockchain..." />}

        {certificate && (
          <Card className={`certificate-card mt-4 ${certificate.isRevoked ? 'revoked' : ''}`}>
            <Card.Header className={certificate.isRevoked ? 'bg-danger' : 'bg-success'}>
              <Row className="align-items-center">
                <Col>
                  <h5 className="text-white mb-0">
                    {certificate.isRevoked ? '⚠️ Revoked Certificate' : '✓ Valid Certificate'}
                  </h5>
                </Col>
                <Col className="text-right">
                  <Badge variant="light">
                    {certificate.isRevoked ? 'REVOKED' : 'ACTIVE'}
                  </Badge>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              {certificate.isRevoked && (
                <Alert variant="danger" className="mb-4">
                  <Alert.Heading className="h6">This certificate has been revoked</Alert.Heading>
                  <p className="mb-0"><strong>Reason:</strong> {certificate.revocationReason}</p>
                </Alert>
              )}

              <Row>
                <Col md={8}>
                  <div className="certificate-details">
                    <h3 className="student-name">
                      {certificate.firstName} {certificate.lastName}
                    </h3>
                    <p className="course-name">{certificate.course}</p>

                    <hr />

                    <Row className="info-row">
                      <Col sm={4} className="info-label">Issued By:</Col>
                      <Col sm={8} className="info-value">
                        <strong>{certificate.college.name}</strong>
                        <br />
                        <code className="small">{shortenAddress(certificate.issuer)}</code>
                      </Col>
                    </Row>

                    <Row className="info-row">
                      <Col sm={4} className="info-label">Issued Date:</Col>
                      <Col sm={8} className="info-value">{formatDate(certificate.issuedAt)}</Col>
                    </Row>

                    <Row className="info-row">
                      <Col sm={4} className="info-label">Student Address:</Col>
                      <Col sm={8} className="info-value">
                        <code>{certificate.student}</code>
                        <Button
                          size="sm"
                          variant="link"
                          onClick={() => this.handleCopy(certificate.student)}
                          className="p-0 ml-2"
                        >
                          {copySuccess ? '✓ Copied' : '📋 Copy'}
                        </Button>
                      </Col>
                    </Row>

                    <Row className="info-row">
                      <Col sm={4} className="info-label">Blockchain:</Col>
                      <Col sm={8} className="info-value">
                        <Badge variant="info">{web3Context.networkName}</Badge>
                      </Col>
                    </Row>
                  </div>

                  <div className="action-buttons mt-4">
                    <Button
                      variant="outline-primary"
                      onClick={() => this.setState({ showQRModal: true })}
                      className="mr-2"
                    >
                      📱 Show QR Code
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={this.handlePrint}
                      className="mr-2"
                    >
                      🖨️ Print Certificate
                    </Button>
                    {this.canRevoke() && !certificate.isRevoked && (
                      <Button
                        variant="outline-danger"
                        onClick={() => this.setState({ revocationModal: { ...revocationModal, show: true } })}
                      >
                        ⚠️ Revoke Certificate
                      </Button>
                    )}
                  </div>
                </Col>

                <Col md={4} className="text-center">
                  <div className="qr-preview">
                    <QRCode
                      value={this.generateVerificationURL()}
                      size={180}
                      level="H"
                      includeMargin
                    />
                    <p className="small text-muted mt-2">
                      Scan to verify on mobile
                    </p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* QR Code Modal */}
        <Modal
          show={showQRModal}
          onHide={() => this.setState({ showQRModal: false })}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Certificate Verification QR Code</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            {certificate && (
              <>
                <QRCode
                  value={this.generateVerificationURL()}
                  size={300}
                  level="H"
                  includeMargin
                />
                <p className="mt-3 small text-muted">
                  Scan this QR code with any device to verify this certificate
                </p>
                <Form.Control
                  type="text"
                  value={this.generateVerificationURL()}
                  readOnly
                  className="mt-2"
                  onClick={(e) => e.target.select()}
                />
              </>
            )}
          </Modal.Body>
        </Modal>

        {/* Revocation Modal */}
        <Modal
          show={revocationModal.show}
          onHide={() => !revocationModal.submitting && this.setState({ revocationModal: { ...revocationModal, show: false } })}
          centered
        >
          <Modal.Header closeButton={!revocationModal.submitting}>
            <Modal.Title>Revoke Certificate</Modal.Title>
          </Modal.Header>
          <Form onSubmit={this.handleRevoke}>
            <Modal.Body>
              <Alert variant="warning">
                <strong>Warning:</strong> This action cannot be undone. The certificate will be permanently marked as revoked on the blockchain.
              </Alert>

              {revocationModal.error && (
                <Alert variant="danger">{revocationModal.error}</Alert>
              )}

              <Form.Group>
                <Form.Label>Reason for Revocation *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter the reason for revoking this certificate..."
                  value={revocationModal.reason}
                  onChange={(e) => this.setState({
                    revocationModal: { ...revocationModal, reason: e.target.value }
                  })}
                  required
                  disabled={revocationModal.submitting}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => this.setState({ revocationModal: { ...revocationModal, show: false } })}
                disabled={revocationModal.submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                disabled={revocationModal.submitting || !revocationModal.reason.trim()}
              >
                {revocationModal.submitting ? 'Revoking...' : 'Revoke Certificate'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default withWeb3(EnhancedCertificateViewer);
