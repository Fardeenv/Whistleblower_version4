import React, { useState } from 'react';
import { submitInvestigationSummary, reopenInvestigation } from '../api/investigator';
import { getCurrentUser, isManagement, isInvestigator } from '../services/auth';
import { toast } from 'react-toastify';

const ManagementUpdateTab = ({ report, onUpdate }) => {
  const [summary, setSummary] = useState(report.investigationSummary || '');
  const [reopenReason, setReopenReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReopening, setIsReopening] = useState(false);
  
  const currentUser = getCurrentUser();
  const isUserManagement = isManagement();
  const isUserInvestigator = isInvestigator();
  
  const handleSubmitSummary = async (e) => {
    e.preventDefault();
    
    if (!summary.trim()) {
      toast.error('Please enter a summary of your investigation');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const updatedReport = await submitInvestigationSummary(report.id, summary);
      toast.success('Investigation summary submitted successfully');
      if (onUpdate) onUpdate(updatedReport);
    } catch (error) {
      toast.error(error.message || 'Failed to submit investigation summary');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReopenInvestigation = async (e) => {
    e.preventDefault();
    
    if (!reopenReason.trim()) {
      toast.error('Please provide a reason for reopening the investigation');
      return;
    }
    
    try {
      setIsReopening(true);
      const updatedReport = await reopenInvestigation(report.id, reopenReason);
      toast.success('Investigation reopened successfully');
      if (onUpdate) onUpdate(updatedReport);
    } catch (error) {
      toast.error(error.message || 'Failed to reopen investigation');
    } finally {
      setIsReopening(false);
    }
  };
  
  // For investigator assigned to the case
  const renderInvestigatorView = () => {
    const canEdit = report.status !== 'completed';
    const isAssigned = report.assignedTo === currentUser?.id;
    
    if (!isAssigned) {
      return <p>You are not assigned to this investigation.</p>;
    }
    
    return (
      <div className="summary-form">
        <h3>Investigation Summary</h3>
        <p className="form-info">
          Provide a detailed summary of your investigation before marking it as complete.
          This will be visible to management for review.
        </p>
        
        <form onSubmit={handleSubmitSummary}>
          <div className="form-group">
            <label htmlFor="summary">Summary</label>
            <textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows="8"
              placeholder="Describe your findings, actions taken, and recommendations..."
              disabled={!canEdit}
            ></textarea>
          </div>
          
          {canEdit && (
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Summary'}
            </button>
          )}
        </form>
      </div>
    );
  };
  
  // For management users
  const renderManagementView = () => {
    return (
      <div className="management-review">
        <div className="investigation-summary">
          <h3>Investigation Summary</h3>
          
          {report.investigationSummary ? (
            <>
              <div className="summary-meta">
                <p>Investigator: <strong>{report.assignedTo || 'Unassigned'}</strong></p>
              </div>
              
              <div className="summary-content">
                <p>{report.investigationSummary}</p>
              </div>
            </>
          ) : (
            <p className="no-summary">No investigation summary has been submitted yet.</p>
          )}
        </div>
        
        {report.status === 'completed' && (
          <div className="reopen-section">
            <h3>Reopen Investigation</h3>
            <p className="form-info">
              If you find the investigation unsatisfactory, you can reopen it to be assigned to a different investigator.
            </p>
            
            <form onSubmit={handleReopenInvestigation}>
              <div className="form-group">
                <label htmlFor="reopenReason">Reason for Reopening</label>
                <textarea
                  id="reopenReason"
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  rows="4"
                  placeholder="Explain why this investigation needs to be reopened..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="reopen-button"
                disabled={isReopening}
              >
                {isReopening ? 'Processing...' : 'Reopen Investigation'}
              </button>
            </form>
          </div>
        )}
        
        {report.reopened && (
          <div className="reopen-history">
            <h3>Reopening History</h3>
            <div className="reopen-info">
              <p>
                <strong>Previously Assigned To:</strong> {report.previousInvestigator || 'Unknown'}
              </p>
              <p>
                <strong>Reason for Reopening:</strong> {report.reopenReason || 'Not specified'}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="management-update-tab">
      {isUserInvestigator && renderInvestigatorView()}
      {isUserManagement && renderManagementView()}
    </div>
  );
};

export default ManagementUpdateTab;
