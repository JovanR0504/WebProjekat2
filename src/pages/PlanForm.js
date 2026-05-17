import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';

const PlanForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { createPlan, updatePlan, fetchPlanById, currentPlan } = useTravel();

  const [form, setForm] = useState({
    name: '', description: '', startDate: '',
    endDate: '', budget: '', notes: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) fetchPlanById(id);
  }, [id]);

  useEffect(() => {
    if (isEdit && currentPlan) {
      setForm({
        name: currentPlan.name,
        description: currentPlan.description,
        startDate: currentPlan.startDate?.split('T')[0],
        endDate: currentPlan.endDate?.split('T')[0],
        budget: currentPlan.budget,
        notes: currentPlan.notes
      });
    }
  }, [currentPlan]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.startDate || !form.endDate || !form.budget) {
      setError('Please fill all required fields.');
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError('End date cannot be before start date.');
      return;
    }
    if (parseFloat(form.budget) < 0) {
      setError('Budget cannot be negative.');
      return;
    }
    try {
      if (isEdit) {
        await updatePlan(id, form);
      } else {
        await createPlan(form);
      }
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save plan.');
    }
  };

  return (
    <div className="form-container">
      <h2>{isEdit ? 'Edit Plan' : 'Create New Plan'}</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name *</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Trip name" />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Start Date *</label>
            <input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>End Date *</label>
            <input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label>Budget ($) *</label>
          <input type="number" name="budget" value={form.budget} onChange={handleChange} placeholder="0" min="0" />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Additional notes" />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {isEdit ? 'Update Plan' : 'Create Plan'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlanForm;