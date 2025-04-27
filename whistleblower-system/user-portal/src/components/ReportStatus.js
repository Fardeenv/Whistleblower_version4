import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ReportStatus = () => {
  const [reportId, setReportId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reportId.trim()) {
      setError('Please enter a report ID');
      return;
    }
    navigate(`/reports/${reportId}`);
  };
  
  return (
    <div className="report-status-container">
      <h2>Check Report Status</h2>
      <p className="status-intro">Enter your report ID to check its current status and communicate with investigators</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="report-status-form">
        <div className="form-group">
          <label htmlFor="reportId">Report ID</label>
          <input 
            id="reportId"
            type="text" 
            value={reportId}
            onChange={(e) => setReportId(e.target.value)}
            placeholder="Enter your report ID"
          />
          <div className="form-help">This is the unique ID you received when submitting your report</div>
        </div>
        
        <div className="form-footer">
          <button type="submit" className="submit-button">
            Check Status
          </button>
        </div>
      </form>
      
      <div className="report-status-help">
        <h3>Lost your Report ID?</h3>
        <p>
          For security and anonymity, we cannot retrieve your report ID. 
          Please make sure to save your report ID securely when submitting a report.
          If you've lost it, you may need to submit a new report.
        </p>
      </div>
    </div>
  );
};

export default ReportStatus;
