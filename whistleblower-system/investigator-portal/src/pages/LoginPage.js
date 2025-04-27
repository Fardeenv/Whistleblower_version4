import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import Debug from '../components/Debug';

// Simple SVG shield logo inline to avoid import issues
const ShieldLogo = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 5L12.5 20V50C12.5 70 26.25 85 50 95C73.75 85 87.5 70 87.5 50V20L50 5Z" fill="#E6F1FF" stroke="#1A73E8" strokeWidth="5"/>
    <path d="M33 50L46 63L68 40" stroke="#1A73E8" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      setDebugInfo({
        message: 'Attempting login',
        username,
        passwordEntered: !!password
      });
      
      // Call the login API
      const result = await login({ username, password });
      
      setDebugInfo({
        ...debugInfo,
        message: 'Login successful',
        result: {
          token: result.token ? 'Token exists' : 'No token',
          user: result.user
        }
      });
      
      // If successful, redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setDebugInfo({
        ...debugInfo,
        message: 'Login failed',
        error: err.message || 'Unknown error'
      });
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-logo">
          <ShieldLogo />
        </div>
        <h1 className="login-title">Whistleblower Investigation System</h1>
        <h2 className="login-subtitle">Investigator Login</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="login-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="login-input"
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <p style={{ marginTop: '15px', fontSize: '0.8rem', color: '#6c757d' }}>
            Test credentials: investigator1 / securepass1
          </p>
        </form>
        
        <Debug data={{ 
          apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001/api/investigator',
          isLoading: loading,
          ...debugInfo
        }} title="Login Debug" />
      </div>
    </div>
  );
};

export default LoginPage;
