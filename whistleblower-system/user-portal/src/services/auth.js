import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/whistleblower';
const ADMIN_API = `${API_URL.replace('/whistleblower', '')}/admin`;

// Store token in localStorage
const setToken = (token) => {
  localStorage.setItem('admin_token', token);
};

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('admin_token');
};

// Remove token from localStorage
const removeToken = () => {
  localStorage.removeItem('admin_token');
};

// Check if user is authenticated
const isAuthenticated = () => {
  const token = getToken();
  return !!token; // Convert to boolean
};

// Login function
const login = async (credentials) => {
  try {
    const response = await axios.post(`${ADMIN_API}/login`, credentials);
    const { token } = response.data;
    setToken(token);
    return true;
  } catch (error) {
    throw error.response?.data || { message: 'Error logging in' };
  }
};

// Logout function
const logout = () => {
  removeToken();
};

// Get authenticated axios instance with token
const getAuthAxios = () => {
  const token = getToken();
  return axios.create({
    baseURL: API_URL.replace('/whistleblower', ''),
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export { login, logout, isAuthenticated, getToken, getAuthAxios };
