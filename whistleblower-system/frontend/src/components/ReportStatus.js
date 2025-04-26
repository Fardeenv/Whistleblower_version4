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
      <p>Enter your report ID to check its current status</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="reportId">Report ID</label>
          <input 
            id="reportId"
            type="text" 
            value={reportId}
            onChange={(e) => setReportId(e.target.value)}
            placeholder="Enter your report ID"
          />
        </div>
        
        <button type="submit" className="submit-button">
          Check Status
        </button>
      </form>
    </div>
  );
};

export default ReportStatus;
