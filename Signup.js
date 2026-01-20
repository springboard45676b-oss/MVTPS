import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: 'Pravinaa',
    email: 'Pravinaa@gmail.com',
    password: '123456',
    confirmPassword: ''
  });

  const handleSignup = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert("Account created for Pravinaa!");
    navigate('/login');
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '20px', width: '400px', textAlign: 'center' }}>
        <h2 style={{ color: '#0f172a' }}>MVTPS Signup</h2>
        <form onSubmit={handleSignup}>
          <input 
            style={inputStyle} type="text" placeholder="Username" 
            value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} 
          />
          <input 
            style={inputStyle} type="email" placeholder="Email" 
            value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
          />
          <input 
            style={inputStyle} type="password" placeholder="Password" 
            value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />
          <input 
            style={inputStyle} type="password" placeholder="Confirm Password" 
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
          />
          <button type="submit" style={btnStyle}>Create Account</button>
        </form>
        <p style={{ marginTop: '15px', fontSize: '14px' }}>
          Already have an account? <span onClick={() => navigate('/login')} style={{ color: '#0ea5e9', cursor: 'pointer', fontWeight: 'bold' }}>Login</span>
        </p>
      </div>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '12px', margin: '8px 0', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '12px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };

export default Signup;