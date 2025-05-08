// src/components/ResultCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './ResultCard.css';  // Add this line to import custom styles

const ResultCard = ({ cost }) => {
  return (
    <div className="result-card mt-4 p-4 rounded shadow-sm bg-light">
      <h3 className="mb-3 text-center">🔮 Estimated Cost</h3>
      <div className="d-flex justify-content-center">
        <div className="cost-value">
          <h4 className="text-success">₹{cost}</h4>
        </div>
      </div>
      <p className="text-center text-muted">Based on your call details.</p>
    </div>
  );
};

ResultCard.propTypes = {
  cost: PropTypes.number.isRequired,
};

export default ResultCard;
