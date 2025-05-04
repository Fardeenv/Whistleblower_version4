import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/investigator';

/**
 * Get authentication header
 * @returns {Object} - Header with Authorization token
 */
export const getAuthHeader = () => {
  const token = localStorage.getItem('user_token');
  return { Authorization: `Bearer ${token}` };
};

/**
 * Login a user
 * @param {Object} credentials - Username and password
 * @returns {Promise<Object>} - User data and token
 */
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    
    // Store token in localStorage
    localStorage.setItem('user_token', response.data.token);
    localStorage.setItem('user_data', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

/**
 * Logout the user
 */
export const logout = () => {
  localStorage.removeItem('user_token');
  localStorage.removeItem('user_data');
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('user_token');
};

/**
 * Get current user data
 * @returns {Object|null} - User data or null if not logged in
 */
export const getCurrentUser = () => {
  const userJson = localStorage.getItem('user_data');
  return userJson ? JSON.parse(userJson) : null;
};

/**
 * Check if user has a specific role
 * @param {string} role - Role to check
 * @returns {boolean} - True if user has the role
 */
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};
