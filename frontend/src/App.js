import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Standard imports (ensure these files exist in your project)
import Sidebar from './components/Sidebar'; 
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LiveTracking from './pages/LiveTracking';
import VesselList from './pages/VesselList';
import VoyageSchedules from './pages/VoyageSchedules'; // Your new table page

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div style={{ display: 'flex' }}> 
        {/* Sidebar only appears if user is logged in */}
        {user && <Sidebar user={user} setUser={setUser} />} 
        
        {/* Main Content Area - shifts right to make room for fixed sidebar */}
        <div style={{ flex: 1, marginLeft: user ? '260px' : '0' }}>
          <Routes>
            {/* 1. Public Routes */}
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            
            {/* 2. Protected Routes (checks if user is logged in) */}
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} 
            />
            
            <Route 
              path="/tracking" 
              element={user ? <LiveTracking user={user} setUser={setUser} /> : <Navigate to="/login" />} 
            />

            <Route 
              path="/vessels" 
              element={user ? <VesselList user={user} setUser={setUser} /> : <Navigate to="/login" />} 
            />

            {/* NEW: Displays the real Voyage Schedules table */}
            <Route 
              path="/voyages" 
              element={user ? <VoyageSchedules user={user} setUser={setUser} /> : <Navigate to="/login" />} 
            />
            
            {/* 3. Redirects */}
            <Route path="/" element={<Navigate to="/register" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;