import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/investigator';

/**
 * Get authentication header
 * @returns {Object} - Header with Authorization token
 */
export const getAuthHeader = () => {
  const token = localStorage.getItem('investigator_token');
  return { Authorization: `Bearer ${token}` };
};

/**
 * Login an investigator
 * @param {Object} credentials - Username and password
 * @returns {Promise<Object>} - User data and token
 */
export const login = async (credentials) => {
  try {
    console.log('Attempting login with credentials:', { username: credentials.username, passwordLength: credentials.password?.length || 0 });
    console.log('API URL:', `${API_URL}/login`);
    
    const response = await axios.post(`${API_URL}/login`, credentials);
    console.log('Login response:', response.data);
    
    // Store token in localStorage
    localStorage.setItem('investigator_token', response.data.token);
    localStorage.setItem('investigator_user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    console.error('Login error details:', error.response || error);
    throw error.response?.data || { message: 'Login failed. Please check your credentials and try again.' };
  }
};

/**
 * Logout the investigator
 */
export const logout = () => {
  localStorage.removeItem('investigator_token');
  localStorage.removeItem('investigator_user');
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('investigator_token');
};

/**
 * Get current user data
 * @returns {Object|null} - User data or null if not logged in
 */
export const getCurrentUser = () => {
  const userJson = localStorage.getItem('investigator_user');
  return userJson ? JSON.parse(userJson) : null;
};
