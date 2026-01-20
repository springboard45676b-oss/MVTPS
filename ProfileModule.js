import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileModule = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('Ship Owner');
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const handleLogout = () => {
    // Clear the role and redirect to login
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const styles = {
    container: { padding: '40px', display: 'flex', justifyContent: 'center' },
    card: { 
      background: '#ffffff', 
      width: '100%', 
      maxWidth: '550px', 
      borderRadius: '16px', 
      padding: '30px', 
      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0'
    },
    headerRow: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '30px' 
    },
    goBackBtn: { 
      padding: '8px 16px', 
      background: '#f1f5f9', 
      border: 'none', 
      borderRadius: '8px', 
      cursor: 'pointer', 
      color: '#64748b', 
      fontWeight: '600' 
    },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: '500' },
    input: { 
      width: '100%', 
      padding: '12px', 
      borderRadius: '8px', 
      border: '1px solid #cbd5e1', 
      background: '#f8fafc',
      boxSizing: 'border-box'
    },
    passwordToggle: {
      color: '#0ea5e9',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      padding: '0',
      marginBottom: '20px',
      textDecoration: 'underline'
    },
    actionGroup: {
      marginTop: '30px',
      paddingTop: '20px',
      borderTop: '1px solid #f1f5f9',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    btnPrimary: { padding: '12px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    btnUpdate: { padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    btnLogout: { padding: '12px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* TOP SECTION */}
        <div style={styles.headerRow}>
          <h2 style={{ margin: 0, color: '#0f172a' }}>Account Settings</h2>
          <button style={styles.goBackBtn} onClick={() => navigate(-1)}>← Go Back</button>
        </div>

        {/* PROFILE INFO */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Username</label>
          <input style={styles.input} type="text" value="Pravinaa" readOnly />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input style={styles.input} type="email" value="Pravinaa@gmail.com" readOnly />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Stakeholder Role</label>
          <select 
            style={styles.input} 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="ship owner">Ship Owner</option>
            <option value="port authority">Port Authority</option>
            <option value="insurer">Insurer</option>
          </select>
        </div>

        {/* PASSWORD SECTION */}
        <button 
          style={styles.passwordToggle} 
          onClick={() => setShowPasswordFields(!showPasswordFields)}
        >
          {showPasswordFields ? "Cancel Password Change" : "Change Password"}
        </button>

        {showPasswordFields && (
          <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Old Password</label>
              <input style={styles.input} type="password" placeholder="••••••••" />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>New Password</label>
              <input style={styles.input} type="password" placeholder="Enter new password" />
            </div>
          </div>
        )}

        {/* BOTTOM ACTION BUTTONS */}
        <div style={styles.actionGroup}>
          <button style={styles.btnPrimary}>Edit Profile</button>
          <button style={styles.btnUpdate} onClick={() => alert('All data updated successfully!')}>Update All</button>
          <button style={styles.btnLogout} onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModule;