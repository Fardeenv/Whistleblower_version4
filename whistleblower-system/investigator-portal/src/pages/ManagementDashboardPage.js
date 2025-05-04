import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getManagementStatistics, getAllReports } from '../api/management';
import StatisticsCard from '../components/StatisticsCard';
import ManagementReportList from '../components/ManagementReportList';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';

const ManagementDashboardPage = () => {
  const [statistics, setStatistics] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [reopenedReports, setReopenedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const [statsData, allReports] = await Promise.all([
          getManagementStatistics(),
          getAllReports()
        ]);
        
        setStatistics(statsData);
        
        // Sort reports by date (newest first)
        const sortedReports = [...allReports].sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        
        // Get the 5 most recent reports
        setRecentReports(sortedReports.slice(0, 5));
        
        // Get reopened reports
        setReopenedReports(sortedReports.filter(r => r.isReopened));
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const formatInvestigatorData = () => {
    if (!statistics || !statistics.byInvestigator) return [];
    
    return Object.entries(statistics.byInvestigator).map(([name, data]) => ({
      name,
      completed: data.completed,
      active: data.under_investigation
    }));
  };
  
  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }
  
  if (error) {
    return <div className="error-message container">{error}</div>;
  }
  
  return (
    <div className="dashboard-page container">
      <h1>Management Dashboard</h1>
      
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
            <StatisticsCard 
              title="Reopened Cases" 
              value={statistics.reopenedReports}
              icon="↻"
              color="#e74c3c"
            />
          </div>
          
          <div className="chart-container">
            <h3>Investigator Workload</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formatInvestigatorData()} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="active" name="Active Cases" fill="#3498db" />
                <Bar dataKey="completed" name="Completed Cases" fill="#2ecc71" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
      
      <div className="dashboard-reports">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Reports</h2>
            <Link to="/reports" className="view-all">View All Reports</Link>
          </div>
          
          <ManagementReportList reports={recentReports} />
        </div>
        
        {reopenedReports.length > 0 && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Reopened Reports</h2>
            </div>
            
            <ManagementReportList reports={reopenedReports} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagementDashboardPage;
