import { getAuthAxios } from '../services/auth';

const getAllReports = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add any filters to the query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const axios = getAuthAxios();
    const response = await axios.get(`/admin/reports?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching reports' };
  }
};

const getReportById = async (id) => {
  try {
    const axios = getAuthAxios();
    const response = await axios.get(`/admin/reports/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching report' };
  }
};

const updateReportStatus = async (id, status) => {
  try {
    const axios = getAuthAxios();
    const response = await axios.put(`/admin/reports/${id}`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error updating report' };
  }
};

const getStatistics = async () => {
  try {
    const axios = getAuthAxios();
    const response = await axios.get('/admin/statistics');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching statistics' };
  }
};

export { getAllReports, getReportById, updateReportStatus, getStatistics };
