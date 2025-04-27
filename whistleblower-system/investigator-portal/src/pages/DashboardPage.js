import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStatistics, getUnassignedReports, getMyReports } from '../api/investigator';
import StatisticsCard from '../components/StatisticsCard';
import StatisticsChart from '../components/StatisticsChart';
import ReportList from '../components/ReportList';
import { toast } from 'react-toastify';

const DashboardPage = () => {
  const [statistics, setStatistics] = useState(null);
  const [unassignedReports, setUnassignedReports] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const [statsData, unassigned, myActiveReports] = await Promise.all([
          getStatistics(),
          getUnassignedReports(),
          getMyReports()
        ]);
        
        setStatistics(statsData);
        setUnassignedReports(unassigned);
        
        // Filter my reports to only show active ones
        setMyReports(myActiveReports.filter(r => r.status === 'under_investigation'));
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading && !statistics) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }
  
  if (error && !statistics) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
        <div className="page-actions">
          <Link to="/reports" className="view-button">View All Reports</Link>
        </div>
      </div>
      
      {statistics && (
        <>
          <div className="statistics-cards">
            <StatisticsCard 
              title="Total Reports" 
              value={statistics.totalReports}
              icon="📊"
              color="#4361ee"
            />
            <StatisticsCard 
              title="Pending Reports" 
              value={statistics.byStatus.pending}
              icon="⏳"
              color="#ff9f1c"
            />
            <StatisticsCard 
              title="Under Investigation" 
              value={statistics.byStatus.under_investigation}
              icon="🔍"
              color="#7209b7"
            />
            <StatisticsCard 
              title="Completed" 
              value={statistics.byStatus.completed}
              icon="✅"
              color="#2ec4b6"
            />
          </div>
          
          <StatisticsChart data={statistics} />
        </>
      )}
      
      <div className="dashboard-reports">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>My Active Cases</h2>
            <Link to="/my-cases" className="view-all">View All My Cases</Link>
          </div>
          
          {myReports.length > 0 ? (
            <ReportList reports={myReports.slice(0, 5)} />
          ) : (
            <div className="card">
              <p className="no-reports">You currently have no active cases.</p>
            </div>
          )}
        </div>
        
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Unassigned Reports</h2>
            <Link to="/reports" className="view-all">View All Reports</Link>
          </div>
          
          {unassignedReports.length > 0 ? (
            <ReportList 
              reports={unassignedReports.slice(0, 5)} 
              showActions={true}
              onAssign={(id) => {
                toast.info(`Navigate to report ${id} to assign`);
              }}
            />
          ) : (
            <div className="card">
              <p className="no-reports">There are no unassigned reports at this time.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
