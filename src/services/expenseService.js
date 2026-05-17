import axios from 'axios';
import authService from './authService';

const BASE_URL = process.env.REACT_APP_EXPENSE_SERVICE_URL;

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${authService.getToken()}` }
});

const expenseService = {
  getAll: async (travelPlanId) => {
    const response = await axios.get(`${BASE_URL}/api/expenses/${travelPlanId}`, getHeaders());
    return response.data;
  },

  getSummary: async (travelPlanId) => {
    const response = await axios.get(`${BASE_URL}/api/expenses/${travelPlanId}/summary`, getHeaders());
    return response.data;
  },

  create: async (expenseData) => {
    const response = await axios.post(`${BASE_URL}/api/expenses`, expenseData, getHeaders());
    return response.data;
  },

  update: async (id, expenseData) => {
    const response = await axios.put(`${BASE_URL}/api/expenses/${id}`, expenseData, getHeaders());
    return response.data;
  },

  delete: async (id) => {
    await axios.delete(`${BASE_URL}/api/expenses/${id}`, getHeaders());
  },

  createShareToken: async (travelPlanId, accessType) => {
    const response = await axios.post(
      `${BASE_URL}/api/expenses/share`,
      { travelPlanId, accessType },
      getHeaders()
    );
    return response.data;
  },

  validateToken: async (token) => {
    const response = await axios.get(`${BASE_URL}/api/expenses/share/validate/${token}`);
    return response.data;
  }
};

export default expenseService;