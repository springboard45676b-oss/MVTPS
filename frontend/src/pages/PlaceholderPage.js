import React from 'react';
import { useNavigate } from 'react-router-dom';

const PlaceholderPage = ({ title, user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Arial' }}>
      <nav style={styles.nav}>
        <div style={{ fontWeight: 'bold', fontSize: '22px' }}>🚢 MVTPS</div>
        <div style={styles.menu}>
          <span onClick={() => navigate('/dashboard')} style={styles.link}>Dashboard</span>
          <span onClick={() => navigate('/vessels')} style={styles.link}>Vessels</span>
          <span onClick={() => navigate('/tracking')} style={styles.link}>Live Tracking</span>
        </div>
        <div style={styles.userSection}>
          <div style={styles.userBadge}>
            <div style={styles.avatar}>EA</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Signed in</div>
              <strong style={{ fontSize: '14px' }}>emmadishettianjali</strong>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={{ padding: '60px 100px', textAlign: 'center' }}>
        <h1>{title}</h1>
        <p style={{ color: '#64748b', fontSize: '18px' }}>
          This section is currently under maintenance or being updated with live data.
        </p>
        <button 
          onClick={() => navigate('/dashboard')} 
          style={styles.backBtn}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', padding: '10px 60px', background: 'white', borderBottom: '1px solid #e2e8f0', alignItems: 'center' },
  menu: { display: 'flex', gap: '30px' },
  link: { cursor: 'pointer', fontWeight: '500', color: '#64748b' },
  userSection: { display: 'flex', alignItems: 'center', gap: '15px' },
  userBadge: { display: 'flex', alignItems: 'center', gap: '12px', background: '#f1f5f9', padding: '6px 15px', borderRadius: '30px', border: '1px solid #e2e8f0' },
  avatar: { width: '35px', height: '35px', background: '#1e293b', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  logoutBtn: { padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  backBtn: { marginTop: '20px', padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};

export default PlaceholderPage;