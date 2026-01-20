import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LiveTracking from './pages/LiveTracking';
import VesselList from './pages/VesselList';
import PlaceholderPage from './pages/PlaceholderPage'; 

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        
        {/* Main Dashboard */}
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} 
        />
        
        {/* Vessel and Tracking Pages */}
        <Route 
          path="/tracking" 
          element={user ? <LiveTracking user={user} setUser={setUser} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/vessels" 
          element={user ? <VesselList user={user} setUser={setUser} /> : <Navigate to="/login" />} 
        />
        
        {/* Remaining Dashboard Card Routes */}
        <Route 
          path="/ports" 
          element={user ? <PlaceholderPage title="Port Statistics" user={user} setUser={setUser} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/voyages" 
          element={user ? <PlaceholderPage title="Voyage Schedules" user={user} setUser={setUser} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/events" 
          element={user ? <PlaceholderPage title="Operational Events" user={user} setUser={setUser} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/notifications" 
          element={user ? <PlaceholderPage title="Alerts & Notifications" user={user} setUser={setUser} /> : <Navigate to="/login" />} 
        />
        
        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/register" />} />
      </Routes>
    </Router>
  );
}

export default App;