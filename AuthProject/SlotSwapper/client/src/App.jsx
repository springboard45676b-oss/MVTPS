import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Requests from './pages/Requests';

// Import Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="App">
      {/* --- Navigation Bar --- */}
      <nav style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1Epx solid #ccc' }}>
        <Link to="/" style={{ marginRight: '10px' }}>Dashboard</Link>
        <Link to="/marketplace" style={{ marginRight: '10px' }}>Marketplace</Link>
        <Link to="/requests" style={{ marginRight: '10px' }}>Requests</Link>
        {isAuthenticated ? (
          <button onClick={logout} style={{ float: 'right' }}>Logout</button>
        ) : (
          <Link to="/login" style={{ float: 'right' }}>Login</Link>
        )}
      </nav>

      {/* --- Route Definitions --- */}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/requests" element={<Requests />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App