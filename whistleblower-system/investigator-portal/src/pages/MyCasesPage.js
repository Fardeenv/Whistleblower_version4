import React, { useState, useEffect } from 'react';
import { getMyReports } from '../api/investigator';
import ReportList from '../components/ReportList';
import { toast } from 'react-toastify';

const MyCasesPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    const fetchMyReports = async () => {
      try {
        setLoading(true);
        const data = await getMyReports();
        setReports(data);
      } catch (err) {
        setError(err.message || 'Failed to load your cases');
        toast.error('Failed to load your cases');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyReports();
  }, []);
  
  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(report => report.status === filter);
  
  return (
    <>
      <div className="page-header">
        <h1>My Cases</h1>
        <div className="page-description">
          <p>View and manage cases assigned to you</p>
        </div>
      </div>
      
      <div className="filter-tabs">
        <button 
          className={`tab-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Cases
        </button>
        <button 
          className={`tab-button ${filter === 'under_investigation' ? 'active' : ''}`}
          onClick={() => setFilter('under_investigation')}
        >
          🔍 Active Cases
        </button>
        <button 
          className={`tab-button ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          ✅ Completed Cases
        </button>
      </div>
      
      {loading && reports.length === 0 ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading your cases...</p>
        </div>
      ) : error && reports.length === 0 ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="card">
          {filteredReports.length > 0 ? (
            <ReportList reports={filteredReports} />
          ) : (
            <div className="no-reports">
              {filter === 'all' 
                ? "You don't have any assigned cases yet." 
                : `You don't have any ${filter === 'under_investigation' ? 'active' : 'completed'} cases.`}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MyCasesPage;
