import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="hero">
        <div className="container">
          <h1>Secure Whistleblower Reporting System</h1>
          <p>Report workplace misconduct, corruption, or other issues securely and anonymously using blockchain technology</p>
          <div className="cta-buttons">
            <Link to="/submit" className="cta-button primary">Submit a Report</Link>
            <Link to="/check-status" className="cta-button secondary">Check Report Status</Link>
          </div>
        </div>
      </div>
      
      <div className="container">
        <div className="features">
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <h3>Anonymous Reporting</h3>
            <p>Submit reports completely anonymously with no personally identifiable information required</p>
          </div>
          <div className="feature">
            <div className="feature-icon">⛓️</div>
            <h3>Blockchain Security</h3>
            <p>All reports are stored on a secure blockchain network for tamper-proof record keeping</p>
          </div>
          <div className="feature">
            <div className="feature-icon">💰</div>
            <h3>Monetary Rewards</h3>
            <p>Optionally provide a crypto wallet address to receive rewards for verified reports</p>
          </div>
          <div className="feature">
            <div className="feature-icon">💬</div>
            <h3>Direct Communication</h3>
            <p>Securely communicate with investigators while maintaining your anonymity</p>
          </div>
        </div>
        
        <div className="how-it-works">
          <h2>How It Works</h2>
          <ol>
            <li><strong>Submit your report</strong> through our secure form with an optional crypto wallet address for rewards</li>
            <li><strong>Receive a unique report ID</strong> to check your report status and communicate with investigators</li>
            <li><strong>Investigators review</strong> reports based on criticality and begin their investigation</li>
            <li><strong>Communicate securely</strong> with investigators while maintaining anonymity throughout the process</li>
            <li><strong>Get updates</strong> on the progress and outcome of your report investigation</li>
            <li><strong>Receive rewards</strong> if your report leads to successful action (if wallet was provided)</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
