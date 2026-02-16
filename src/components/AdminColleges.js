import React, { Component } from 'react';
import { Card, Form, Button, Alert, Table } from 'react-bootstrap';

class AdminColleges extends Component {
  state = {
    collegeAddress: '',
    collegeName: '',
    loading: false,
    message: '',
    error: ''
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    this.setState({ loading: true, message: '', error: '' });

    try {
      const { contract, account, networkMismatch } = this.props;

      if (networkMismatch) {
        throw new Error(`Switch to ${this.props.expectedNetworkName} before adding colleges.`);
      }

      if (!contract || !account) {
        throw new Error('Wallet or contract not ready. Connect MetaMask and try again.');
      }

      const address = this.state.collegeAddress.trim();
      if (!address) {
        throw new Error('Enter a valid college wallet address.');
      }

      await contract.methods
        .addCollege(address, this.state.collegeName)
        .send({ from: account });

      this.setState({
        loading: false,
        message: 'College added successfully!',
        collegeAddress: '',
        collegeName: ''
      });
    } catch (error) {
      this.setState({
        loading: false,
        error: error.message || 'Failed to add college'
      });
    }
  };

  renderEventTable() {
    const { collegeEvents = [] } = this.props;

    if (!collegeEvents.length) {
      return <p className="text-muted mb-0">No college events detected in the recent block range.</p>;
    }

    return (
      <Table responsive hover size="sm" className="mt-3">
        <thead>
          <tr>
            <th scope="col">College</th>
            <th scope="col">Address</th>
            <th scope="col" className="text-right">Block</th>
          </tr>
        </thead>
        <tbody>
          {collegeEvents.map((event) => (
            <tr key={event.transactionHash}>
              <td>{event.name || 'Unnamed college'}</td>
              <td>{event.collegeAddress}</td>
              <td className="text-right">{event.blockNumber}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }

  render() {
    const { contract, account, expectedNetworkName, networkMismatch } = this.props;
    const ready = Boolean(contract && account);

    return (
      <Card>
        <Card.Body>
          <Card.Title>Manage Approved Colleges</Card.Title>
          <Card.Text className="text-muted">
            Only the smart-contract owner can add colleges. Use the same wallet you used to deploy the
            contract. You can confirm additions below via on-chain events.
          </Card.Text>

          {networkMismatch && (
            <Alert variant="warning">
              Switch MetaMask to {expectedNetworkName} to continue.
            </Alert>
          )}

          {!ready && !networkMismatch && (
            <Alert variant="info">Connect your wallet to enable admin actions.</Alert>
          )}

          {this.state.message && <Alert variant="success">{this.state.message}</Alert>}
          {this.state.error && <Alert variant="danger">{this.state.error}</Alert>}

          <Form onSubmit={this.handleSubmit} className="mt-3">
            <Form.Group>
              <Form.Label>College Ethereum Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="0x..."
                value={this.state.collegeAddress}
                onChange={(event) => this.setState({ collegeAddress: event.target.value })}
                disabled={!ready || networkMismatch}
                required
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>College Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="University of Blockchain"
                value={this.state.collegeName}
                onChange={(event) => this.setState({ collegeName: event.target.value })}
                disabled={!ready || networkMismatch}
                required
              />
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              className="mt-3"
              disabled={!ready || networkMismatch || this.state.loading}
            >
              {this.state.loading ? 'Submitting...' : 'Add College'}
            </Button>
          </Form>

          <hr className="my-4" />
          <h5>Recent College Activity</h5>
          {this.renderEventTable()}
        </Card.Body>
      </Card>
    );
  }
}

export default AdminColleges;
