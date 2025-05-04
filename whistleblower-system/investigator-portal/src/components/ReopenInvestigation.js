import React, { useState } from 'react';
import { reopenInvestigation } from '../api/investigator';
import { toast } from 'react-toastify';
import { hasRole } from '../services/auth';

const ReopenInvestigation = ({ reportId, onReopen }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const isManagement = hasRole('management');
  
  if (!isManagement) {
    return null;
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim() || isSubmitting) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await reopenInvestigation(reportId, reason.trim());
      toast.success('Investigation reopened successfully');
      
      if (onReopen) {
        onReopen();
      }
    } catch (err) {
      setError(err.message || 'Failed to reopen investigation');
      toast.error('Failed to reopen investigation');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="reopen-investigation">
      <h3>Reopen Investigation</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="reopen-reason">Reason for Reopening</label>
          <textarea
            id="reopen-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this investigation needs to be reopened..."
            disabled={isSubmitting}
            rows="3"
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={!reason.trim() || isSubmitting}
        >
          {isSubmitting ? 'Reopening...' : 'Reopen Investigation'}
        </button>
      </form>
    </div>
  );
};

export default ReopenInvestigation;
