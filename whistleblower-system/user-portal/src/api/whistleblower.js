import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/whistleblower';

/**
 * Submit a new whistleblower report with optional voice note
 * @param {Object} reportData - Report data including title, description, etc.
 * @param {File} voiceNote - Voice note audio file (optional)
 * @returns {Promise<Object>} - The submitted report
 */
export const submitReport = async (reportData, voiceNote = null) => {
  try {
    const formData = new FormData();
    
    // Add text fields to form data
    Object.keys(reportData).forEach(key => {
      formData.append(key, reportData[key]);
    });
    
    // Add voice note if provided
    if (voiceNote) {
      formData.append('voiceNote', voiceNote);
    }
    
    const response = await axios.post(`${API_URL}/reports`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error submitting report' };
  }
};

/**
 * Get a report by its ID
 * @param {string} id - Report ID 
 * @returns {Promise<Object>} - The report data
 */
export const getReportById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/reports/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching report' };
  }
};

/**
 * Get the voice note audio file
 * @param {string} voiceNotePath - Path to voice note
 * @returns {Promise<Blob>} - The voice note audio blob
 */
export const getVoiceNote = async (voiceNotePath) => {
  try {
    // Extract the filename from the path
    const filename = voiceNotePath.split('/').pop();
    const response = await axios.get(`${API_URL}/voice-notes/${filename}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching voice note' };
  }
};

/**
 * Get chat history for a report
 * @param {string} id - Report ID
 * @returns {Promise<Array>} - Array of chat messages
 */
export const getChatHistory = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/reports/${id}/chat`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching chat history' };
  }
};

/**
 * Send a chat message
 * @param {string} reportId - Report ID
 * @param {string} content - Message content
 * @returns {Promise<Object>} - The sent message
 */
export const sendChatMessage = async (reportId, content) => {
  try {
    const response = await axios.post(`${API_URL}/reports/${reportId}/chat`, {
      sender: 'whistleblower',
      content
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error sending message' };
  }
};

/**
 * Mark messages as read
 * @param {string} reportId - Report ID
 * @returns {Promise<Object>} - Success response
 */
export const markMessagesAsRead = async (reportId) => {
  try {
    const response = await axios.put(`${API_URL}/reports/${reportId}/chat/read`, {
      reader: 'whistleblower'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error marking messages as read' };
  }
};
