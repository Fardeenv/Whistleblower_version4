import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStatistics, getUnassignedReports, getMyReports } from '../api/investigator';
import StatisticsCard from '../components/StatisticsCard';
import StatisticsChart from '../components/StatisticsChart';
import ReportList from '../components/ReportList';
import { hasRole } from '../services/auth';
import { toast } from 'react-toastify';

const DashboardPage = () => {
  const [statistics, setStatistics] = useState(null);
  const [unassignedReports, setUnassignedReports] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isInvestigator = hasRole('investigator');
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const statsData = await getStatistics();
        setStatistics(statsData);
        
        const unassigned = await getUnassignedReports();
        setUnassignedReports(unassigned);
        
        // Only fetch my reports for investigators
        if (isInvestigator) {
          const myActiveReports = await getMyReports();
          // Filter my reports to only show active ones
          setMyReports(myActiveReports.filter(r => r.status === 'under_investigation'));
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [isInvestigator]);
  
  const handleInvestigate = (reportId) => {
    // This would be handled better in a real app with state management
    toast.info(`Navigate to report ${reportId} to investigate`);
  };
  
  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }
  
  if (error) {
    return <div className="error-message container">{error}</div>;
  }
  
  return (
    <div className="dashboard-page container">
      <h1>Dashboard</h1>
      
      {statistics && (
        <>
          <div className="statistics-cards">
            <StatisticsCard 
              title="Total Reports" 
              value={statistics.totalReports}
              icon="📊"
              color="#3498db"
            />
            <StatisticsCard 
              title="Pending Reports" 
              value={statistics.byStatus.pending}
              icon="⏳"
              color="#fdcb6e"
            />
            <StatisticsCard 
              title="Under Investigation" 
              value={statistics.byStatus.under_investigation}
              icon="🔍"
              color="#74b9ff"
            />
            <StatisticsCard 
              title="Completed" 
              value={statistics.byStatus.completed}
              icon="✅"
              color="#55efc4"
            />
          </div>
          
          <StatisticsChart data={statistics} />
        </>
      )}
      
      <div className="dashboard-reports">
        {isInvestigator && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>My Active Cases</h2>
              <Link to="/my-cases" className="view-all">View All</Link>
            </div>
            
            {myReports.length > 0 ? (
              <ReportList 
                reports={myReports.slice(0, 5)} 
              />
            ) : (
              <div className="no-reports">You have no active cases at this time.</div>
            )}
          </div>
        )}
        
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Unassigned Reports</h2>
            <Link to="/reports" className="view-all">View All</Link>
          </div>
          
          {unassignedReports.length > 0 ? (
            <ReportList 
              reports={unassignedReports.slice(0, 5)} 
              showActions={isInvestigator}
              onInvestigate={handleInvestigate}
            />
          ) : (
            <div className="no-reports">There are no unassigned reports at this time.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
