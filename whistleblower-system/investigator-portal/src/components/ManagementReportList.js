import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const ManagementReportList = ({ reports }) => {
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
  
  if (!reports || reports.length === 0) {
    return <div className="no-reports">No reports found</div>;
  }
  
  return (
    <div className="report-list management-report-list">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Submitted</th>
            <th>Criticality</th>
            <th>Status</th>
            <th>Investigator</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(report => (
            <tr key={report.id} className={report.isReopened ? 'reopened-report' : ''}>
              <td className="report-id">{report.id.substring(0, 8)}...</td>
              <td className="report-title">{report.title}</td>
              <td>{formatDate(report.date)}</td>
              <td>{renderCriticalityBadge(report.criticality)}</td>
              <td>
                <span className={`status-badge status-${report.status}`}>
                  {getStatusLabel(report.status)}
                </span>
                {report.isReopened && <span className="reopened-tag">↻</span>}
              </td>
              <td className="investigator-column">
                {report.assignedTo || (report.previousInvestigator ? `Previously: ${report.previousInvestigator}` : 'None')}
              </td>
              <td className="actions">
                <Link to={`/reports/${report.id}`} className="view-button">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManagementReportList;
