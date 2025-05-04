import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllReportsForManagement } from '../api/investigator';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const ManagementPage = () => {
 const [reports, setReports] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [filter, setFilter] = useState('all');
 
 useEffect(() => {
   const fetchReports = async () => {
     try {
       setLoading(true);
       const data = await getAllReportsForManagement();
       setReports(data);
     } catch (err) {
       setError(err.message || 'Failed to load reports');
       toast.error('Failed to load reports');
     } finally {
       setLoading(false);
     }
   };
   
   fetchReports();
 }, []);
 
 const getFilteredReports = () => {
   if (filter === 'all') {
     return reports;
   }
   return reports.filter(report => report.status === filter);
 };
 
 const formatDate = (dateString) => {
   try {
     return format(new Date(dateString), 'MMM d, yyyy');
   } catch (e) {
     return dateString;
   }
 };
 
 const renderCriticalityBadge = (level) => {
   let color;
   let label;
   
   switch (parseInt(level)) {
     case 1:
       color = 'success';
       label = 'Low';
       break;
     case 2:
       color = 'success';
       label = 'Mild';
       break;
     case 3:
       color = 'warning';
       label = 'Medium';
       break;
     case 4:
       color = 'danger';
       label = 'High';
       break;
     case 5:
       color = 'danger';
       label = 'Critical';
       break;
     default:
       color = 'info';
       label = 'Unknown';
   }
   
   return (
     <span className={`badge badge-${color}`}>
       {label} ({level})
     </span>
   );
 };
 
 const getStatusLabel = (status) => {
   switch (status) {
     case 'pending':
       return 'Pending';
     case 'under_investigation':
       return 'Under Investigation';
     case 'completed':
       return 'Completed';
     default:
       return status.charAt(0).toUpperCase() + status.slice(1);
   }
 };
 
 if (loading) {
   return <div className="loading">Loading reports...</div>;
 }
 
 if (error) {
   return <div className="error-message">{error}</div>;
 }
 
 const filteredReports = getFilteredReports();
 
 return (
   <div className="management-page">
     <div className="page-header">
       <h1>Management Dashboard</h1>
       <p className="page-description">Manage and review all whistleblower reports across the organization</p>
     </div>
     
     <div className="filter-tabs">
       <button 
         className={`tab-button ${filter === 'all' ? 'active' : ''}`}
         onClick={() => setFilter('all')}
       >
         All Reports
       </button>
       <button 
         className={`tab-button ${filter === 'pending' ? 'active' : ''}`}
         onClick={() => setFilter('pending')}
       >
         Pending
       </button>
       <button 
         className={`tab-button ${filter === 'under_investigation' ? 'active' : ''}`}
         onClick={() => setFilter('under_investigation')}
       >
         Under Investigation
       </button>
       <button 
         className={`tab-button ${filter === 'completed' ? 'active' : ''}`}
         onClick={() => setFilter('completed')}
       >
         Completed
       </button>
     </div>
     
     <div className="report-list">
       {filteredReports.length === 0 ? (
         <div className="no-reports">No reports found</div>
       ) : (
         <table>
           <thead>
             <tr>
               <th>ID</th>
               <th>Title</th>
               <th>Date</th>
               <th>Criticality</th>
               <th>Status</th>
               <th>Assigned To</th>
               <th>Action</th>
             </tr>
           </thead>
           <tbody>
             {filteredReports.map(report => (
               <tr key={report.id}>
                 <td className="report-id">{report.maskedId}</td>
                 <td className="report-title">{report.title}</td>
                 <td>{formatDate(report.date)}</td>
                 <td>{renderCriticalityBadge(report.criticality)}</td>
                 <td>
                   <span className={`status-badge status-${report.status}`}>
                     {getStatusLabel(report.status)}
                   </span>
                 </td>
                 <td>
                   {report.assignedTo ? report.assignedTo : 'Unassigned'}
                 </td>
                 <td>
                   <Link to={`/reports/${report.id}`} className="view-button">
                     View Details
                   </Link>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       )}
     </div>
   </div>
 );
};

export default ManagementPage;
