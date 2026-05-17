import axios from 'axios';
import authService from './authService';

const BASE_URL = process.env.REACT_APP_TRAVEL_SERVICE_URL;

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${authService.getToken()}` }
});

const travelService = {
  // Travel Plans
  getAllPlans: async () => {
    const response = await axios.get(`${BASE_URL}/api/travel-plans`, getHeaders());
    return response.data;
  },

  getPlanById: async (id) => {
    const response = await axios.get(`${BASE_URL}/api/travel-plans/${id}`, getHeaders());
    return response.data;
  },

  createPlan: async (planData) => {
    const response = await axios.post(`${BASE_URL}/api/travel-plans`, planData, getHeaders());
    return response.data;
  },

  updatePlan: async (id, planData) => {
    const response = await axios.put(`${BASE_URL}/api/travel-plans/${id}`, planData, getHeaders());
    return response.data;
  },

  deletePlan: async (id) => {
    await axios.delete(`${BASE_URL}/api/travel-plans/${id}`, getHeaders());
  },

  // Destinations
  addDestination: async (planId, destinationData) => {
    const response = await axios.post(
      `${BASE_URL}/api/travel-plans/${planId}/destinations`,
      destinationData,
      getHeaders()
    );
    return response.data;
  },

  deleteDestination: async (planId, destinationId) => {
    await axios.delete(
      `${BASE_URL}/api/travel-plans/${planId}/destinations/${destinationId}`,
      getHeaders()
    );
  },

  // Activities
  addActivity: async (planId, activityData) => {
    const response = await axios.post(
      `${BASE_URL}/api/travel-plans/${planId}/activities`,
      activityData,
      getHeaders()
    );
    return response.data;
  },

  deleteActivity: async (planId, activityId) => {
    await axios.delete(
      `${BASE_URL}/api/travel-plans/${planId}/activities/${activityId}`,
      getHeaders()
    );
  },

  // Checklist
  addChecklistItem: async (planId, name) => {
    const response = await axios.post(
      `${BASE_URL}/api/travel-plans/${planId}/checklist`,
      { name },
      getHeaders()
    );
    return response.data;
  },

  toggleChecklistItem: async (planId, itemId) => {
    await axios.patch(
      `${BASE_URL}/api/travel-plans/${planId}/checklist/${itemId}/toggle`,
      {},
      getHeaders()
    );
  },

  deleteChecklistItem: async (planId, itemId) => {
    await axios.delete(
      `${BASE_URL}/api/travel-plans/${planId}/checklist/${itemId}`,
      getHeaders()
    );
  },
  getPublicPlan: async (planId) => {
    const response = await axios.get(`${BASE_URL}/api/travel-plans/public/${planId}`);
    return response.data;
  },
  addDestinationPublic: async (planId, destinationData) => {
    const response = await axios.post(
        `${BASE_URL}/api/travel-plans/public/${planId}/destinations`,
        destinationData
    );
    return response.data;
},

addActivityPublic: async (planId, activityData) => {
    const response = await axios.post(
        `${BASE_URL}/api/travel-plans/public/${planId}/activities`,
        activityData
    );
    return response.data;
},

addChecklistItemPublic: async (planId, name) => {
    const response = await axios.post(
        `${BASE_URL}/api/travel-plans/public/${planId}/checklist`,
        { name }
    );
    return response.data;
},

toggleChecklistItemPublic: async (planId, itemId) => {
    await axios.patch(
        `${BASE_URL}/api/travel-plans/public/${planId}/checklist/${itemId}/toggle`,
        {}
    );
}
};

export default travelService;