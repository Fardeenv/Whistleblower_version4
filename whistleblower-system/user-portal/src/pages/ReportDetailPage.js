import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReportById } from '../api/whistleblower';
import ChatComponent from '../components/ChatComponent';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import { FaPlay, FaPause, FaVolumeUp } from 'react-icons/fa';

const ReportDetailPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();
  const audioRef = useRef(new Audio());
  
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
    
    // Setup audio player events
    audioRef.current.onended = () => {
      setIsPlaying(false);
    };
    
    return () => {
      if (socket) {
        socket.emit('leave_report', id);
        socket.disconnect();
      }
      
      // Cleanup audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [id]);
  
  const playVoiceNote = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => {
        console.error('Error playing audio:', e);
      });
      setIsPlaying(true);
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
          {report.title && <h3>{report.title}</h3>}
          <p className="report-meta">
            Submitted on {formatDate(report.date)} by {report.submitter || 'Anonymous'}
          </p>
          
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
          
          <div className="criticality-indicator">
            <span>Criticality: </span>
            <span className={`criticality-${report.criticality}`}>
              {report.criticality} / 5
            </span>
          </div>
          
          {report.hasVoiceNote && report.voiceNote && (
            <div className="voice-note-player">
              <h4>Voice Recording</h4>
              <button 
                className="voice-note-button"
                onClick={playVoiceNote}
              >
                {isPlaying ? <FaPause /> : <FaPlay />} 
                <FaVolumeUp /> 
                {isPlaying ? 'Pause Recording' : 'Play Recording'}
              </button>
            </div>
          )}
          
          {report.description && (
            <div className="report-description">
              <h4>Description:</h4>
              <p>{report.description}</p>
            </div>
          )}
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
