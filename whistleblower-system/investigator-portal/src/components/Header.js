import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/auth';

const Header = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <h1>Whistleblower Investigation System</h1>
          
          {currentUser && (
            <div className="user-menu">
              <span>Welcome, {currentUser.name}</span>
              <nav>
                <ul>
                  <li><Link to="/dashboard">Dashboard</Link></li>
                  <li><Link to="/reports">Reports</Link></li>
                  <li><Link to="/my-cases">My Cases</Link></li>
                  <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
