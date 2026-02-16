import React from 'react';
import { Card, ListGroup, Spinner } from 'react-bootstrap';

const CertificateFeed = ({ events = [], loading }) => {
  return (
    <Card className="mt-4 feed-card">
      <Card.Body>
        <Card.Title>Recent Certificates</Card.Title>
        <Card.Text className="text-muted">
          Live snapshot of certificates written to the blockchain.
        </Card.Text>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" role="status" size="sm" className="mr-2" />
            <span>Fetching events...</span>
          </div>
        ) : events.length ? (
          <ListGroup variant="flush" className="text-left">
            {events.map((event) => (
              <ListGroup.Item key={event.transactionHash}>
                <div className="d-flex justify-content-between">
                  <div>
                    <strong>{event.fname} {event.lname}</strong>
                    <div className="text-muted small">{event.course}</div>
                  </div>
                  <div className="text-right small">
                    <div>{shortenAddress(event.student)}</div>
                    <div className="text-uppercase">Block #{event.blockNumber}</div>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p className="text-muted mb-0">No certificate events found in the recent block range.</p>
        )}
      </Card.Body>
    </Card>
  );
};

const shortenAddress = (address = '') => {
  return address && address.length > 10
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;
};

export default CertificateFeed;
