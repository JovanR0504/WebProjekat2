import React, { createContext, useState, useContext } from 'react';
import travelService from '../services/travelService';

const TravelContext = createContext();

export const TravelProvider = ({ children }) => {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await travelService.getAllPlans();
      setPlans(data);
    } catch (err) {
      setError('Failed to fetch plans.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanById = async (id) => {
    setLoading(true);
    try {
      const data = await travelService.getPlanById(id);
      setCurrentPlan(data);
    } catch (err) {
      setError('Failed to fetch plan.');
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (planData) => {
    const data = await travelService.createPlan(planData);
    setPlans([...plans, data]);
    return data;
  };

  const updatePlan = async (id, planData) => {
    const data = await travelService.updatePlan(id, planData);
    setPlans(plans.map(p => p.id === id ? data : p));
    setCurrentPlan(data);
    return data;
  };

  const deletePlan = async (id) => {
    await travelService.deletePlan(id);
    setPlans(plans.filter(p => p.id !== id));
  };

  return (
    <TravelContext.Provider value={{
      plans, currentPlan, loading, error,
      fetchPlans, fetchPlanById, createPlan, updatePlan, deletePlan
    }}>
      {children}
    </TravelContext.Provider>
  );
};

export const useTravel = () => useContext(TravelContext);