import React from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f1f5f9', justifyContent: 'center', alignItems: 'center', fontFamily: 'Arial' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '24px', width: '380px', textAlign: 'center' }}>
        <h2>Create Account</h2>
        <input type="text" placeholder="Full Name" style={inputS} />
        <input type="email" placeholder="Email" style={inputS} />
        <input type="password" placeholder="Password" style={inputS} />
        <button style={btnS} onClick={() => navigate('/login')}>Register</button>
        <p style={{marginTop: '15px', cursor: 'pointer', color: '#3b82f6'}} onClick={() => navigate('/login')}>Already have an account? Login</p>
      </div>
    </div>
  );
};
const inputS = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' };
const btnS = { width: '100%', padding: '14px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' };

export default Register;