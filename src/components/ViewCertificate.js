import React, { Component } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import printJS from 'print-js';

class ViewCertificate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      address: '',
      certificate: null,
      loading: false,
      error: '',
      queriedAddress: ''
    };
    this.printContainerId = `certificate-print-${Date.now()}`;
  }

  handleSearch = async (e) => {
    e.preventDefault();
    this.setState({ loading: true, error: '', certificate: null });

    try {
      if (!this.props.contract) {
        throw new Error('Contract not loaded. Please refresh the page.');
      }

      const lookupAddress = this.state.address.trim();
      const web3 = this.props.web3 || window.web3;

      if (!web3 || !web3.utils.isAddress(lookupAddress)) {
        throw new Error('Enter a valid Ethereum address (0x...).');
      }

      const result = await this.props.contract.methods.viewcert(lookupAddress).call();

      this.setState({
        loading: false,
        certificate: {
          firstName: result.fname || result[0],
          lastName: result.lname || result[1],
          course: result.course || result[2]
        },
        queriedAddress: lookupAddress
      });
    } catch (error) {
      this.setState({
        loading: false,
        error: error.message || 'Failed to retrieve certificate'
      });
    }
  };

  handlePrint = () => {
    if (!this.state.certificate) {
      return;
    }

    printJS({
      printable: this.printContainerId,
      type: 'html',
      targetStyles: ['*']
    });
  };

  render() {
    const disabled = this.state.loading || !this.props.contract || this.props.networkMismatch;

    return (
      <Card>
        <Card.Body>
          <Card.Title>View Certificate</Card.Title>
          {this.props.networkMismatch && (
            <Alert variant="warning">Switch to the expected network to verify certificates.</Alert>
          )}
          
          <Form onSubmit={this.handleSearch}>
            <Form.Group className="mb-3">
              <Form.Label>Certificate Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Ethereum address (0x...)"
                value={this.state.address}
                onChange={(e) => this.setState({ address: e.target.value })}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={disabled}>
              {this.state.loading ? 'Searching...' : 'Search Certificate'}
            </Button>
          </Form>

          {this.state.error && (
            <Alert variant="danger" className="mt-3">
              {this.state.error}
            </Alert>
          )}

          {this.state.certificate && (
            <Alert variant="success" className="mt-3">
              <Alert.Heading>Certificate Found!</Alert.Heading>
              <p><strong>First Name:</strong> {this.state.certificate.firstName}</p>
              <p><strong>Last Name:</strong> {this.state.certificate.lastName}</p>
              <p><strong>Course:</strong> {this.state.certificate.course}</p>
              <p><strong>Student Address:</strong> {this.state.queriedAddress}</p>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <p className="mb-0 text-muted">Certificate verified on blockchain</p>
                <Button variant="outline-secondary" size="sm" onClick={this.handlePrint}>
                  Print / Save
                </Button>
              </div>
            </Alert>
          )}

          <div style={{ display: 'none' }}>
            <div id={this.printContainerId}>
              <h2>Certificate Validation</h2>
              {this.state.certificate && (
                <>
                  <p>First Name: {this.state.certificate.firstName}</p>
                  <p>Last Name: {this.state.certificate.lastName}</p>
                  <p>Course: {this.state.certificate.course}</p>
                  <p>Student Address: {this.state.queriedAddress}</p>
                  <p>Verified on-chain via Certificate Validation System</p>
                </>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }
}

export default ViewCertificate;
