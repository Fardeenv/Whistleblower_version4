import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { submitReport } from '../api/whistleblower';

// Form validation schema
const reportSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  submitter: yup.string(),
  criticality: yup.number().min(1).max(5).required('Criticality is required'),
  rewardWallet: yup.string()
});

const ReportForm = ({ onSubmitSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(reportSchema),
    defaultValues: {
      title: '',
      description: '',
      submitter: '',
      criticality: 3,
      rewardWallet: ''
    }
  });
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await submitReport(data);
      reset();
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
      <p className="form-intro">All reports are encrypted and stored securely on the blockchain. Your privacy and security are our top priorities.</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="title">Report Title</label>
          <input 
            id="title"
            type="text" 
            {...register('title')}
            placeholder="Briefly describe the issue (e.g., 'Financial Misconduct in Accounting Department')"
          />
          {errors.title && <span className="error">{errors.title.message}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Detailed Description</label>
          <textarea 
            id="description"
            {...register('description')}
            rows="8"
            placeholder="Provide detailed information about the incident or concern. Include dates, names, locations, and any other relevant details to help with the investigation."
          ></textarea>
          {errors.description && <span className="error">{errors.description.message}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="criticality">Criticality Level</label>
          <select id="criticality" {...register('criticality')}>
            <option value="1">1 - Low (Minor policy violation)</option>
            <option value="2">2 - Somewhat concerning (Potential misconduct)</option>
            <option value="3">3 - Moderate (Serious misconduct)</option>
            <option value="4">4 - Serious (Significant violation or fraud)</option>
            <option value="5">5 - Critical (Severe violation, safety risk, or large-scale fraud)</option>
          </select>
          <div className="form-help">How serious do you consider this issue? This helps prioritize investigation.</div>
          {errors.criticality && <span className="error">{errors.criticality.message}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="submitter">Your Identity (Optional)</label>
          <input 
            id="submitter"
            type="text" 
            {...register('submitter')}
            placeholder="Anonymous"
          />
          <div className="form-help">Leave blank to remain completely anonymous. Any identification is optional.</div>
        </div>
        
        <div className="form-group">
          <label htmlFor="rewardWallet">Crypto Wallet Address (Optional)</label>
          <input 
            id="rewardWallet"
            type="text" 
            {...register('rewardWallet')}
            placeholder="Your cryptocurrency wallet address for rewards"
          />
          <div className="form-help">
            If your report leads to successful action, you may receive a reward.
            This remains anonymous and is not linked to your identity.
          </div>
        </div>
        
        <div className="form-footer">
          <button 
            type="submit" 
            className="submit-button" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;
