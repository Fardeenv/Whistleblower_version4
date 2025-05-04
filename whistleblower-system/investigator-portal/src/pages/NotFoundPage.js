import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="container">
        <h2>404 - Page Not Found</h2>
        <p>The page you are looking for does not exist.</p>
        <div className="not-found-actions">
          <Link to="/dashboard" className="back-link">Return to Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
