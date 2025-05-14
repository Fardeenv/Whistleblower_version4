import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReportsByStatus, investigateReport } from '../api/investigator';
import ReportList from '../components/ReportList';
import { hasRole } from '../services/auth';
import { toast } from 'react-toastify';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState('pending');
  const navigate = useNavigate();
  const isInvestigator = hasRole('investigator');
  
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await getReportsByStatus(activeStatus);
        setReports(data);
      } catch (err) {
        setError(err.message || 'Failed to load reports');
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, [activeStatus]);
  
  const handleStatusChange = (status) => {
    setActiveStatus(status);
  };
  
  const handleInvestigate = async (reportId) => {
    try {
      setLoading(true);
      await investigateReport(reportId);
      toast.success('Report assigned to you for investigation');
      navigate(`/reports/${reportId}`);
    } catch (err) {
      toast.error(err.message || 'Failed to investigate report');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && reports.length === 0) {
    return <div className="loading container">Loading reports...</div>;
  }
  
  if (error && reports.length === 0) {
    return <div className="error-message container">{error}</div>;
  }
  
  return (
    <div className="reports-page container">
      <h1>All Reports</h1>
      
      <div className="status-tabs">
        <button 
          className={`tab-button ${activeStatus === 'pending' ? 'active' : ''}`}
          onClick={() => handleStatusChange('pending')}
        >
          Pending
        </button>
        <button 
          className={`tab-button ${activeStatus === 'under_investigation' ? 'active' : ''}`}
          onClick={() => handleStatusChange('under_investigation')}
        >
          Under Investigation
        </button>
        <button 
          className={`tab-button ${activeStatus === 'investigation_complete' ? 'active' : ''}`}
          onClick={() => handleStatusChange('investigation_complete')}
        >
          Investigation Complete
        </button>
        <button 
          className={`tab-button ${activeStatus === 'completed' ? 'active' : ''}`}
          onClick={() => handleStatusChange('completed')}
        >
          Permanently Closed
        </button>
      </div>
      
      {loading ? (
        <div className="loading">Refreshing reports...</div>
      ) : (
        <ReportList 
          reports={reports} 
          showActions={isInvestigator && activeStatus === 'pending'}
          onInvestigate={handleInvestigate}
        />
      )}
    </div>
  );
};

export default ReportsPage;
