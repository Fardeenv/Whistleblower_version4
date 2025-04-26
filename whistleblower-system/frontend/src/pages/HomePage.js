import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="hero">
        <div className="container">
          <h1>Secure Whistleblower Reporting System</h1>
          <p>Report workplace misconduct, corruption, or other issues securely and anonymously</p>
          <div className="cta-buttons">
            <Link to="/submit" className="cta-button primary">Submit a Report</Link>
            <Link to="/check-status" className="cta-button secondary">Check Report Status</Link>
          </div>
        </div>
      </div>
      
      <div className="container">
        <div className="features">
          <div className="feature">
            <h3>Anonymous Reporting</h3>
            <p>Submit reports completely anonymously with no personally identifiable information required</p>
          </div>
          
          <div className="feature">
            <h3>Blockchain Security</h3>
            <p>All reports are stored on a secure blockchain network for tamper-proof record keeping</p>
          </div>
          
          <div className="feature">
            <h3>Status Tracking</h3>
            <p>Check the status of your report at any time using your unique report ID</p>
          </div>
        </div>
        
        <div className="how-it-works">
          <h2>How It Works</h2>
          <ol>
            <li>Submit your report through our secure form</li>
            <li>Receive a unique report ID</li>
            <li>Save your report ID to check status later</li>
            <li>Reports are reviewed by authorized personnel</li>
            <li>Status updates are recorded on the blockchain</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
