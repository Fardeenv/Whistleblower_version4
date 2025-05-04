import React, { useState } from 'react';
import { reopenInvestigation } from '../api/investigator';
import { toast } from 'react-toastify';

const ReopenCaseForm = ({ reportId, onReopen }) => {
  const [reopenReason, setReopenReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reopenReason.trim() || isSubmitting) {
      return;
    }
    
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const updatedReport = await reopenInvestigation(reportId, reopenReason);
      toast.success('Investigation has been reopened');
      
      if (onReopen) {
        onReopen(updatedReport);
      }
      
      // Reset form
      setReopenReason('');
      setIsConfirming(false);
    } catch (err) {
      setError(err.message || 'Failed to reopen investigation');
      toast.error('Failed to reopen investigation');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    setIsConfirming(false);
  };
  
  return (
    <div className="reopen-case-form">
      <h3>Reopen Investigation</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="reopenReason">Reason for Reopening</label>
          <textarea 
            id="reopenReason"
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            placeholder="Explain why this investigation needs to be reopened."
            disabled={isSubmitting}
            rows="4"
          ></textarea>
          <div className="form-help">
            This reason will be visible to investigators and will be stored with the case history.
          </div>
        </div>
        
        {isConfirming ? (
          <div className="confirmation-buttons">
            <button 
              type="submit" 
              className="confirm-button" 
              disabled={isSubmitting || !reopenReason.trim()}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Reopen'}
            </button>
            
            <button 
              type="button" 
              className="cancel-button" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button 
            type="submit" 
            className="reopen-button" 
            disabled={isSubmitting || !reopenReason.trim()}
          >
            Reopen Investigation
          </button>
        )}
      </form>
    </div>
  );
};

export default ReopenCaseForm;
