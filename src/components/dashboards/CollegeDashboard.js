/**
 * College Dashboard - Certificate issuance and management
 */
import React, { Component } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table, Badge } from 'react-bootstrap';
import { withWeb3 } from '../../context/Web3Context';
import Loader from '../common/Loader';
import NetworkSwitcher from '../common/NetworkSwitcher';
import { shortenAddress, formatDate } from '../../utils/formatters';
import { targetNetworkId } from '../../config';
import './Dashboard.css';

class CollegeDashboard extends Component {
  state = {
    loading: true,
    isApproved: false,
    collegeDetails: null,
    certificateForm: {
      studentAddress: '',
      firstName: '',
      lastName: '',
      course: ''
    },
    issuedCertificates: [],
    submitting: false,
    message: '',
    error: ''
  };

  async componentDidMount() {
    await this.loadDashboardData();
  }

  loadDashboardData = async () => {
    this.setState({ loading: true, error: '' });
    const { web3Context } = this.props;
    const { contract, account, web3 } = web3Context;

    try {
      if (!contract || !account || !web3) {
        throw new Error('Please connect your wallet and ensure the smart contract is deployed. Contract address may be incorrect in config.js');
      }

      // Check if college is approved
      const isApproved = await contract.methods.isApprovedCollege(account).call();
      
      if (!isApproved) {
        this.setState({ loading: false, isApproved: false });
        return;
      }

      // Fetch college details
      const details = await contract.methods.getCollegeDetails(account).call();
      const collegeDetails = {
        name: details.name,
        registeredAt: details.registeredAt,
        certificatesIssued: details.certificatesIssued
      };

      // Fetch issued certificates
      const latestBlock = await web3.eth.getBlockNumber();
      const fromBlock = Math.max(latestBlock - 10000, 0);

      const events = await contract.getPastEvents('CertificateIssued', {
        filter: { issuer: account },
        fromBlock,
        toBlock: 'latest'
      });

      const issuedCertificates = events
        .map(e => ({
          student: e.returnValues.student,
          firstName: e.returnValues.firstName,
          lastName: e.returnValues.lastName,
          course: e.returnValues.course,
          timestamp: e.returnValues.timestamp,
          blockNumber: e.blockNumber,
          txHash: e.transactionHash
        }))
        .sort((a, b) => b.timestamp - a.timestamp);

      this.setState({
        loading: false, isApproved: true,
        collegeDetails,
        issuedCertificates
      });
    } catch (error) {
      this.setState({
        loading: false,
        error: error.message || 'Failed to load dashboard'
      });
    }
  };

  handleInputChange = (field, value) => {
    this.setState({
      certificateForm: {
        ...this.state.certificateForm,
        [field]: value
      }
    });
  };

  handleIssueCertificate = async (e) => {
    e.preventDefault();
    this.setState({ submitting: true, message: '', error: '' });

    const { web3Context } = this.props;
    const { contract, account, web3 } = web3Context;
    const { certificateForm } = this.state;

    try {
      if (!web3 || !contract || !account) {
        throw new Error('Please connect your wallet first');
      }

      if (!web3.utils.isAddress(certificateForm.studentAddress)) {
        throw new Error('Invalid student address');
      }

      await contract.methods
        .issueCertificate(
          certificateForm.studentAddress,
          certificateForm.firstName,
          certificateForm.lastName,
          certificateForm.course
        )
        .send({ from: account });

      this.setState({
        submitting: false,
        message: 'Certificate issued successfully!',
        certificateForm: {
          studentAddress: '',
          firstName: '',
          lastName: '',
          course: ''
        }
      });

      await this.loadDashboardData();
    } catch (error) {
      this.setState({
        submitting: false,
        error: error.message || 'Failed to issue certificate'
      });
    }
  };

  render() {
    const { web3Context } = this.props;
    const { loading, isApproved, collegeDetails, certificateForm, issuedCertificates, submitting, message, error } = this.state;
    const networkMismatch = web3Context.networkId && web3Context.networkId !== targetNetworkId;

    if (loading) {
      return <Loader fullPage text="Loading College Dashboard..." />;
    }

    if (!isApproved) {
      return (
        <Container className="mt-5">
          <Alert variant="warning">
            <Alert.Heading>Not Approved</Alert.Heading>
            <p>Your wallet address is not registered as an approved college.</p>
            <p className="mb-0">
              <strong>Your Address:</strong> <code>{web3Context.account}</code>
            </p>
            <hr />
            <p className="mb-0">
              Please contact the system administrator to get your institution approved.
            </p>
          </Alert>
        </Container>
      );
    }

    return (
      <Container className="dashboard-container">
        {networkMismatch && <NetworkSwitcher />}

        <div className="dashboard-header">
          <div>
            <h2>{collegeDetails.name}</h2>
            <p className="text-muted mb-0">College Dashboard</p>
          </div>
          <Badge variant="success">Approved College</Badge>
        </div>

        {message && <Alert variant="success" dismissible onClose={() => this.setState({ message: '' })}>{message}</Alert>}
        {error && <Alert variant="danger" dismissible onClose={() => this.setState({ error: '' })}>{error}</Alert>}

        {/* Stats */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-number">{collegeDetails.certificatesIssued}</div>
                <div className="stat-label">Certificates Issued</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-number">{issuedCertificates.length}</div>
                <div className="stat-label">Recent (visible)</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-label">Registered</div>
                <div className="stat-value">{formatDate(collegeDetails.registeredAt)}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Issue Certificate Form */}
        <Card className="mb-4">
          <Card.Header>
            <strong>Issue New Certificate</strong>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={this.handleIssueCertificate}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Student Wallet Address *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="0x..."
                      value={certificateForm.studentAddress}
                      onChange={(e) => this.handleInputChange('studentAddress', e.target.value)}
                      required
                      disabled={submitting || networkMismatch}
                    />
                    <Form.Text className="text-muted">
                      Student's Ethereum wallet address
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Course Name *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., Bachelor of Computer Science"
                      value={certificateForm.course}
                      onChange={(e) => this.handleInputChange('course', e.target.value)}
                      required
                      disabled={submitting || networkMismatch}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="John"
                      value={certificateForm.firstName}
                      onChange={(e) => this.handleInputChange('firstName', e.target.value)}
                      required
                      disabled={submitting || networkMismatch}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Doe"
                      value={certificateForm.lastName}
                      onChange={(e) => this.handleInputChange('lastName', e.target.value)}
                      required
                      disabled={submitting || networkMismatch}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting || networkMismatch}
                className="px-4"
              >
                {submitting ? 'Issuing Certificate...' : 'Issue Certificate'}
              </Button>
            </Form>
          </Card.Body>
        </Card>

        {/* Issued Certificates */}
        <Card>
          <Card.Header>
            <strong>Recently Issued Certificates</strong>
          </Card.Header>
          <Card.Body>
            {issuedCertificates.length === 0 ? (
              <p className="text-muted text-center">No certificates issued yet.</p>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Address</th>
                    <th>Course</th>
                    <th>Issued Date</th>
                    <th>Block</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedCertificates.map((cert, idx) => (
                    <tr key={idx}>
                      <td><strong>{cert.firstName} {cert.lastName}</strong></td>
                      <td><code>{shortenAddress(cert.student)}</code></td>
                      <td>{cert.course}</td>
                      <td>{formatDate(cert.timestamp)}</td>
                      <td>{cert.blockNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>
    );
  }
}

export default withWeb3(CollegeDashboard);
