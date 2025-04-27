import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { sendChatMessage, markMessagesAsRead } from '../api/investigator';
import { getCurrentUser } from '../services/auth';
import io from 'socket.io-client';

const ChatComponent = ({ reportId, initialMessages = [], disabled = false }) => {
  const [chatHistory, setChatHistory] = useState(initialMessages);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const chatContainerRef = useRef(null);
  const socketRef = useRef(null);
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
              <div className="message-content">{msg.content}</div>
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
