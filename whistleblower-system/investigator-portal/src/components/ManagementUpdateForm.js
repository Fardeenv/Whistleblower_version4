import React, { useState, useEffect } from 'react';
import { submitManagementUpdate } from '../api/investigator';
import { toast } from 'react-toastify';

const ManagementUpdateForm = ({ reportId, existingUpdate = '', onUpdateSubmitted, readOnly = false }) => {
  const [managementUpdate, setManagementUpdate] = useState(existingUpdate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setManagementUpdate(existingUpdate);
  }, [existingUpdate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!managementUpdate.trim() || isSubmitting) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const updatedReport = await submitManagementUpdate(reportId, managementUpdate);
      toast.success('Management update submitted successfully');
      
      if (onUpdateSubmitted) {
        onUpdateSubmitted(updatedReport);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit management update');
      toast.error('Failed to submit management update');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="management-update-form">
      <h3>Management Update</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      {readOnly ? (
        <div className="management-update-content">
          {existingUpdate ? (
            <div className="management-update-text">
              {existingUpdate.split('\n').map((paragraph, i) => (
                paragraph ? <p key={i}>{paragraph}</p> : <br key={i} />
              ))}
            </div>
          ) : (
            <p className="no-update-message">No management update provided yet.</p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="managementUpdate">Investigation Summary (for Management)</label>
            <textarea 
              id="managementUpdate"
              value={managementUpdate}
              onChange={(e) => setManagementUpdate(e.target.value)}
              placeholder="Provide a detailed summary of your investigation findings for management review."
              disabled={isSubmitting || readOnly}
              rows="8"
            ></textarea>
            <div className="form-help">
              This summary will only be visible to management and not to the whistleblower.
            </div>
          </div>
          
          <button 
            type="submit" 
            className="submit-button" 
            disabled={isSubmitting || !managementUpdate.trim() || readOnly}
          >
            {isSubmitting ? 'Submitting...' : existingUpdate ? 'Update Summary' : 'Submit Summary'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ManagementUpdateForm;
