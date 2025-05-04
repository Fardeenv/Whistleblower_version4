import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getReportById, investigateReport, completeInvestigation } from '../api/investigator';
import { getCurrentUser, hasRole } from '../services/auth';
import ChatComponent from '../components/ChatComponent';
import ManagementSummary from '../components/ManagementSummary';
import ReopenInvestigation from '../components/ReopenInvestigation';
import { toast } from 'react-toastify';
import io from 'socket.io-client';

const ReportDetailPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showVoiceNote, setShowVoiceNote] = useState(false);
  const audioRef = useRef(new Audio());
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isInvestigator = hasRole('investigator');
  const isManagement = hasRole('management');
  
  useEffect(() => {
    let socket;
    
    const fetchReport = async () => {
      try {
        const data = await getReportById(id);
        setReport(data);
        
        // If report has a voice note, prepare the audio
        if (data.hasVoiceNote && data.voiceNote) {
          audioRef.current.src = `http://localhost:3001${data.voiceNote}`;
          audioRef.current.load();
        }
        
        // Set up socket for real-time updates
        const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
        socket = io(SOCKET_URL);
        socket.emit('join_report', id);
        
        // Listen for status changes
        socket.on('report_status_changed', (update) => {
          if (update.reportId === id) {
            fetchReport(); // Refresh the report data
            toast.info(`Report status changed to: ${update.status.replace('_', ' ')}`);
          }
        });
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
      
      // Clean up audio
      audioRef.current.pause();
    };
  }, [id]);
  
  const handleInvestigate = async () => {
    try {
      setProcessing(true);
      const updatedReport = await investigateReport(id);
      setReport(updatedReport);
      toast.success('Report assigned to you for investigation');
    } catch (err) {
      toast.error(err.message || 'Failed to assign report');
    } finally {
      setProcessing(false);
    }
  };
  
  const handleComplete = async () => {
    try {
      // Check if management summary exists
      if (!report.managementSummary) {
        toast.error('You must add a management summary before completing the investigation');
        return;
      }
      
      setProcessing(true);
      const updatedReport = await completeInvestigation(id);
      setReport(updatedReport);
      
      if (updatedReport.rewardProcessed) {
        toast.success('Investigation completed and reward processed');
      } else {
        toast.success('Investigation completed');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to complete investigation');
    } finally {
      setProcessing(false);
    }
  };
  
  const handleSummaryAdded = (updatedReport) => {
    setReport(updatedReport);
  };
  
  const handleReopen = () => {
    navigate('/reports'); // Navigate to reports page after reopening
  };
  
  const playVoiceNote = () => {
    if (showVoiceNote) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setShowVoiceNote(!showVoiceNote);
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
  
  const isAssigned = isInvestigator && report.assignedTo === currentUser?.id;
  const isPending = report.status === 'pending';
  const isUnderInvestigation = report.status === 'under_investigation';
  const isCompleted = report.status === 'completed';
  
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
          {report.isReopened && <span className="reopened-badge">Reopened</span>}
        </div>
        
        <div className="report-info">
          <h3>{report.title}</h3>
          <p className="report-meta">
            Submitted on {formatDate(report.date)} by {report.submitter || 'Anonymous'}
          </p>
          
          <div className="criticality-indicator">
            <span>Criticality: </span>
            <span className={`criticality-${report.criticality}`}>
              {report.criticality} / 5
            </span>
          </div>
          
          {isManagement && report.assignedToName && (
            <div className="investigator-info">
              <strong>Assigned to:</strong> {report.assignedToName}
            </div>
          )}
          
          {report.isReopened && report.reopenReasons && report.reopenReasons.length > 0 && (
            <div className="reopen-reasons">
              <h4>Reopen Reasons:</h4>
              <ul>
                {report.reopenReasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
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
          
          {report.monetaryValue && (
            <div className="report-detail-item">
              <strong>Monetary Value:</strong> {report.monetaryValue}
            </div>
          )}
          
          {report.hasVoiceNote && report.voiceNote && (
            <div className="voice-note-section">
              <h4>Voice Recording</h4>
              <button 
                className="voice-note-button"
                onClick={playVoiceNote}
              >
                {showVoiceNote ? 'Pause Voice Note' : 'Play Voice Note'}
              </button>
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
        
        <div className="action-buttons">
          {isInvestigator && isPending && !report.previousInvestigators?.includes(currentUser?.id) && (
            <button 
              onClick={handleInvestigate} 
              className="assign-button"
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Investigate'}
            </button>
          )}
          
          {isInvestigator && isUnderInvestigation && isAssigned && (
            <button 
              onClick={handleComplete} 
              className="complete-button"
              disabled={processing || !report.managementSummary}
            >
              {processing ? 'Processing...' : 'Complete Investigation'}
            </button>
          )}
        </div>
        
        {(isInvestigator || isManagement) && (
          <div className="management-summary-section">
            <ManagementSummary 
              reportId={report.id}
              summary={report.managementSummary}
              onSummaryAdded={handleSummaryAdded}
              disabled={!isAssigned || isCompleted}
            />
          </div>
        )}
        
        {isManagement && isCompleted && (
          <div className="reopen-section">
            <ReopenInvestigation 
              reportId={report.id}
              onReopen={handleReopen}
            />
          </div>
        )}
        
        <div className="chat-section">
          <ChatComponent 
            reportId={report.id}
            initialMessages={report.chatHistory || []}
            disabled={isInvestigator && !isAssigned}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;
