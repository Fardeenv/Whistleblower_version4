import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/whistleblower';

/**
 * Submit a new whistleblower report with optional attachments
 * @param {FormData} formData - Form data including all report details and files
 * @returns {Promise<Object>} - The submitted report
 */
export const submitReport = async (formData) => {
  try {
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
 * Send a chat message with optional attachment
 * @param {string} reportId - Report ID
 * @param {FormData} formData - FormData containing message content and/or attachment
 * @returns {Promise<Object>} - The sent message
 */
export const sendChatMessage = async (reportId, formData) => {
  try {
    const response = await axios.post(`${API_URL}/reports/${reportId}/chat`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
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
