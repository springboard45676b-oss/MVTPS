import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('operator'); // Default
  const [username, setUsername] = useState('Pravinaa');
  const [password, setPassword] = useState('123456');

  const handleLogin = (e) => {
    e.preventDefault();
    // Save the selected role to session storage for the Sidebar to read
    localStorage.setItem('userRole', role);
    navigate('/overview');
  };

  const styles = {
    container: {
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a', // Navy Blue Background
    },
    card: {
      background: '#ffffff', // White Card
      padding: '40px',
      borderRadius: '20px',
      width: '100%',
      maxWidth: '420px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
      textAlign: 'center'
    },
    roleContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '8px',
      marginBottom: '25px'
    },
    roleBtn: (active) => ({
      padding: '10px 15px',
      borderRadius: '8px',
      border: '1px solid #fafafa',
      fontSize: '11px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: '0.3s',
      background: active ? '#0ea5e9' : '#f8fafc',
      color: active ? '#fff' : '#64748b',
    }),
    input: {
      width: '100%',
      padding: '12px',
      margin: '8px 0',
      borderRadius: '8px',
      border: '1px solid #cbd5e1',
      boxSizing: 'border-box'
    },
    loginBtn: {
      width: '100%',
      padding: '14px',
      background: '#0ea5e9',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '15px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={{ color: '#0f172a', fontSize: '24px', marginBottom: '10px' }}>MVTPS Portal</h1>
        <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '14px' }}>Select access level to continue</p>

        {/* ROLE SELECTION */}
        <div style={styles.roleContainer}>
          <button style={styles.roleBtn(role === 'operator')} onClick={() => setRole('operator')}>OPERATOR</button>
          <button style={styles.roleBtn(role === 'analyst')} onClick={() => setRole('analyst')}>ANALYST</button>
          <button style={styles.roleBtn(role === 'admin')} onClick={() => setRole('admin')}>ADMIN</button>
        </div>

        <form onSubmit={handleLogin}>
          <input style={styles.input} type="text" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} />
          <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          
          <button type="submit" style={styles.loginBtn}>
            Login as {role.toUpperCase()}
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '13px', color: '#64748b' }}>
          Don't have an account? <span style={{ color: '#0ea5e9', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}
          onClick={() => navigate('/signup')}
          >
            Signup
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;