/**
 * Admin Dashboard - Contract owner management panel
 */
import React, { Component } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Alert } from 'react-bootstrap';
import { withWeb3 } from '../../context/Web3Context';
import Loader from '../common/Loader';
import NetworkSwitcher from '../common/NetworkSwitcher';
import { shortenAddress, formatDate } from '../../utils/formatters';
import { targetNetworkId } from '../../config';
import './Dashboard.css';

class AdminDashboard extends Component {
  state = {
    loading: true,
    stats: {
      totalColleges: 0,
      totalCertificates: 0
    },
    colleges: [],
    recentActivity: [],
    newCollege: {
      address: '',
      name: ''
    },
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
    const { contract, web3 } = web3Context;

    try {
      if (!contract || !web3) {
        throw new Error('Please connect your wallet and ensure the smart contract is deployed. Contract address may be incorrect in config.js');
      }

      // Fetch stats
      const totalColleges = await contract.methods.getTotalColleges().call();
      const totalCertificates = await contract.methods.getTotalCertificates().call();

      // Fetch college list
      const collegeAddresses = await contract.methods.getAllColleges().call();
      const colleges = [];
      
      for (let addr of collegeAddresses) {
        try {
          const details = await contract.methods.getCollegeDetails(addr).call();
          colleges.push({
            address: addr,
            name: details.name,
            isApproved: details.isApproved,
            registeredAt: details.registeredAt,
            certificatesIssued: details.certificatesIssued
          });
        } catch (err) {
          console.warn('Failed to fetch college details:', err);
        }
      }

      // Fetch recent events
      const latestBlock = await web3.eth.getBlockNumber();
      const fromBlock = Math.max(latestBlock - 5000, 0);

      const [collegeEvents, certEvents] = await Promise.all([
        contract.getPastEvents('CollegeAdded', { fromBlock, toBlock: 'latest' }),
        contract.getPastEvents('CertificateIssued', { fromBlock, toBlock: 'latest' })
      ]);

      const recentActivity = [
        ...collegeEvents.map(e => ({
          type: 'college',
          ...e.returnValues,
          blockNumber: e.blockNumber
        })),
        ...certEvents.map(e => ({
          type: 'certificate',
          ...e.returnValues,
          blockNumber: e.blockNumber
        }))
      ].sort((a, b) => b.blockNumber - a.blockNumber).slice(0, 10);

      this.setState({
        loading: false,
        stats: { totalColleges, totalCertificates },
        colleges,
        recentActivity
      });
    } catch (error) {
      this.setState({
        loading: false,
        error: error.message || 'Failed to load dashboard data'
      });
    }
  };

  handleInputChange = (field, value) => {
    this.setState({
      newCollege: {
        ...this.state.newCollege,
        [field]: value
      }
    });
  };

  handleAddCollege = async (e) => {
    e.preventDefault();
    this.setState({ submitting: true, message: '', error: '' });

    const { web3Context } = this.props;
    const { contract, account, web3 } = web3Context;
    const { newCollege } = this.state;

    try {
      if (!web3 || !contract || !account) {
        throw new Error('Please connect your wallet first');
      }

      if (!web3.utils.isAddress(newCollege.address)) {
        throw new Error('Invalid Ethereum address');
      }

      await contract.methods
        .addCollege(newCollege.address, newCollege.name)
        .send({ from: account });

      this.setState({
        submitting: false,
        message: 'College added successfully!',
        newCollege: { address: '', name: '' }
      });

      // Reload data
      await this.loadDashboardData();
    } catch (error) {
      this.setState({
        submitting: false,
        error: error.message || 'Failed to add college'
      });
    }
  };

  handleRemoveCollege = async (collegeAddress) => {
    if (!window.confirm('Are you sure you want to remove this college?')) {
      return;
    }

    const { web3Context } = this.props;
    const { contract, account } = web3Context;

    try {
      if (!contract || !account) {
        throw new Error('Please connect your wallet first');
      }

      await contract.methods.removeCollege(collegeAddress).send({ from: account });
      this.setState({ message: 'College removed successfully!' });
      await this.loadDashboardData();
    } catch (error) {
      this.setState({ error: error.message || 'Failed to remove college' });
    }
  };

  render() {
    const { web3Context } = this.props;
    const { loading, stats, colleges, recentActivity, newCollege, submitting, message, error } = this.state;
    const networkMismatch = web3Context.networkId && web3Context.networkId !== targetNetworkId;

    if (!web3Context.isOwner) {
      return (
        <Container className="mt-5">
          <Alert variant="danger">
            <Alert.Heading>Access Denied</Alert.Heading>
            <p>Only the contract owner can access the admin dashboard.</p>
            <p className="mb-0">
              <strong>Your Address:</strong> {web3Context.account}
            </p>
          </Alert>
        </Container>
      );
    }

    if (loading) {
      return <Loader fullPage text="Loading Admin Dashboard..." />;
    }

    return (
      <Container className="dashboard-container">
        {networkMismatch && <NetworkSwitcher />}

        <div className="dashboard-header">
          <h2>Admin Dashboard</h2>
          <Badge variant="primary">Contract Owner</Badge>
        </div>

        {message && <Alert variant="success" dismissible onClose={() => this.setState({ message: '' })}>{message}</Alert>}
        {error && <Alert variant="danger" dismissible onClose={() => this.setState({ error: '' })}>{error}</Alert>}

        {/* Stats */}
        <Row className="mb-4">
          <Col md={6}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-number">{stats.totalColleges}</div>
                <div className="stat-label">Total Colleges</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-number">{stats.totalCertificates}</div>
                <div className="stat-label">Total Certificates</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Add College Form */}
        <Card className="mb-4">
          <Card.Header>
            <strong>Add New College</strong>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={this.handleAddCollege}>
              <Row>
                <Col md={5}>
                  <Form.Group>
                    <Form.Label>College Wallet Address</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="0x..."
                      value={newCollege.address}
                      onChange={(e) => this.handleInputChange('address', e.target.value)}
                      required
                      disabled={submitting || networkMismatch}
                    />
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group>
                    <Form.Label>College Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="University Name"
                      value={newCollege.name}
                      onChange={(e) => this.handleInputChange('name', e.target.value)}
                      required
                      disabled={submitting || networkMismatch}
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting || networkMismatch}
                    className="w-100"
                  >
                    {submitting ? 'Adding...' : 'Add'}
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* Colleges List */}
        <Card className="mb-4">
          <Card.Header>
            <strong>Approved Colleges</strong>
          </Card.Header>
          <Card.Body>
            {colleges.length === 0 ? (
              <p className="text-muted text-center">No colleges registered yet.</p>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>College Name</th>
                    <th>Address</th>
                    <th>Registered</th>
                    <th className="text-center">Certificates Issued</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {colleges.map((college) => (
                    <tr key={college.address}>
                      <td><strong>{college.name}</strong></td>
                      <td><code>{shortenAddress(college.address)}</code></td>
                      <td>{formatDate(college.registeredAt)}</td>
                      <td className="text-center">{college.certificatesIssued}</td>
                      <td className="text-center">
                        <Badge variant={college.isApproved ? 'success' : 'danger'}>
                          {college.isApproved ? 'Active' : 'Removed'}
                        </Badge>
                      </td>
                      <td className="text-center">
                        {college.isApproved && (
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => this.handleRemoveCollege(college.address)}
                          >
                            Remove
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Recent Activity */}
        <Card>
          <Card.Header>
            <strong>Recent Activity</strong>
          </Card.Header>
          <Card.Body>
            {recentActivity.length === 0 ? (
              <p className="text-muted text-center">No recent activity.</p>
            ) : (
              <Table responsive hover size="sm">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Details</th>
                    <th>Block</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((activity, idx) => (
                    <tr key={idx}>
                      <td>
                        <Badge variant={activity.type === 'college' ? 'info' : 'success'}>
                          {activity.type === 'college' ? 'College Added' : 'Certificate Issued'}
                        </Badge>
                      </td>
                      <td>
                        {activity.type === 'college'
                          ? `${activity.name} (${shortenAddress(activity.collegeAddress)})`
                          : `${activity.firstName} ${activity.lastName} - ${activity.course}`}
                      </td>
                      <td>{activity.blockNumber}</td>
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

export default withWeb3(AdminDashboard);
