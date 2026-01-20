import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
  const [role, setRole] = useState('Operator');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setUser({ username: 'emmadishettianjali', role: role }); // Matches your reference image name
    navigate('/dashboard');
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h4 style={{color: '#64748b', fontSize: '12px'}}>SECURE ACCESS</h4>
        <h2 style={{margin: '10px 0'}}>{role} Login</h2>
        <p style={{color: '#64748b', marginBottom: '25px'}}>Manage operations efficiently.</p>
        
        <div style={styles.roleTabs}>
          {['Operator', 'Analyst', 'Admin'].map(r => (
            <button key={r} onClick={() => setRole(r)} style={role === r ? styles.activeTab : styles.tab}>
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Username or Email" style={styles.input} required />
          <input type="password" placeholder="Password" style={styles.input} required />
          <button type="submit" style={styles.submitBtn}>Login</button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' },
  loginBox: { background: 'white', padding: '40px', borderRadius: '24px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center' },
  roleTabs: { display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '20px' },
  tab: { flex: 1, border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', background: 'none', color: '#64748b' },
  activeTab: { flex: 1, border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', background: '#3b82f6', color: 'white', fontWeight: 'bold' },
  input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' },
  submitBtn: { width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer' }
};

export default Login;