import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import VesselTracking from './pages/VesselTracking';
import PortAnalytics from './pages/PortAnalytics';
import SafetyOverlays from './pages/SafetyOverlays';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Maritime Platform...</p>
      </div>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        {user ? <Navbar /> : <Header />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" /> : <Register />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={user ? <Profile /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/vessels" 
            element={user ? <VesselTracking /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/ports" 
            element={user ? <PortAnalytics /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/safety" 
            element={user ? <SafetyOverlays /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/analytics" 
            element={user ? <Analytics /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/notifications" 
            element={user ? <Notifications /> : <Navigate to="/login" />} 
          />
        </Routes>
        <ToastContainer position="top-right" />
      </div>
    </Router>
  );
}

export default App;