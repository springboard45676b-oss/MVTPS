import React from "react";
import { useNavigate } from "react-router-dom";

export default function Operator() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Operator';
  const userRole = localStorage.getItem('user_role') || 'operator';

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div style={{ padding: 30, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <h1>Operator Dashboard</h1>
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
      
      <div style={{ backgroundColor: '#f8f9fa', padding: 20, borderRadius: 8, marginBottom: 30 }}>
        <p style={{ fontSize: '18px', margin: 0 }}>Welcome, <strong>{username}</strong></p>
        <p style={{ fontSize: '14px', color: '#666', margin: '5px 0 0 0' }}>Role: <strong>{userRole.toUpperCase()}</strong></p>
      </div>

      <div style={{ backgroundColor: '#fff3cd', padding: 15, borderRadius: 8, border: '1px solid #ffc107' }}>
        <p>This is the Operator Dashboard. Here you can manage operator-specific tasks and operations.</p>
      </div>
    </div>
  );
}
