/**
 * Reusable Loading Spinner Component
 */
import React from 'react';
import { Spinner } from 'react-bootstrap';
import './Loader.css';

const Loader = ({ size = 'md', text = 'Loading...', fullPage = false }) => {
  const sizeMap = {
    sm: '1rem',
    md: '2rem',
    lg: '3rem'
  };

  const content = (
    <div className="loader-container">
      <Spinner
        animation="border"
        role="status"
        style={{ width: sizeMap[size], height: sizeMap[size] }}
        className="loader-spinner"
      >
        <span className="sr-only">Loading...</span>
      </Spinner>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="loader-fullpage">{content}</div>;
  }

  return content;
};

export default Loader;
