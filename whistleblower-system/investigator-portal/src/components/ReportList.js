import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const ReportList = ({ reports, showActions = false, onAssign }) => {
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
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳ ';
      case 'under_investigation':
        return '🔍 ';
      case 'completed':
        return '✅ ';
      default:
        return '';
    }
  };
  
  if (!reports || reports.length === 0) {
    return <div className="no-reports">No reports found</div>;
  }
  
  return (
    <div className="report-list">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Date</th>
            <th>Criticality</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(report => (
            <tr key={report.id}>
              <td className="report-id">{report.id.substring(0, 8)}...</td>
              <td className="report-title">{report.title}</td>
              <td>{formatDate(report.date)}</td>
              <td>{renderCriticalityBadge(report.criticality)}</td>
              <td>
                <span className={`status-badge status-${report.status}`}>
                  {getStatusIcon(report.status)}{getStatusLabel(report.status)}
                </span>
              </td>
              <td className="actions">
                <Link to={`/reports/${report.id}`} className="view-button">
                  View Details
                </Link>
                
                {showActions && report.status === 'pending' && (
                  <button 
                    onClick={() => onAssign(report.id)}
                    className="assign-button"
                  >
                    Assign to Me
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportList;
