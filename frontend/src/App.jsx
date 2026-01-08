import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Ship, Anchor, Navigation, Calendar, Bell, MapPin, User, LogOut, Activity, TrendingUp, BarChart3, Clock, Info } from 'lucide-react';

// Import page components
import Dashboard from './pages/Dashboard';
import Vessels from './pages/Vessels';
import Ports from './pages/Ports';
import Voyages from './pages/Voyages';
import Events from './pages/Events';
import Notifications from './pages/Notifications';
import LiveTracking from './pages/LiveTracking';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import NotificationManager from './components/NotificationManager';

// Import layout components
import Navbar from './components/Navbar';
import ProtectedRoute from './utils/ProtectedRoute';
import { AlertNotificationManager } from './components/AlertNotificationManager';

// Layout component that includes navbar and outlet for nested routes
const Layout = () => {
  return (
    <>
      <Navbar />
      <AlertNotificationManager />
      <div style={{ marginTop: '64px' }}>
        <Outlet />
      </div>
    </>
  );
};

// Main App Component
function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes with layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="vessels" element={<Vessels />} />
          <Route path="ports" element={<Ports />} />
          <Route path="voyages" element={<Voyages />} />
          <Route path="events" element={<Events />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="livetracking" element={<LiveTracking />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;