import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getReportById, reopenInvestigation } from '../api/management';
import { toast } from 'react-toastify';
import io from 'socket.io-client';

const ManagementReportDetailPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reopenReason, setReopenReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showReopenForm, setShowReopenForm] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    let socket;
    
    const fetchReport = async () => {
      try {
        const data = await getReportById(id);
        setReport(data);
        
        // Set up socket for real-time updates
        const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
        socket = io(SOCKET_URL);
        socket.emit('join_report', id);
      } catch (err) {
        setError(err.message || 'Failed to fetch report');
        toast.error('Failed to fetch report');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
    
    return () => {
      if (socket) {
        socket.emit('leave_report', id);
        socket.disconnect();
      }
    };
  }, [id]);
  
  const handleReopen = async (e) => {
    e.preventDefault();
    
    if (!reopenReason.trim()) {
      toast.error('Please provide a reason for reopening the investigation');
      return;
    }
    
    try {
      setProcessing(true);
      const updatedReport = await reopenInvestigation(id, reopenReason);
      setReport(updatedReport);
      setShowReopenForm(false);
      toast.success('Investigation reopened successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to reopen investigation');
    } finally {
      setProcessing(false);
    }
  };
  
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'under_investigation':
        return 'Under Investigation';
      case 'completed':
        return 'Investigation Completed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  if (loading) {
    return <div className="loading container">Loading report details...</div>;
  }
  
  if (error) {
    return <div className="error-message container">{error}</div>;
  }
  
  if (!report) {
    return <div className="not-found container">Report not found</div>;
  }
  
  const isCompleted = report.status === 'completed';
  const isReopened = report.isReopened;
  
  return (
    <div className="container">
      <div className="report-detail">
        <button 
          onClick={() => navigate(-1)} 
          className="back-button"
        >
          Back
        </button>
        
        <h2>Report Details</h2>
        <div className="status-badge">
          Status: <span className={`status-${report.status}`}>{getStatusLabel(report.status)}</span>
          {isReopened && <span className="reopened-badge"> (Reopened)</span>}
        </div>
        
        <div className="report-info">
          <h3>{report.title}</h3>
          <p className="report-meta">
            Submitted on {formatDate(report.date)} by {report.submitter || 'Anonymous'}
          </p>
          
          {report.assignedTo && (
            <div className="assigned-info">
              <strong>Assigned To:</strong> {report.assignedTo}
            </div>
          )}
          
          {report.department && (
            <div className="report-detail-item">
              <strong>Department:</strong> {report.department}
            </div>
          )}
          
          {report.location && (
            <div className="report-detail-item">
              <strong>Location:</strong> {report.location}
            </div>
          )}
          
          {report.monetaryValue && (
            <div className="report-detail-item">
              <strong>Estimated Value:</strong> {report.monetaryValue}
            </div>
          )}
          
          {report.relationship && (
            <div className="report-detail-item">
              <strong>Relationship:</strong> {report.relationship}
            </div>
          )}
          
          {report.encounter && (
            <div className="report-detail-item">
              <strong>Encounter:</strong> {report.encounter}
            </div>
          )}
          
          <div className="criticality-indicator">
            <span>Criticality: </span>
            <span className={`criticality-${report.criticality}`}>
              {report.criticality} / 5
            </span>
          </div>
          
          {isReopened && (
            <div className="reopen-info">
              <h4>Reopened Case</h4>
              <p>Previously investigated by: {report.previousInvestigator}</p>
              <p>Reason: {report.reopenReason}</p>
            </div>
          )}
          
          {report.hasVoiceNote && (
            <div className="voice-note-player">
              <h4>Voice Recording</h4>
              <audio controls>
                <source src={report.voiceNote} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          
          <div className="report-description">
            <h4>Description:</h4>
            <p>{report.description}</p>
          </div>
        </div>
        
        <div className="report-id">
          <strong>Report ID:</strong> {report.id}
        </div>
        
        {report.rewardWallet && (
          <div className="wallet-info">
            <strong>Reward Wallet:</strong> 
            <span className="wallet-address">{report.rewardWallet}</span>
          </div>
        )}
        
        {/* Management summary section */}
        {report.managementSummary && (
          <div className="management-update-component">
            <h3>Investigation Summary</h3>
            <div className="summary-content">
              <p>{report.managementSummary}</p>
            </div>
            <div className="summary-meta">
              <p>Provided by: {report.assignedTo || report.previousInvestigator}</p>
            </div>
          </div>
        )}
        
        {/* Action buttons for management */}
        <div className="action-buttons">
          {isCompleted && !showReopenForm && (
            <button 
              onClick={() => setShowReopenForm(true)}
              className="reopen-button"
            >
              Reopen Investigation
            </button>
          )}
        </div>
        
        {/* Reopen form */}
        {showReopenForm && (
          <div className="reopen-form">
            <h4>Reopen Investigation</h4>
            <form onSubmit={handleReopen}>
              <div className="form-group">
                <label htmlFor="reopenReason">Reason for Reopening</label>
                <textarea
                  id="reopenReason"
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Provide detailed reason for reopening this investigation..."
                  rows="4"
                  required
                />
              </div>
              
              <div className="form-footer">
                <button
                  type="button"
                  onClick={() => setShowReopenForm(false)}
                  className="cancel-button"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="reopen-button"
                  disabled={processing || !reopenReason.trim()}
                >
                  {processing ? 'Processing...' : 'Confirm Reopen'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Chat history display for management */}
        <div className="chat-history">
          <h3>Communication History</h3>
          <div className="chat-container">
            {report.chatHistory && report.chatHistory.length > 0 ? (
              <div className="chat-messages">
                {report.chatHistory.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`chat-message ${msg.sender === 'whistleblower' ? 'incoming' : 'outgoing'}`}
                  >
                    <div className="message-content">
                      <div>{msg.content}</div>
                      
                      {msg.hasAttachment && (
                        <div className="attachment-container">
                          {msg.attachment && msg.attachment.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <div className="image-attachment">
                              <img src={msg.attachment} alt="Attached" />
                            </div>
                          ) : (
                            <div className="file-attachment">
                              <a href={msg.attachment} download target="_blank" rel="noopener noreferrer">
                                📎 {msg.attachmentName || 'Download attachment'}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="message-meta">
                      <span className="message-time">
                        {formatDate(msg.timestamp)} by {msg.sender === 'whistleblower' ? 'Whistleblower' : msg.sender}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-messages">No messages in this report.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementReportDetailPage;
