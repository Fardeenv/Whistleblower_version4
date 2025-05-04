import React, { useState } from 'react';
import { reopenInvestigation } from '../api/management';
import { toast } from 'react-toastify';

const ReopenReportForm = ({ reportId, onReopen }) => {
  const [reopenReason, setReopenReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reopenReason.trim() || submitting) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const response = await reopenInvestigation(reportId, reopenReason);
      
      toast.success('Investigation reopened successfully');
      
      if (onReopen) {
        onReopen(response);
      }
    } catch (err) {
      setError(err.message || 'Failed to reopen investigation');
      toast.error('Failed to reopen investigation');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="reopen-report-form">
      <h3>Reopen Investigation</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="reopenReason">
            Reason for Reopening
            <span className="form-required">*</span>
          </label>
          <textarea
            id="reopenReason"
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            placeholder="Explain why this investigation needs to be reopened..."
            rows="5"
            required
          ></textarea>
        </div>
        
        <div className="form-footer">
          <button
            type="submit"
            className="submit-button"
            disabled={!reopenReason.trim() || submitting}
          >
            {submitting ? 'Processing...' : 'Reopen Investigation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReopenReportForm;
