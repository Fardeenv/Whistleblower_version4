import React, { useState } from 'react';
import { updateManagementSummary } from '../api/investigator';
import { toast } from 'react-toastify';

const ManagementUpdateComponent = ({ reportId, initialSummary = '', onSummaryUpdate, disabled = false }) => {
  const [summary, setSummary] = useState(initialSummary);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!summary.trim() || saving || disabled) {
      return;
    }
    
    try {
      setSaving(true);
      const updatedReport = await updateManagementSummary(reportId, summary.trim());
      toast.success('Management summary updated successfully');
      
      if (onSummaryUpdate) {
        onSummaryUpdate(summary);
      }
    } catch (err) {
      setError(err.message || 'Failed to update management summary');
      toast.error('Failed to update management summary');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="management-update-component">
      <h3>Management Update</h3>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="managementSummary">
            Investigation Summary (visible only to management)
          </label>
          <textarea
            id="managementSummary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder={disabled ? "Management updates are disabled" : "Provide a summary of your investigation for management..."}
            rows="6"
            disabled={disabled || saving}
          />
          <div className="form-help">
            This summary will only be visible to management personnel. It should include your findings,
            conclusions, and recommendations related to this whistleblower report.
          </div>
        </div>
        
        <div className="form-footer">
          <button
            type="submit"
            className="submit-button"
            disabled={disabled || !summary.trim() || saving}
          >
            {saving ? 'Saving...' : 'Save Summary'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManagementUpdateComponent;
