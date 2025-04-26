import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <h1>Whistleblower Reporting System</h1>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/submit">Submit Report</Link></li>
            <li><Link to="/check-status">Check Status</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
