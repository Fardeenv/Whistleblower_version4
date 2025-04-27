import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/whistleblower';

/**
 * Submit a new whistleblower report
 * @param {Object} reportData - Report data including title, description, etc.
 * @returns {Promise<Object>} - The submitted report
 */
export const submitReport = async (reportData) => {
  try {
    const response = await axios.post(`${API_URL}/reports`, reportData);
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
