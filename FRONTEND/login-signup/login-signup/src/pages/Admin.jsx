import React from "react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Admin';
  const userRole = localStorage.getItem('user_role') || 'admin';

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div style={{ padding: 30, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <h1>Admin Dashboard</h1>
        <button 
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Logout
        </button>
      </div>
      
      <div style={{ backgroundColor: '#d1ecf1', padding: 20, borderRadius: 8, marginBottom: 30 }}>
        <p style={{ fontSize: '18px', margin: 0 }}>Welcome, <strong>{username}</strong></p>
        <p style={{ fontSize: '14px', color: '#0c5460', margin: '5px 0 0 0' }}>Role: <strong>{userRole.toUpperCase()}</strong></p>
      </div>

      <div style={{ backgroundColor: '#d1ecf1', padding: 15, borderRadius: 8, border: '1px solid #0c5460' }}>
        <p>This is the Admin Dashboard. Here you can manage system settings, user accounts, and administrative tasks.</p>
      </div>
    </div>
  );
}
