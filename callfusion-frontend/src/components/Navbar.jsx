import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand" to="/">CallFusion AI</Link>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item"><Link className="nav-link" to="/predict">Predict</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/history">Call History</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/analytics">Analytics</Link></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
