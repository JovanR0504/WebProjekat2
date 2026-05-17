import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import expenseService from '../services/expenseService';
import travelService from '../services/travelService';

const SharedPlan = () => {
  const { token } = useParams();
  const [accessType, setAccessType] = useState(null);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [success, setSuccess] = useState('');

  // Activity form
  const [actForm, setActForm] = useState({
    name: '', date: '', time: '', location: '', description: '', estimatedCost: '', status: 'planned'
  });

  // Checklist
  const [checklistInput, setChecklistInput] = useState('');

  // Destination form
  const [destForm, setDestForm] = useState({
    name: '', location: '', arrivalDate: '', departureDate: '', description: '', notes: ''
  });

  useEffect(() => {
    validateAndLoad();
  }, [token]);

  const validateAndLoad = async () => {
    try {
      const data = await expenseService.validateToken(token);
      setAccessType(data.accessType);
      const planData = await travelService.getPublicPlan(data.travelPlanId);
      setPlan(planData);
      setLoading(false);
    } catch (err) {
      setError('Invalid or expired link.');
      setLoading(false);
    }
  };

  const reload = async () => {
    try {
      const data = await expenseService.validateToken(token);
      const planData = await travelService.getPublicPlan(data.travelPlanId);
      setPlan(planData);
      setError('');
    } catch (err) {
      console.log('Reload error:', err);
    }
};

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAddDestination = async (e) => {
    e.preventDefault();
    if (new Date(destForm.departureDate) < new Date(destForm.arrivalDate)) {
      setError('Departure date cannot be before arrival date.');
      return;
    }
    try {
      await travelService.addDestinationPublic(plan.id, destForm);
      await reload();
      setDestForm({ name: '', location: '', arrivalDate: '', departureDate: '', description: '', notes: '' });
      showSuccess('Destination added!');
    } catch (err) {
      setError('Failed to add destination.');
    }
};

const handleAddActivity = async (e) => {
    e.preventDefault();
    try {
      await travelService.addActivityPublic(plan.id, actForm);
      await reload();
      setActForm({ name: '', date: '', time: '', location: '', description: '', estimatedCost: '', status: 'planned' });
      showSuccess('Activity added!');
    } catch (err) {
      setError('Failed to add activity.');
    }
};

const handleAddChecklistItem = async (e) => {
    e.preventDefault();
    if (!checklistInput.trim()) return;
    try {
      await travelService.addChecklistItemPublic(plan.id, checklistInput);
      await reload();
      setChecklistInput('');
      showSuccess('Item added!');
    } catch (err) {
      setError('Failed to add item.');
    }
};

const handleToggleChecklist = async (itemId) => {
    try {
      await travelService.toggleChecklistItemPublic(plan.id, itemId);
      await reload();
    } catch (err) {}
};
  if (loading) return <div className="loading">Validating link...</div>;
  if (error && !plan) return (
    <div className="auth-container">
      <h2>❌ Invalid Link</h2>
      <p>{error}</p>
    </div>
  );

  const isEdit = accessType === 'EDIT';

  const groupedActivities = plan?.activities?.reduce((groups, activity) => {
    const date = activity.date?.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(activity);
    return groups;
  }, {});

  return (
    <div className="plan-detail">
      <div className="plan-detail-header">
        <h1>✈️ {plan?.name}</h1>
        <span className={`access-badge ${isEdit ? 'edit' : 'view'}`}>
          {isEdit ? '✏️ Edit Access' : '👁️ View Only'}
        </span>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="tabs">
        {['overview', 'destinations', 'activities', 'checklist'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="overview-grid">
            <div className="overview-card">
              <h3>Trip Details</h3>
              <p><strong>Description:</strong> {plan?.description}</p>
              <p><strong>Start:</strong> {new Date(plan?.startDate).toLocaleDateString()}</p>
              <p><strong>End:</strong> {new Date(plan?.endDate).toLocaleDateString()}</p>
              <p><strong>Budget:</strong> ${plan?.budget}</p>
              <p><strong>Notes:</strong> {plan?.notes}</p>
            </div>
            <div className="overview-card">
              <h3>Summary</h3>
              <p><strong>Destinations:</strong> {plan?.destinations?.length || 0}</p>
              <p><strong>Activities:</strong> {plan?.activities?.length || 0}</p>
              <p><strong>Checklist:</strong> {plan?.checklistItems?.filter(i => i.isCompleted).length}/{plan?.checklistItems?.length} completed</p>
            </div>
          </div>
        </div>
      )}

      {/* DESTINATIONS */}
      {activeTab === 'destinations' && (
        <div className="tab-content">
          <h3>Destinations</h3>
          {isEdit && (
            <form onSubmit={handleAddDestination} className="inline-form">
              <input placeholder="Name *" value={destForm.name} onChange={e => setDestForm({...destForm, name: e.target.value})} required />
              <input placeholder="Location *" value={destForm.location} onChange={e => setDestForm({...destForm, location: e.target.value})} required />
              <input type="date" value={destForm.arrivalDate} onChange={e => setDestForm({...destForm, arrivalDate: e.target.value})} required />
              <input type="date" value={destForm.departureDate} onChange={e => setDestForm({...destForm, departureDate: e.target.value})} required />
              <input placeholder="Description" value={destForm.description} onChange={e => setDestForm({...destForm, description: e.target.value})} />
              <button type="submit" className="btn-primary">Add</button>
            </form>
          )}
          <div className="items-list">
            {plan?.destinations?.map(dest => (
              <div key={dest.id} className="item-card">
                <div>
                  <strong>{dest.name}</strong> — {dest.location}
                  <p>{new Date(dest.arrivalDate).toLocaleDateString()} → {new Date(dest.departureDate).toLocaleDateString()}</p>
                  <p>{dest.description}</p>
                </div>
              </div>
            ))}
            {plan?.destinations?.length === 0 && <p>No destinations added.</p>}
          </div>
        </div>
      )}

      {/* ACTIVITIES */}
      {activeTab === 'activities' && (
        <div className="tab-content">
          <h3>Activities</h3>
          {isEdit && (
            <form onSubmit={handleAddActivity} className="inline-form">
              <input placeholder="Name *" value={actForm.name} onChange={e => setActForm({...actForm, name: e.target.value})} required />
              <input type="date" value={actForm.date} onChange={e => setActForm({...actForm, date: e.target.value})} required />
              <input type="time" value={actForm.time} onChange={e => setActForm({...actForm, time: e.target.value})} />
              <input placeholder="Location" value={actForm.location} onChange={e => setActForm({...actForm, location: e.target.value})} />
              <input type="number" placeholder="Cost" value={actForm.estimatedCost} onChange={e => setActForm({...actForm, estimatedCost: e.target.value})} min="0" />
              <select value={actForm.status} onChange={e => setActForm({...actForm, status: e.target.value})}>
                <option value="planned">Planned</option>
                <option value="reserved">Reserved</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button type="submit" className="btn-primary">Add</button>
            </form>
          )}
          <div className="calendar-view">
            {Object.entries(groupedActivities || {}).sort().map(([date, acts]) => (
              <div key={date} className="day-group">
                <h4>📅 {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                {acts.map(act => (
                  <div key={act.id} className="item-card">
                    <div>
                      <strong>{act.name}</strong> {act.time && `@ ${act.time}`}
                      <span className={`status-badge status-${act.status}`}>{act.status}</span>
                      <p>{act.location} {act.estimatedCost > 0 && `— $${act.estimatedCost}`}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {plan?.activities?.length === 0 && <p>No activities added.</p>}
          </div>
        </div>
      )}

      {/* CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="tab-content">
          <h3>Packing Checklist</h3>
          {isEdit && (
            <form onSubmit={handleAddChecklistItem} className="inline-form">
              <input
                placeholder="Add item..."
                value={checklistInput}
                onChange={e => setChecklistInput(e.target.value)}
              />
              <button type="submit" className="btn-primary">Add</button>
            </form>
          )}
          <div className="checklist">
            {plan?.checklistItems?.map(item => (
              <div key={item.id} className={`checklist-item ${item.isCompleted ? 'completed' : ''}`}>
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={() => isEdit ? handleToggleChecklist(item.id) : null}
                  readOnly={!isEdit}
                />
                <span>{item.name}</span>
              </div>
            ))}
            {plan?.checklistItems?.length === 0 && <p>No checklist items.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedPlan;