import axios from 'axios';
import { getAuthHeader } from '../services/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/investigator';

/**
 * Get reports by status
 * @param {string} status - Report status (pending, under_investigation, completed)
 * @returns {Promise<Array>} - Array of reports
 */
export const getReportsByStatus = async (status = 'pending') => {
  try {
    const response = await axios.get(`${API_URL}/reports?status=${status}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching reports' };
  }
};

/**
 * Get unassigned reports
 * @returns {Promise<Array>} - Array of unassigned reports
 */
export const getUnassignedReports = async () => {
  try {
    const response = await axios.get(`${API_URL}/reports/unassigned`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching unassigned reports' };
  }
};

/**
 * Get reports assigned to current investigator
 * @returns {Promise<Array>} - Array of assigned reports
 */
export const getMyReports = async () => {
  try {
    const response = await axios.get(`${API_URL}/my-reports`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching your reports' };
  }
};

/**
 * Get a specific report by ID
 * @param {string} id - Report ID
 * @returns {Promise<Object>} - Report data
 */
export const getReportById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/reports/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching report' };
  }
};

/**
 * Assign a report to self
 * @param {string} id - Report ID
 * @returns {Promise<Object>} - Updated report
 */
export const assignReportToSelf = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/reports/${id}/assign`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error assigning report' };
  }
};

/**
 * Complete an investigation
 * @param {string} id - Report ID
 * @returns {Promise<Object>} - Updated report
 */
export const completeInvestigation = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/reports/${id}/complete`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error completing investigation' };
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
      content
    }, {
      headers: getAuthHeader()
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
    const response = await axios.put(`${API_URL}/reports/${reportId}/chat/read`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error marking messages as read' };
  }
};

/**
 * Get statistics
 * @returns {Promise<Object>} - Statistics data
 */
export const getStatistics = async () => {
  try {
    const response = await axios.get(`${API_URL}/statistics`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching statistics' };
  }
};
