import React, { useState, useEffect } from 'react';
import { getMyReports } from '../api/investigator';
import ReportList from '../components/ReportList';
import { hasRole } from '../services/auth';
import { toast } from 'react-toastify';
import { Navigate } from 'react-router-dom';

const MyCasesPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const isInvestigator = hasRole('investigator');

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

  // Handle redirect after hooks are called
  if (!isInvestigator) {
    return <Navigate to="/dashboard" />;
  }

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(report => report.status === filter);

  if (loading && reports.length === 0) {
    return <div className="loading container">Loading your cases...</div>;
  }

  if (error && reports.length === 0) {
    return <div className="error-message container">{error}</div>;
  }

  return (
    <div className="my-cases-page container">
      <h1>My Cases</h1>

      <div className="filter-tabs">
        <button 
          className={`tab-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`tab-button ${filter === 'under_investigation' ? 'active' : ''}`}
          onClick={() => setFilter('under_investigation')}
        >
          Active
        </button>
        <button 
          className={`tab-button ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      {loading ? (
        <div className="loading">Refreshing cases...</div>
      ) : (
        <ReportList reports={filteredReports} />
      )}
    </div>
  );
};

export default MyCasesPage;
