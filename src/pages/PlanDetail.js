import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTravel } from '../context/TravelContext';
import travelService from '../services/travelService';
import expenseService from '../services/expenseService';

const PlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchPlanById, currentPlan, loading } = useTravel();

  const [activeTab, setActiveTab] = useState('overview');
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [shareData, setShareData] = useState(null);

  // Destination form
  const [destForm, setDestForm] = useState({
    name: '', location: '', arrivalDate: '', departureDate: '', description: '', notes: ''
  });

  // Activity form
  const [actForm, setActForm] = useState({
    name: '', date: '', time: '', location: '', description: '', estimatedCost: '', status: 'planned'
  });

  // Checklist
  const [checklistInput, setChecklistInput] = useState('');

  // Expense form
  const [expForm, setExpForm] = useState({
    name: '', category: 'transport', amount: '', date: '', description: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPlanById(id);
    loadExpenses();
  }, [id]);

  const loadExpenses = async () => {
    try {
      const data = await expenseService.getAll(id);
      setExpenses(data);
      const sum = await expenseService.getSummary(id);
      setSummary(sum);
    } catch (err) {}
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Destinations
  const handleAddDestination = async (e) => {
    e.preventDefault();
    setError('');
    if (new Date(destForm.departureDate) < new Date(destForm.arrivalDate)) {
      setError('Departure date cannot be before arrival date.');
      return;
    }
    try {
      await travelService.addDestination(id, destForm);
      await fetchPlanById(id);
      setDestForm({ name: '', location: '', arrivalDate: '', departureDate: '', description: '', notes: '' });
      showSuccess('Destination added!');
    } catch (err) {
      setError('Failed to add destination.');
    }
  };

  const handleDeleteDestination = async (destId) => {
    await travelService.deleteDestination(id, destId);
    await fetchPlanById(id);
  };

  // Activities
  const handleAddActivity = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await travelService.addActivity(id, actForm);
      await fetchPlanById(id);
      setActForm({ name: '', date: '', time: '', location: '', description: '', estimatedCost: '', status: 'planned' });
      showSuccess('Activity added!');
    } catch (err) {
      setError('Failed to add activity.');
    }
  };

  const handleDeleteActivity = async (actId) => {
    await travelService.deleteActivity(id, actId);
    await fetchPlanById(id);
  };

  // Checklist
  const handleAddChecklistItem = async (e) => {
    e.preventDefault();
    if (!checklistInput.trim()) return;
    await travelService.addChecklistItem(id, checklistInput);
    await fetchPlanById(id);
    setChecklistInput('');
  };

  const handleToggleChecklist = async (itemId) => {
    await travelService.toggleChecklistItem(id, itemId);
    await fetchPlanById(id);
  };

  const handleDeleteChecklistItem = async (itemId) => {
    await travelService.deleteChecklistItem(id, itemId);
    await fetchPlanById(id);
  };

  // Expenses
  const handleAddExpense = async (e) => {
    e.preventDefault();
    setError('');
    if (parseFloat(expForm.amount) <= 0) {
      setError('Amount must be positive.');
      return;
    }
    try {
      await expenseService.create({ ...expForm, travelPlanId: parseInt(id), amount: parseFloat(expForm.amount) });
      await loadExpenses();
      setExpForm({ name: '', category: 'transport', amount: '', date: '', description: '' });
      showSuccess('Expense added!');
    } catch (err) {
      setError('Failed to add expense.');
    }
  };

  const handleDeleteExpense = async (expId) => {
    await expenseService.delete(expId);
    await loadExpenses();
  };

  // Share
  const handleShare = async (accessType) => {
    try {
      const data = await expenseService.createShareToken(parseInt(id), accessType);
      setShareData(data);
    } catch (err) {
      setError('Failed to create share token.');
    }
  };

  if (loading || !currentPlan) return <div className="loading">Loading...</div>;

  const groupedActivities = currentPlan.activities?.reduce((groups, activity) => {
    const date = activity.date?.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(activity);
    return groups;
  }, {});

  return (
    <div className="plan-detail">
      <div className="plan-detail-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">← Back</button>
        <h1>{currentPlan.name}</h1>
        <button onClick={() => navigate(`/plans/${id}/edit`)} className="btn-secondary">Edit Plan</button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="tabs">
        {['overview', 'destinations', 'activities', 'expenses', 'checklist', 'share'].map(tab => (
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
              <p><strong>Description:</strong> {currentPlan.description}</p>
              <p><strong>Start:</strong> {new Date(currentPlan.startDate).toLocaleDateString()}</p>
              <p><strong>End:</strong> {new Date(currentPlan.endDate).toLocaleDateString()}</p>
              <p><strong>Budget:</strong> ${currentPlan.budget}</p>
              <p><strong>Notes:</strong> {currentPlan.notes}</p>
            </div>
            <div className="overview-card">
              <h3>Summary</h3>
              <p><strong>Destinations:</strong> {currentPlan.destinations?.length || 0}</p>
              <p><strong>Activities:</strong> {currentPlan.activities?.length || 0}</p>
              <p><strong>Total Expenses:</strong> ${summary?.totalExpenses || 0}</p>
              <p><strong>Remaining Budget:</strong> ${(currentPlan.budget - (summary?.totalExpenses || 0)).toFixed(2)}</p>
              <p><strong>Checklist:</strong> {currentPlan.checklistItems?.filter(i => i.isCompleted).length}/{currentPlan.checklistItems?.length} completed</p>
            </div>
          </div>
        </div>
      )}

      {/* DESTINATIONS */}
      {activeTab === 'destinations' && (
        <div className="tab-content">
          <h3>Destinations</h3>
          <form onSubmit={handleAddDestination} className="inline-form">
            <input placeholder="Name *" value={destForm.name} onChange={e => setDestForm({...destForm, name: e.target.value})} required />
            <input placeholder="Location *" value={destForm.location} onChange={e => setDestForm({...destForm, location: e.target.value})} required />
            <input type="date" value={destForm.arrivalDate} onChange={e => setDestForm({...destForm, arrivalDate: e.target.value})} required />
            <input type="date" value={destForm.departureDate} onChange={e => setDestForm({...destForm, departureDate: e.target.value})} required />
            <input placeholder="Description" value={destForm.description} onChange={e => setDestForm({...destForm, description: e.target.value})} />
            <button type="submit" className="btn-primary">Add</button>
          </form>
          <div className="items-list">
            {currentPlan.destinations?.map(dest => (
              <div key={dest.id} className="item-card">
                <div>
                  <strong>{dest.name}</strong> — {dest.location}
                  <p>{new Date(dest.arrivalDate).toLocaleDateString()} → {new Date(dest.departureDate).toLocaleDateString()}</p>
                  <p>{dest.description}</p>
                </div>
                <button onClick={() => handleDeleteDestination(dest.id)} className="btn-danger">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVITIES */}
      {activeTab === 'activities' && (
        <div className="tab-content">
          <h3>Activities</h3>
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
                    <button onClick={() => handleDeleteActivity(act.id)} className="btn-danger">Delete</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="tab-content">
          <h3>Expenses</h3>
          {summary && (
            <div className="budget-summary">
              <div className="budget-item"><span>Total Budget</span><strong>${currentPlan.budget}</strong></div>
              <div className="budget-item"><span>Total Expenses</span><strong>${summary.totalExpenses}</strong></div>
              <div className="budget-item"><span>Remaining</span><strong>${(currentPlan.budget - summary.totalExpenses).toFixed(2)}</strong></div>
            </div>
          )}
          <form onSubmit={handleAddExpense} className="inline-form">
            <input placeholder="Name *" value={expForm.name} onChange={e => setExpForm({...expForm, name: e.target.value})} required />
            <select value={expForm.category} onChange={e => setExpForm({...expForm, category: e.target.value})}>
              <option value="transport">Transport</option>
              <option value="accommodation">Accommodation</option>
              <option value="food">Food</option>
              <option value="tickets">Tickets</option>
              <option value="shopping">Shopping</option>
              <option value="other">Other</option>
            </select>
            <input type="number" placeholder="Amount *" value={expForm.amount} onChange={e => setExpForm({...expForm, amount: e.target.value})} min="0" required />
            <input type="date" value={expForm.date} onChange={e => setExpForm({...expForm, date: e.target.value})} required />
            <button type="submit" className="btn-primary">Add</button>
          </form>
          <div className="items-list">
            {expenses.map(exp => (
              <div key={exp.id} className="item-card">
                <div>
                  <strong>{exp.name}</strong> — <span className="category-badge">{exp.category}</span>
                  <p>${exp.amount} — {new Date(exp.date).toLocaleDateString()}</p>
                </div>
                <button onClick={() => handleDeleteExpense(exp.id)} className="btn-danger">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="tab-content">
          <h3>Packing Checklist</h3>
          <form onSubmit={handleAddChecklistItem} className="inline-form">
            <input
              placeholder="Add item (e.g. Passport, Charger...)"
              value={checklistInput}
              onChange={e => setChecklistInput(e.target.value)}
            />
            <button type="submit" className="btn-primary">Add</button>
          </form>
          <div className="checklist">
            {currentPlan.checklistItems?.map(item => (
              <div key={item.id} className={`checklist-item ${item.isCompleted ? 'completed' : ''}`}>
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={() => handleToggleChecklist(item.id)}
                />
                <span>{item.name}</span>
                <button onClick={() => handleDeleteChecklistItem(item.id)} className="btn-danger-sm">×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SHARE */}
      {activeTab === 'share' && (
        <div className="tab-content">
          <h3>Share Plan</h3>
          <div className="share-buttons">
            <button onClick={() => handleShare('VIEW')} className="btn-primary">Generate VIEW Link</button>
            <button onClick={() => handleShare('EDIT')} className="btn-secondary">Generate EDIT Link</button>
          </div>
          {shareData && (
            <div className="share-result">
              <p><strong>Access Type:</strong> {shareData.accessType}</p>
              <p><strong>Expires:</strong> {new Date(shareData.expiresAt).toLocaleDateString()}</p>
              <p><strong>Link:</strong> http://localhost:3000/shared/{shareData.token}</p>
              {shareData.qrCodeBase64 && (
                <div className="qr-code">
                  <img src={`data:image/png;base64,${shareData.qrCodeBase64}`} alt="QR Code" />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlanDetail;