import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/whistleblower';

export const submitReport = async (reportData) => {
  try {
    const response = await axios.post(`${API_URL}/reports`, reportData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error submitting report' };
  }
};

export const getReportById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/reports/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching report' };
  }
};

export const updateReportStatus = async (id, status) => {
  try {
    const response = await axios.put(`${API_URL}/reports/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error updating report status' };
  }
};
