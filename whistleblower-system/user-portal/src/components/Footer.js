import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>© {new Date().getFullYear()} Whistleblower Reporting System</p>
        <p>Powered by <strong>Hyperledger Fabric Blockchain</strong> | <a href="#privacy">Privacy Policy</a> | <a href="#terms">Terms of Use</a></p>
      </div>
    </footer>
  );
};

export default Footer;
