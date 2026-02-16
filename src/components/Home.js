import React, { Component } from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';
import CertificateFeed from './CertificateFeed';

class Home extends Component {
  render() {
    const { recentCertificates = [], isFetchingEvents, expectedNetworkName } = this.props;

    return (
      <Container>
        <Row className="justify-content-center mt-5">
          <Col md={8}>
            <Card className="text-center">
              <Card.Body>
                <Card.Title as="h1" className="mb-4">
                  Certificate Validation System
                </Card.Title>
                <Card.Text className="lead mb-4">
                  A blockchain-based system for issuing and verifying certificates
                </Card.Text>
                <hr />
                <Card.Text className="text-muted">
                  <strong>Features:</strong>
                </Card.Text>
                <ul className="list-unstyled">
                  <li>✓ Secure certificate issuance</li>
                  <li>✓ Instant verification</li>
                  <li>✓ Tamper-proof records</li>
                  <li>✓ Blockchain powered</li>
                </ul>
                <hr />
                <Card.Text className="text-info">
                  Make sure MetaMask is installed and connected to {expectedNetworkName}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col md={10}>
            <CertificateFeed events={recentCertificates} loading={isFetchingEvents} />
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Home;
