import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/auth';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const user = getCurrentUser();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🛡️</span>
          <h1>Whistleblower System</h1>
        </div>
      </div>
      
      <ul className="sidebar-nav">
        <li className="nav-item">
          <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <span className="nav-icon">📊</span>
            Dashboard
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/reports" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <span className="nav-icon">📑</span>
            All Reports
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/my-cases" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <span className="nav-icon">🔍</span>
            My Cases
          </NavLink>
        </li>
      </ul>
      
      {user && (
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{getInitials(user.name)}</div>
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div className="user-role">Investigator</div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
