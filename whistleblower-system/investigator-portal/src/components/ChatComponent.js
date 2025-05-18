import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { sendChatMessage, markMessagesAsRead } from '../api/investigator';
import { getCurrentUser } from '../services/auth';
import io from 'socket.io-client';
import { FaFile, FaFileAlt, FaFileImage, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileArchive, FaPaperclip, FaDownload, FaTimes } from 'react-icons/fa';

const ChatComponent = ({ reportId, initialMessages = [], disabled = false }) => {
  const [chatHistory, setChatHistory] = useState(initialMessages);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const chatContainerRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const user = getCurrentUser();

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Initialize socket connection
  useEffect(() => {
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
    socketRef.current = io(SOCKET_URL);

    // Join report-specific room
    socketRef.current.emit('join_report', reportId);

    // Listen for new messages
    socketRef.current.on('new_message', (newMessage) => {
      if (newMessage.reportId === reportId) {
        setChatHistory(prev => [...prev, newMessage]);
      }
    });

    // Cleanup on unmount
    return () => {
      socketRef.current.emit('leave_report', reportId);
      socketRef.current.disconnect();
    };
  }, [reportId]);

  // Mark messages as read
  useEffect(() => {
    const markAsRead = async () => {
      if (chatHistory.length > 0) {
        try {
          await markMessagesAsRead(reportId);
        } catch (err) {
          console.error('Error marking messages as read:', err);
        }
      }
    };

    markAsRead();
  }, [reportId, chatHistory]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 15MB)
      if (file.size > 15 * 1024 * 1024) {
        setError('File size exceeds 15MB limit');
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
        'text/csv',
        'application/json',
        'application/zip'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('File type not supported');
        return;
      }
      
      setAttachment(file);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if ((!message.trim() && !attachment) || sending || disabled) {
      return;
    }

    try {
      setSending(true);
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('content', message.trim());
      
      if (attachment) {
        formData.append('chatAttachment', attachment);
      }
      
      await sendChatMessage(reportId, formData);
      setMessage('');
      setAttachment(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'MMM d, yyyy HH:mm');
    } catch (e) {
      return timestamp;
    }
  };

  // Get appropriate icon for file type
  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFile />;
    
    if (fileType.includes('pdf')) return <FaFilePdf />;
    if (fileType.includes('word') || fileType.includes('msword')) return <FaFileWord />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <FaFileExcel />;
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return <FaFilePowerpoint />;
    if (fileType.includes('image')) return <FaFileImage />;
    if (fileType.includes('text') || fileType.includes('json')) return <FaFileAlt />;
    if (fileType.includes('zip') || fileType.includes('archive')) return <FaFileArchive />;
    
    return <FaFile />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="chat-component">
      <h3>Communication with Whistleblower</h3>

      {error && <div className="error-message">{error}</div>}

      <div className="chat-container" ref={chatContainerRef}>
        {chatHistory.length === 0 ? (
          <div className="no-messages">
            No messages yet. {!disabled && "Start the conversation with the whistleblower."}
          </div>
        ) : (
          chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.sender === user?.id ? 'outgoing' : 'incoming'}`}
            >
              <div className="message-content">
                {msg.content}
                
                {/* Render attachment if present */}
                {msg.hasAttachment && msg.attachment && (
                  <div className="chat-attachment">
                    <div className="chat-attachment-icon">
                      {getFileIcon(msg.attachment.fileType)}
                    </div>
                    <div className="chat-attachment-info">
                      <div className="chat-attachment-name">{msg.attachment.fileName}</div>
                      <div className="chat-attachment-size">{formatFileSize(msg.attachment.fileSize)}</div>
                    </div>
                    <a 
                      href={`http://localhost:3001${msg.attachment.filePath}`}
                      className="chat-attachment-download"
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      <FaDownload />
                    </a>
                  </div>
                )}
              </div>
              <div className="message-meta">
                <span className="message-time">{formatTime(msg.timestamp)}</span>
                {msg.sender !== user?.id && (
                  <span className="message-sender">Whistleblower</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <form className="chat-form" onSubmit={handleSendMessage}>
        <div className="chat-input-container">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={disabled ? "Chat is disabled" : "Type your message..."}
            disabled={disabled || sending}
            rows="3"
          />
          
          {attachment && (
            <div className="chat-attachment-preview">
              <div className="attachment-preview-content">
                <div className="chat-attachment-icon">
                  {getFileIcon(attachment.type)}
                </div>
                <div className="chat-attachment-info">
                  <div className="chat-attachment-name">{attachment.name}</div>
                  <div className="chat-attachment-size">{formatFileSize(attachment.size)}</div>
                </div>
                <button
                  type="button"
                  className="remove-attachment-button"
                  onClick={handleRemoveAttachment}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          )}
          
          <div className="chat-actions">
            <input
              type="file"
              id="chat-file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              ref={fileInputRef}
              disabled={disabled || sending}
            />
            <button
              type="button"
              className="attach-button"
              onClick={() => fileInputRef.current.click()}
              disabled={disabled || sending || attachment !== null}
            >
              <FaPaperclip />
            </button>
            
            <button
              type="submit"
              className="send-button"
              disabled={disabled || (!message.trim() && !attachment) || sending}
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
