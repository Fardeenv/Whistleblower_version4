import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>© {new Date().getFullYear()} Whistleblower Investigation System</p>
        <p>Secured by Hyperledger Fabric Blockchain</p>
      </div>
    </footer>
  );
};

export default Footer;
