import React from 'react';
import { useAuth } from '../services/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="container">
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '20px 0',
        borderBottom: '1px solid #eee',
        marginBottom: '30px'
      }}>
        <h1>Maritime Platform Dashboard</h1>
        <div>
          <span style={{ marginRight: '20px' }}>
            Welcome, {user?.first_name || user?.username} ({user?.role})
          </span>
          <button onClick={handleLogout} style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Logout
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3>User Profile</h3>
          <p><strong>Username:</strong> {user?.username}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
          <p><strong>Company:</strong> {user?.company || 'Not specified'}</p>
          <p><strong>Phone:</strong> {user?.phone || 'Not specified'}</p>
        </div>

        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3>Quick Actions</h3>
          <p>🚢 Vessel Management</p>
          <p>🏭 Port Operations</p>
          <p>🗺️ Voyage Tracking</p>
          <p>📊 Analytics Dashboard</p>
        </div>

        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3>System Status</h3>
          <p>✅ Authentication: Active</p>
          <p>✅ Database: Connected</p>
          <p>⏳ External APIs: Pending Setup</p>
          <p>⏳ Real-time Tracking: Pending Setup</p>
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: '#e7f3ff', borderRadius: '8px' }}>
        <h3>Week 1 Milestone Completed ✅</h3>
        <ul style={{ textAlign: 'left' }}>
          <li>✅ User roles defined: Operator, Analyst, Admin</li>
          <li>✅ Database schema implemented (users, vessels, ports, voyages, events, notifications)</li>
          <li>✅ Django REST backend initialized</li>
          <li>✅ React frontend project initialized</li>
          <li>✅ JWT authentication endpoints implemented</li>
          <li>✅ User registration and login UI completed</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;