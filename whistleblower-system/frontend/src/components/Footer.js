import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} Whistleblower Reporting System</p>
        <p>Powered by Hyperledger Fabric Blockchain</p>
      </div>
    </footer>
  );
};

export default Footer;
