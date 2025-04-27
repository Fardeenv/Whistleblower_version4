import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getReportById, assignReportToSelf, completeInvestigation } from '../api/investigator';
import { getCurrentUser } from '../services/auth';
import ChatComponent from '../components/ChatComponent';
import { toast } from 'react-toastify';
import io from 'socket.io-client';

const ReportDetailPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  
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
  
  const handleAssign = async () => {
    try {
      setProcessing(true);
      const updatedReport = await assignReportToSelf(id);
      setReport(updatedReport);
      toast.success('Report assigned to you successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to assign report');
    } finally {
      setProcessing(false);
    }
  };
  
  const handleComplete = async () => {
    try {
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
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'under_investigation':
        return '🔍';
      case 'completed':
        return '✅';
      default:
        return '📝';
    }
  };
  
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading report details...</p>
      </div>
    );
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!report) {
    return <div className="not-found">Report not found</div>;
  }
  
  const isAssigned = report.assignedTo === currentUser?.id;
  const isPending = report.status === 'pending';
  const isUnderInvestigation = report.status === 'under_investigation';
  const isCompleted = report.status === 'completed';
  
  return (
    <>
      <div className="page-header">
        <button 
          onClick={() => navigate(-1)} 
          className="back-button"
        >
          ← Back
        </button>
        <div className="page-actions">
          {isPending && (
            <button 
              onClick={handleAssign} 
              className="assign-button"
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Assign to Me'}
            </button>
          )}
          
          {isUnderInvestigation && isAssigned && (
            <button 
              onClick={handleComplete} 
              className="complete-button"
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Complete Investigation'}
            </button>
          )}
        </div>
      </div>
      
      <div className="report-detail">
        <div className="report-header">
          <h1>{report.title}</h1>
          <div className="status-badge status-${report.status}">
            {getStatusIcon(report.status)} {getStatusLabel(report.status)}
          </div>
        </div>
        
        <div className="report-meta">
          Submitted on {formatDate(report.date)} by <span className="submitter">{report.submitter || 'Anonymous'}</span>
        </div>
        
        <div className="report-id-box">
          <strong>Report ID:</strong> {report.id}
        </div>
        
        <div className="criticality-indicator">
          <strong>Criticality:</strong> 
          <div className={`criticality-badge criticality-${report.criticality}`}>
            {report.criticality} / 5
          </div>
        </div>
        
        <div className="report-description">
          <h4>Description</h4>
          <div className="description-content">
            {report.description.split('\n').map((paragraph, i) => (
              paragraph ? <p key={i}>{paragraph}</p> : <br key={i} />
            ))}
          </div>
        </div>
        
        {report.rewardWallet && (
          <div className="wallet-info">
            <h4>Reward Wallet</h4>
            <p>If investigation is successful, a reward will be sent to:</p>
            <div className="wallet-address">{report.rewardWallet}</div>
            
            {isCompleted && (
              <div className="reward-status">
                {report.rewardProcessed ? 
                  '✓ Reward has been processed' : 
                  '⚠️ Reward processing pending'}
              </div>
            )}
          </div>
        )}
        
        {isAssigned && (
          <div className="assigned-info card">
            <h4>Case Assignment</h4>
            <p>This case is assigned to you. {!isCompleted && "You can communicate with the whistleblower below."}</p>
          </div>
        )}
        
        <div className="chat-section">
          <ChatComponent 
            reportId={report.id}
            initialMessages={report.chatHistory || []}
            disabled={!isAssigned || isCompleted}
          />
        </div>
      </div>
    </>
  );
};

export default ReportDetailPage;
