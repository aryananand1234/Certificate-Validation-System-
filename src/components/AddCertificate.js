import React, { Component } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';

class AddCertificate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      studentAddress: '',
      firstName: '',
      lastName: '',
      course: '',
      loading: false,
      message: '',
      error: ''
    };
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ loading: true, message: '', error: '' });

    try {
      if (this.props.networkMismatch) {
        throw new Error('Switch to the expected network before issuing certificates.');
      }

      if (!this.props.contract || !this.props.account) {
        throw new Error('Contract not loaded. Please refresh the page.');
      }

      const studentAddress = this.state.studentAddress.trim();
      const web3 = this.props.web3 || window.web3;

      if (!web3 || !web3.utils.isAddress(studentAddress)) {
        throw new Error('Enter a valid Ethereum address for the student.');
      }

      await this.props.contract.methods
        .addcert(
          studentAddress,
          this.state.lastName,
          this.state.firstName,
          this.state.course
        )
        .send({ from: this.props.account });

      this.setState({
        loading: false,
        message: 'Certificate added successfully!',
        studentAddress: '',
        firstName: '',
        lastName: '',
        course: ''
      });
    } catch (error) {
      this.setState({
        loading: false,
        error: error.message || 'Failed to add certificate'
      });
    }
  };

  render() {
    const disabled =
      this.state.loading ||
      !this.props.contract ||
      !this.props.account ||
      this.props.networkMismatch;

    return (
      <Card>
        <Card.Body>
          <Card.Title>Add Certificate</Card.Title>
          {this.state.message && <Alert variant="success">{this.state.message}</Alert>}
          {this.state.error && <Alert variant="danger">{this.state.error}</Alert>}
          {!this.props.account && (
            <Alert variant="info">Connect your wallet to begin issuing certificates.</Alert>
          )}
          {this.props.networkMismatch && (
            <Alert variant="warning">
              Switch to the expected network before sending transactions.
            </Alert>
          )}
          
          <Form onSubmit={this.handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Student Ethereum Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter student wallet address (0x...)"
                value={this.state.studentAddress}
                onChange={(e) => this.setState({ studentAddress: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter first name"
                value={this.state.firstName}
                onChange={(e) => this.setState({ firstName: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter last name"
                value={this.state.lastName}
                onChange={(e) => this.setState({ lastName: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Course</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter course name"
                value={this.state.course}
                onChange={(e) => this.setState({ course: e.target.value })}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={disabled}>
              {this.state.loading ? 'Adding...' : 'Add Certificate'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    );
  }
}

export default AddCertificate;
