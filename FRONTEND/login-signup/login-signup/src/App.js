import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginSignup from './components/LoginSignup/loginsignup';
import Admin from './pages/Admin';
import Analyst from './pages/Analyst';
import Operator from './pages/Operator';
import Home from './pages/Home';
import Unauthorized from './pages/Unauthorized';
// import MaritimeDashboard from './pages/MaritimeDashboard';
import MaritimeDashboard from './components/MaritimeDashboard';

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('jwt');
  const userRole = localStorage.getItem('user_role');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        
        
          <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <MaritimeDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <MaritimeDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/analyst" 
          element={
            <ProtectedRoute requiredRole="analyst">
              <MaritimeDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/operator" 
          element={
            <ProtectedRoute requiredRole="operator">
              <MaritimeDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
