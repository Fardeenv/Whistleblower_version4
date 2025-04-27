import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReportsByStatus, assignReportToSelf } from '../api/investigator';
import ReportList from '../components/ReportList';
import { toast } from 'react-toastify';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState('pending');
  const navigate = useNavigate();
  
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
  
  const handleAssign = async (reportId) => {
    try {
      setLoading(true);
      await assignReportToSelf(reportId);
      toast.success('Report assigned to you successfully');
      navigate(`/reports/${reportId}`);
    } catch (err) {
      toast.error(err.message || 'Failed to assign report');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <div className="page-header">
        <h1>Reports</h1>
        <div className="page-description">
          <p>Review and manage all whistleblower reports</p>
        </div>
      </div>
      
      <div className="status-tabs">
        <button 
          className={`tab-button ${activeStatus === 'pending' ? 'active' : ''}`}
          onClick={() => handleStatusChange('pending')}
        >
          ⏳ Pending
        </button>
        <button 
          className={`tab-button ${activeStatus === 'under_investigation' ? 'active' : ''}`}
          onClick={() => handleStatusChange('under_investigation')}
        >
          🔍 Under Investigation
        </button>
        <button 
          className={`tab-button ${activeStatus === 'completed' ? 'active' : ''}`}
          onClick={() => handleStatusChange('completed')}
        >
          ✅ Completed
        </button>
      </div>
      
      {loading && reports.length === 0 ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading reports...</p>
        </div>
      ) : error && reports.length === 0 ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="card">
          <ReportList 
            reports={reports} 
            showActions={activeStatus === 'pending'}
            onAssign={handleAssign}
          />
        </div>
      )}
    </>
  );
};

export default ReportsPage;
