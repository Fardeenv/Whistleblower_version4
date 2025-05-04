import React, { useState } from 'react';
import { reopenInvestigation } from '../api/investigator';
import { toast } from 'react-toastify';

const ReopenInvestigationForm = ({ reportId, onInvestigationReopened }) => {
  const [reopenReason, setReopenReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reopenReason.trim()) {
      toast.error('Please provide a reason for reopening the investigation');
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await reopenInvestigation(reportId, reopenReason);
      toast.success('Investigation reopened successfully');
      if (onInvestigationReopened) {
        onInvestigationReopened(response);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to reopen investigation');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="reopen-form">
      <h3>Reopen Investigation</h3>
      <p className="form-info">
        If you are not satisfied with the investigation outcome, you can reopen this case.
        Please provide a reason for reopening the investigation.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            placeholder="Enter reason for reopening the investigation..."
            rows="4"
            disabled={submitting}
            required
          />
        </div>
        
        <button
          type="submit"
          className="reopen-button"
          disabled={submitting || !reopenReason.trim()}
        >
          {submitting ? 'Processing...' : 'Reopen Investigation'}
        </button>
      </form>
    </div>
  );
};

export default ReopenInvestigationForm;
