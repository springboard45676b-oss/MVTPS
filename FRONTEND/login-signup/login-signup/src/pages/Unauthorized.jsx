import React from "react";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('user_role') || 'unknown';

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div style={{ 
      padding: 30, 
      maxWidth: 600, 
      margin: '50px auto',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#dc3545' }}>⛔ Unauthorized Access</h1>
      
      <div style={{ 
        backgroundColor: '#f8d7da', 
        padding: 20, 
        borderRadius: 8, 
        marginBottom: 30,
        border: '1px solid #f5c6cb',
        color: '#721c24'
      }}>
        <p style={{ fontSize: '16px', margin: '10px 0' }}>
          You don't have permission to access this page.
        </p>
        <p style={{ fontSize: '14px', margin: '10px 0' }}>
          Your current role: <strong>{userRole.toUpperCase()}</strong>
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={handleGoBack}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Go Back
        </button>
        
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
    </div>
  );
}
