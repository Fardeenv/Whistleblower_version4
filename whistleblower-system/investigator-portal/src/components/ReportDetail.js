import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReportById, assignReportToSelf, completeInvestigation, reopenInvestigation } from '../api/investigator';
import { getCurrentUser, hasRole } from '../services/auth';
import ChatComponent from './ChatComponent';
import { format } from 'date-fns';

const ReportDetail = () => {
  const { maskedId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [managementSummary, setManagementSummary] = useState('');
  const [managementComment, setManagementComment] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const user = getCurrentUser();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getReportById(maskedId);
        setReport(data);
        setManagementSummary(data.managementSummary || '');
        setManagementComment(data.managementComment || '');
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch report');
        setLoading(false);
      }
    };

    fetchReport();
  }, [maskedId]);

  const handleAssign = async () => {
    try {
      await assignReportToSelf(maskedId);
      const updatedReport = await getReportById(maskedId);
      setReport(updatedReport);
    } catch (err) {
      setError(err.message || 'Failed to assign report');
    }
  };

  const handleComplete = async () => {
    try {
      await completeInvestigation(maskedId, managementSummary);
      const updatedReport = await getReportById(maskedId);
      setReport(updatedReport);
    } catch (err) {
      setError(err.message || 'Failed to complete investigation');
    }
  };

  const handleReopen = async () => {
    try {
      await reopenInvestigation(maskedId, reopenReason);
      navigate('/reports');
    } catch (err) {
      setError(err.message || 'Failed to reopen investigation');
    }
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!report) {
    return <div>No report found</div>;
  }

  return (
    <div className="report-detail">
      <h2>Report Details</h2>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Communication
        </button>
        {(hasRole('investigator') || hasRole('management')) && (
          <button
            className={`tab ${activeTab === 'management' ? 'active' : ''}`}
            onClick={() => setActiveTab('management')}
          >
            Management Update
          </button>
        )}
      </div>

      {activeTab === 'details' && (
        <div className="report-details-content">
          <div className="report-field">
            <strong>ID:</strong> {report.maskedId}
          </div>
          <div className="report-field">
            <strong>Title:</strong> {report.title}
          </div>
          <div className="report-field">
            <strong>Description:</strong> {report.description}
          </div>
          <div className="report-field">
            <strong>Submitter:</strong> {report.submitter}
          </div>
          <div className="report-field">
            <strong>Date:</strong> {formatDate(report.date)}
          </div>
          <div className="report-field">
            <strong>Status:</strong> {report.status}
          </div>
          <div className="report-field">
            <strong>Criticality:</strong> {renderCriticalityBadge(report.criticality)}
          </div>
          <div className="report-field">
            <strong>Reward Wallet:</strong> {report.rewardWallet || 'None'}
          </div>
          <div className="report-field">
            <strong>Assigned To:</strong> {report.assignedTo || 'Unassigned'}
          </div>
          {hasRole('management') && (
            <div className="report-field">
              <strong>Previous Investigator:</strong> {report.previousInvestigator || 'None'}
            </div>
          )}
          <div className="report-field">
            <strong>Department:</strong> {report.department || 'N/A'}
          </div>
          <div className="report-field">
            <strong>Location:</strong> {report.location || 'N/A'}
          </div>
          <div className="report-field">
            <strong>Monetary Value:</strong> {report.monetaryValue || 'N/A'}
          </div>
          <div className="report-field">
            <strong>Relationship:</strong> {report.relationship || 'N/A'}
          </div>
          <div className="report-field">
            <strong>Encounter:</strong> {report.encounter || 'N/A'}
          </div>
          <div className="report-field">
            <strong>Authorities Aware:</strong> {report.authoritiesAware ? 'Yes' : 'No'}
          </div>
          {report.hasVoiceNote && (
            <div className="report-field">
              <strong>Voice Note:</strong>
              <audio controls>
                <source src={`${process.env.REACT_APP_API_URL}${report.voiceNote}`} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          {report.attachments && report.attachments.length > 0 && (
            <div className="report-field">
              <strong>Attachments:</strong>
              <ul>
                {report.attachments.map((attachment, index) => (
                  <li key={index}>
                    <a
                      href={`${process.env.REACT_APP_API_URL}${attachment.filePath}`}
                      download={attachment.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {attachment.fileName}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === 'chat' && (
        <ChatComponent
          reportId={report.id}
          initialMessages={report.chatHistory}
          initialAttachments={report.attachments}
          disabled={report.status === 'completed'}
        />
      )}

      {activeTab === 'management' && (hasRole('investigator') || hasRole('management')) && (
        <div className="management-update">
          {hasRole('investigator') && report.status === 'under_investigation' && (
            <>
              <h3>Submit Management Summary</h3>
              <textarea
                value={managementSummary}
                onChange={(e) => setManagementSummary(e.target.value)}
                placeholder="Enter your investigation summary for management..."
                disabled={report.status !== 'under_investigation'}
              />
              <button
                onClick={handleComplete}
                disabled={!managementSummary.trim() || report.status !== 'under_investigation'}
                className="complete-button"
              >
                Complete Investigation
              </button>
            </>
          )}
          {hasRole('management') && (
            <>
              <h3>Management Summary</h3>
              <p>{report.managementSummary || 'No summary provided'}</p>
              <h3>Management Comment</h3>
              <p>{report.managementComment || 'No comment provided'}</p>
              {report.status === 'completed' && (
                <>
                  <h3>Reopen Investigation</h3>
                  <textarea
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    placeholder="Reason for reopening investigation..."
                  />
                  <button
                    onClick={handleReopen}
                    disabled={!reopenReason.trim()}
                    className="reopen-button"
                  >
                    Reopen Investigation
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}

      {report.status === 'pending' && hasRole('investigator') && (
        <button
          onClick={handleAssign}
          className="assign-button"
        >
          Investigate
        </button>
      )}
    </div>
  );
};

export default ReportDetail;
