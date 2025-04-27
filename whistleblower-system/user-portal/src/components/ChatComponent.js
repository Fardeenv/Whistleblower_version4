import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { getChatHistory, sendChatMessage, markMessagesAsRead } from '../api/whistleblower';
import io from 'socket.io-client';

const ChatComponent = ({ reportId, disabled = false }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const chatContainerRef = useRef(null);
  const socketRef = useRef(null);
  
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
  
  // Load chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setLoading(true);
        const history = await getChatHistory(reportId);
        setChatHistory(history);
        
        // Mark messages as read
        if (history.length > 0) {
          await markMessagesAsRead(reportId);
        }
      } catch (err) {
        setError(err.message || 'Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatHistory();
  }, [reportId]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || sending || disabled) {
      return;
    }
    
    try {
      setSending(true);
      await sendChatMessage(reportId, message.trim());
      setMessage('');
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
  
  if (loading) {
    return <div className="chat-loading">Loading chat history...</div>;
  }
  
  return (
    <div className="chat-component">
      <h3>Communication with Investigator</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="chat-container" ref={chatContainerRef}>
        {chatHistory.length === 0 ? (
          <div className="no-messages">
            No messages yet. {!disabled && "You can start the conversation."}
          </div>
        ) : (
          chatHistory.map((msg, index) => (
            <div 
              key={index} 
              className={`chat-message ${msg.sender === 'whistleblower' ? 'outgoing' : 'incoming'}`}
            >
              <div className="message-content">{msg.content}</div>
              <div className="message-meta">
                <span className="message-time">{formatTime(msg.timestamp)}</span>
                {msg.sender !== 'whistleblower' && (
                  <span className="message-sender">Investigator</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <form className="chat-form" onSubmit={handleSendMessage}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={disabled ? "Chat is disabled" : "Type your message..."}
          disabled={disabled || sending}
          rows="3"
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={disabled || !message.trim() || sending}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;
