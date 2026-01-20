import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Header from './components/Header';
import Navbar from './components/Navbar';
import ProfileSidebar from './components/ProfileSidebar';
import BackButton from './components/BackButton';
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
import RealTimeSubscriptions from './pages/RealTimeSubscriptions';
import VoyageReplay from './pages/VoyageReplay';

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
        {user ? (
          <NotificationProvider>
            <div className="app-layout">
              <BackButton />
              <ProfileSidebar />
              <Navbar />
              <div className="main-content-wrapper">
                <div className="main-content">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/vessels" element={<VesselTracking />} />
                    <Route path="/voyage-replay" element={<VoyageReplay />} />
                    <Route path="/ports" element={<PortAnalytics />} />
                    <Route path="/safety" element={<SafetyOverlays />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/subscriptions" element={<RealTimeSubscriptions />} />
                    <Route path="/login" element={<Navigate to="/dashboard" />} />
                    <Route path="/register" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </div>
              </div>
            </div>
          </NotificationProvider>
        ) : (
          <>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </>
        )}
        <ToastContainer position="top-right" />
      </div>
    </Router>
  );
}

export default App;