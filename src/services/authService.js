import axios from 'axios';

const BASE_URL = process.env.REACT_APP_USER_SERVICE_URL;

const authService = {
  register: async (name, email, password) => {
    const response = await axios.post(`${BASE_URL}/api/users/register`, {
      name,
      email,
      password
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await axios.post(`${BASE_URL}/api/users/login`, {
      email,
      password
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken: () => localStorage.getItem('token'),

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => !!localStorage.getItem('token'),

  getAllUsers: async () => {
    const response = await axios.get(`${BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    });
    return response.data;
  },

  deleteUser: async (id) => {
    await axios.delete(`${BASE_URL}/api/users/${id}`, {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    });
  },
   updateUserRole: async (id, role) => {
    await axios.put(`${BASE_URL}/api/users/${id}/role`, { role }, {
        headers: { Authorization: `Bearer ${authService.getToken()}` }
    });
}
};

export default authService;