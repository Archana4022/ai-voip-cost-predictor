import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light text-dark text-center">
      <div className="container">
        <h1 className="display-4 fw-bold">CallFusion AI</h1>
        <p className="lead mt-3 mb-4">
          Predict VOIP call costs & optimize routing with AI-powered analytics.
        </p>
        <Link to="/predict" className="btn btn-primary btn-lg shadow">
          Get Started
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
