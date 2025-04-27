import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  return (
    <header className="header">
      <div className="container">
        <h1>Whistleblower Reporting System</h1>
        <nav>
          <ul>
            <li><Link to="/" className={isActive('/')}>Home</Link></li>
            <li><Link to="/submit" className={isActive('/submit')}>Submit Report</Link></li>
            <li><Link to="/check-status" className={isActive('/check-status')}>Check Status</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
