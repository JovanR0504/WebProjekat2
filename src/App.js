import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TravelProvider } from './context/TravelContext';
import Navbar from './components/shared/Navbar';
import PrivateRoute from './components/shared/PrivateRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import PlanForm from './pages/PlanForm';
import PlanDetail from './pages/PlanDetail';
import AdminPanel from './pages/AdminPanel';
import SharedPlan from './pages/SharedPlan';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <TravelProvider>
        <Router>
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/shared/:token" element={<SharedPlan />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <PrivateRoute><Dashboard /></PrivateRoute>
              } />
              <Route path="/plans/new" element={
                <PrivateRoute><PlanForm /></PrivateRoute>
              } />
              <Route path="/plans/:id" element={
                <PrivateRoute><PlanDetail /></PrivateRoute>
              } />
              <Route path="/plans/:id/edit" element={
                <PrivateRoute><PlanForm /></PrivateRoute>
              } />
              <Route path="/admin" element={
                <PrivateRoute adminOnly={true}><AdminPanel /></PrivateRoute>
              } />
            </Routes>
          </div>
        </Router>
      </TravelProvider>
    </AuthProvider>
  );
}

export default App;