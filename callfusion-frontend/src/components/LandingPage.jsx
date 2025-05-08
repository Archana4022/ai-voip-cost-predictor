// src/components/LandingPage.jsx
import React from 'react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing d-flex flex-column justify-content-center align-items-center text-white text-center">
      <h1 className="display-4 fw-bold">CallFusion AI</h1>
      <p className="lead">Smarter call cost predictions — in seconds</p>
      <button className="btn btn-primary btn-lg mt-3">Predict Now</button>
      <span className="badge bg-success mt-4">API Status: Online</span>
    </div>
  );
};

export default LandingPage;
