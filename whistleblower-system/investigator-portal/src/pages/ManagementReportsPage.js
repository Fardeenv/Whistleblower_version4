import React, { useState, useEffect } from 'react';
import { getAllReports } from '../api/management';
import ManagementReportList from '../components/ManagementReportList';
import { toast } from 'react-toastify';

const ManagementReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState('all');
  
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await getAllReports(activeStatus !== 'all' ? activeStatus : null);
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
          className={`tab-button ${activeStatus === 'all' ? 'active' : ''}`}
          onClick={() => handleStatusChange('all')}
        >
          All Reports
        </button>
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
          className={`tab-button ${activeStatus === 'completed' ? 'active' : ''}`}
          onClick={() => handleStatusChange('completed')}
        >
          Completed
        </button>
      </div>
      
      {loading ? (
        <div className="loading">Refreshing reports...</div>
      ) : (
        <ManagementReportList reports={reports} />
      )}
    </div>
  );
};

export default ManagementReportsPage;
