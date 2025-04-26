import React, { useState } from 'react';
import { submitReport } from '../api/whistleblower';

const ReportForm = ({ onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    submitter: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      setError('Title and description are required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await submitReport(formData);
      onSubmitSuccess(result);
    } catch (err) {
      setError(err.message || 'An error occurred while submitting the report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-form">
      <h2>Submit a Whistleblower Report</h2>
      <p>All reports are encrypted and stored securely on blockchain.</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input 
            id="title"
            name="title"
            type="text" 
            value={formData.title}
            onChange={handleChange}
            placeholder="Briefly describe the issue"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea 
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="6"
            placeholder="Provide details about the incident or concern"
            required
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="submitter">Your Identity (Optional)</label>
          <input 
            id="submitter"
            name="submitter"
            type="text" 
            value={formData.submitter}
            onChange={handleChange}
            placeholder="Anonymous"
          />
          <small>Leave blank to submit anonymously</small>
        </div>
        
        <button 
          type="submit" 
          className="submit-button" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default ReportForm;
