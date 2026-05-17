import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';

const Dashboard = () => {
  const { plans, fetchPlans, deletePlan, loading } = useTravel();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      await deletePlan(id);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Travel Plans</h1>
        <Link to="/plans/new" className="btn-primary">+ New Plan</Link>
      </div>
      {plans.length === 0 ? (
        <div className="empty-state">
          <p>No travel plans yet. Create your first one!</p>
        </div>
      ) : (
        <div className="plans-grid">
          {plans.map(plan => (
            <div key={plan.id} className="plan-card">
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
              <div className="plan-dates">
                <span>📅 {new Date(plan.startDate).toLocaleDateString()}</span>
                <span> → </span>
                <span>{new Date(plan.endDate).toLocaleDateString()}</span>
              </div>
              <div className="plan-budget">
                💰 Budget: ${plan.budget}
              </div>
              <div className="plan-actions">
                <button onClick={() => navigate(`/plans/${plan.id}`)} className="btn-secondary">
                  View
                </button>
                <button onClick={() => navigate(`/plans/${plan.id}/edit`)} className="btn-secondary">
                  Edit
                </button>
                <button onClick={() => handleDelete(plan.id)} className="btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;