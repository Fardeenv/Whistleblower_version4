import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReportById } from '../api/whistleblower';
import ChatComponent from '../components/ChatComponent';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import io from 'socket.io-client';

const ReportDetailPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    let socket;
    
    const fetchReport = async () => {
      try {
        const data = await getReportById(id);
        setReport(data);
        
        // Set up socket listener for status changes
        const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
        socket = io(SOCKET_URL);
        socket.emit('join_report', id);
        
        socket.on('report_status_changed', (update) => {
          if (update.reportId === id) {
            setReport(prev => ({ ...prev, status: update.status }));
            
            let message = `Report status changed to: ${update.status.replace('_', ' ')}`;
            if (update.status === 'completed' && update.rewardProcessed) {
              message += '. Your reward has been processed!';
            }
            
            toast.info(message);
          }
        });
      } catch (err) {
        setError(err.message || 'Failed to fetch report');
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
        return '📋';
    }
  };
  
  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading report details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Error Loading Report</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-button">
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  if (!report) {
    return (
      <div className="container">
        <div className="not-found-container">
          <div className="not-found-icon">🔎</div>
          <h2>Report Not Found</h2>
          <p>The report you're looking for doesn't exist or you may not have access to it.</p>
          <button onClick={() => navigate(-1)} className="back-button">
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container">
      <div className="report-detail">
        <div className="report-header">
          <button 
            onClick={() => navigate(-1)} 
            className="back-button"
          >
            ← Back
          </button>
          
          <div className="report-id-badge">
            <span>Report ID:</span> {report.id}
          </div>
        </div>
        
        <h2>{report.title}</h2>
        
        <div className="report-meta-info">
        <div className={`status-badge status-${report.status}`}>
            {getStatusIcon(report.status)} {getStatusLabel(report.status)}
          </div>
          
          <div className="report-date">
            Submitted on {formatDate(report.date)} by <span className="submitter">{report.submitter || 'Anonymous'}</span>
          </div>
          
          <div className="criticality-indicator">
            <span>Criticality:</span>
            <div className={`criticality-badge criticality-${report.criticality}`}>
              {report.criticality} / 5
            </div>
          </div>
        </div>
        
        <div className="report-description">
          <h4>Description:</h4>
          <div className="description-content">
            {report.description.split("\n").map((paragraph, i) => (
              paragraph ? <p key={i}>{paragraph}</p> : <br key={i} />
            ))}
          </div>
        </div>
        
        {report.rewardWallet && (
          <div className="wallet-info">
            <div className="wallet-info-icon">💰</div>
            <div className="wallet-info-content">
              <h4>Reward Wallet</h4>
              <p>If this report leads to successful action, a reward will be sent to:</p>
              <div className="wallet-address">{report.rewardWallet}</div>
              {report.status === 'completed' && (
                <div className="reward-status">
                  ✓ Investigation completed - reward processing initiated
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="chat-section">
          <ChatComponent 
            reportId={report.id} 
            disabled={report.status === 'completed'} 
          />
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;
