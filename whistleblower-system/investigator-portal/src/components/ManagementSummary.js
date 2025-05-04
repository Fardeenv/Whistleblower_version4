import React, { useState } from 'react';
import { addManagementSummary } from '../api/investigator';
import { toast } from 'react-toastify';
import { getCurrentUser, hasRole } from '../services/auth';

const ManagementSummary = ({ reportId, summary, onSummaryAdded, disabled = false }) => {
  const [summaryContent, setSummaryContent] = useState(summary || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const user = getCurrentUser();
  const isInvestigator = hasRole('investigator');
  const isManagement = hasRole('management');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!summaryContent.trim() || isSubmitting || disabled) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const result = await addManagementSummary(reportId, summaryContent.trim());
      toast.success('Management summary added successfully');
      
      if (onSummaryAdded) {
        onSummaryAdded(result);
      }
    } catch (err) {
      setError(err.message || 'Failed to add management summary');
      toast.error('Failed to add management summary');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isInvestigator && !isManagement) {
    return null;
  }
  
  return (
    <div className="management-summary">
      <h3>Management Summary</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      {isManagement && !summary && (
        <div className="no-summary">
          <p>No management summary has been provided by the investigator yet.</p>
        </div>
      )}
      
      {isManagement && summary && (
        <div className="summary-content">
          <p>{summary}</p>
        </div>
      )}
      
      {isInvestigator && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <textarea
              value={summaryContent}
              onChange={(e) => setSummaryContent(e.target.value)}
              placeholder={disabled ? "Management summary cannot be edited after completion" : "Provide a summary of your investigation for management..."}
              disabled={disabled || isSubmitting}
              rows="5"
            />
          </div>
          
          {!disabled && (
            <button 
              type="submit" 
              className="submit-button"
              disabled={disabled || !summaryContent.trim() || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : summary ? 'Update Summary' : 'Add Summary'}
            </button>
          )}
        </form>
      )}
    </div>
  );
};

export default ManagementSummary;
