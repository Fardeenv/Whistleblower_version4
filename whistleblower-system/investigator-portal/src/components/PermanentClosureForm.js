import React, { useState } from 'react';
import { permanentlyCloseCase } from '../api/investigator';
import { toast } from 'react-toastify';
import { hasRole } from '../services/auth';

const PermanentClosureForm = ({ reportId, onClose }) => {
  const [closureSummary, setClosureSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const isManagement = hasRole('management');
  
  if (!isManagement) {
    return null;
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!closureSummary.trim() || isSubmitting) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await permanentlyCloseCase(reportId, closureSummary.trim());
      toast.success('Case permanently closed successfully');
      
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to permanently close case');
      toast.error('Failed to permanently close case');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="permanent-closure-form">
      <h3>Permanently Close Case</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="closure-summary">Closure Summary</label>
          <textarea
            id="closure-summary"
            value={closureSummary}
            onChange={(e) => setClosureSummary(e.target.value)}
            placeholder="Provide a summary for permanently closing this case..."
            disabled={isSubmitting}
            rows="3"
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={!closureSummary.trim() || isSubmitting}
        >
          {isSubmitting ? 'Closing...' : 'Permanently Close Case'}
        </button>
      </form>
    </div>
  );
};

export default PermanentClosureForm;
