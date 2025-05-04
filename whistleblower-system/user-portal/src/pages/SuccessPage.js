import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheck, FaClipboard, FaFileAlt, FaExclamationTriangle } from 'react-icons/fa';
import { getReportById } from '../api/whistleblower';

const SuccessPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Try to get the report ID from params, then localStorage, then give up
        const reportId = id || localStorage.getItem('reportToken');
        
        if (!reportId) {
          setError('No report ID found. Please check the URL or submit a new report.');
          setLoading(false);
          return;
        }
        
        const data = await getReportById(reportId);
        setReport(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch report details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [id]);
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        alert('Failed to copy to clipboard');
      }
    );
  };
  
  const goToCheckStatus = () => {
    navigate('/check-status');
  };
  
  if (loading) {
    return (
      <div className="success-page">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="success-page">
        <div className="error-container">
          <FaExclamationTriangle className="error-icon" />
          <h2>Error</h2>
          <p>{error}</p>
          <button className="action-button" onClick={() => navigate('/submit-report')}>
            Submit a New Report
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-icon">
          <FaCheck />
        </div>
        
        <h1>Report Submitted Successfully</h1>
        
        <div className="report-details">
          <p className="success-message">
            Your whistleblower report has been securely submitted and encrypted on the blockchain.
          </p>
          
          <div className="report-id-container">
            <h3>Your Report ID</h3>
            <div className="report-id">
              <span>{report?.maskedId || report?.id}</span>
              <button 
                className="copy-button" 
                onClick={() => copyToClipboard(report?.maskedId || report?.id)}
                title="Copy to clipboard"
              >
                <FaClipboard /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="id-note">
              Please save this ID. You will need it to check the status of your report.
            </p>
          </div>
          
          <div className="verification-info">
            <h3>Report Information</h3>
            <div className="info-row">
              <span className="info-label">Submission Date:</span>
              <span className="info-value">
                {new Date(report?.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span className="info-value status-badge">
                {report?.status === 'pending' ? 'Pending Review' : report?.status.replace('_', ' ')}
              </span>
            </div>
            
            {report?.rewardWallet && (
              <div className="info-row">
                <span className="info-label">Reward Address:</span>
                <span className="info-value wallet-address">
                  {report.rewardWallet}
                </span>
              </div>
            )}
          </div>
          
          <div className="next-steps">
            <h3>Next Steps</h3>
            <div className="step">
              <div className="step-icon"><FaFileAlt /></div>
              <div className="step-content">
                <h4>Keep Your ID Safe</h4>
                <p>Store your report ID in a secure location. This is your only way to check updates.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-icon"><FaCheck /></div>
              <div className="step-content">
                <h4>Check for Updates</h4>
                <p>Our investigators will review your report. Check back regularly for updates or questions.</p>
              </div>
            </div>
          </div>
          
          <div className="action-buttons">
            <button className="action-button" onClick={goToCheckStatus}>
              Check Report Status
            </button>
            <button className="action-button secondary" onClick={() => navigate('/')}>
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
