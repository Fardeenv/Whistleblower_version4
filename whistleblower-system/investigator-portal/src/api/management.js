import axios from 'axios';
import { getAuthHeader } from '../services/auth';

const API_URL = process.env.REACT_APP_MANAGEMENT_API_URL || 'http://localhost:3001/api/management';

/**
 * Login management user
 * @param {Object} credentials - Username and password
 * @returns {Promise<Object>} - User data and token
 */
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    
    // Store token in localStorage
    localStorage.setItem('investigator_token', response.data.token);
    localStorage.setItem('investigator_user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

/**
 * Get all reports
 * @param {string} status - Optional status filter
 * @returns {Promise<Array>} - Array of reports
 */
export const getAllReports = async (status) => {
  try {
    const url = status ? `${API_URL}/reports?status=${status}` : `${API_URL}/reports`;
    const response = await axios.get(url, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching reports' };
  }
};

/**
 * Get a specific report
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
 * Reopen an investigation
 * @param {string} id - Report ID
 * @param {string} reopenReason - Reason for reopening
 * @returns {Promise<Object>} - Updated report
 */
export const reopenInvestigation = async (id, reopenReason) => {
  try {
    const response = await axios.post(`${API_URL}/reports/${id}/reopen`, 
      { reopenReason },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error reopening investigation' };
  }
};

/**
 * Get management statistics
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
