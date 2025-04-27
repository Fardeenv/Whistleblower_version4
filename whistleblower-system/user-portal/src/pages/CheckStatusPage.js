import React from 'react';
import ReportStatus from '../components/ReportStatus';

const CheckStatusPage = () => {
  return (
    <div className="check-status-page">
      <div className="container">
        <div className="page-header">
          <h1>Check Report Status</h1>
          <p>Track the progress of your whistleblower report and communicate with investigators</p>
        </div>
        <ReportStatus />
      </div>
    </div>
  );
};

export default CheckStatusPage;
