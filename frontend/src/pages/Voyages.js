import React from 'react';
import { useNavigate } from 'react-router-dom';

const Voyages = ({ user, setUser }) => {
  const navigate = useNavigate();
  const schedules = [
    { ship: "MSC Gulseum", origin: "Singapore", eta: "2026-01-10", status: "On Time" },
    { ship: "COSCO Shipping Universe", origin: "Shanghai", eta: "2026-01-12", status: "Delayed" },
    { ship: "ONE Innovation", origin: "Dubai", eta: "2026-01-15", status: "On Time" }
  ];

  const handleLogout = () => { setUser(null); navigate('/login'); };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.logo}>🚢 MVTPS</div>
        <div style={styles.menu}>
          <span onClick={() => navigate('/dashboard')} style={styles.link}>Dashboard</span>
          <span onClick={() => navigate('/vessels')} style={styles.link}>Vessels</span>
          <span onClick={() => navigate('/tracking')} style={styles.link}>Live Tracking</span>
          <span style={{...styles.link, color:'#3b82f6', borderBottom: '2px solid #3b82f6'}}>Voyages</span>
        </div>
        <div style={styles.userSection}>
          <div style={styles.userBadge}>
            <div style={styles.avatar}>EA</div>
            <strong style={{fontSize:'14px'}}>emmadishettianjali</strong>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={{ padding: '40px 60px' }}>
        <h2>📅 Voyage Schedules</h2>
        <div style={{marginTop: '20px'}}>
          {schedules.map((v, i) => (
            <div key={i} style={styles.card}>
              <div>
                <strong style={{fontSize: '18px'}}>{v.ship}</strong>
                <p style={{margin: '5px 0', color: '#64748b'}}>Route: {v.origin} → Rotterdam</p>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: '14px', fontWeight: 'bold'}}>ETA: {v.eta}</div>
                <div style={{color: v.status === 'Delayed' ? 'red' : 'green'}}>{v.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Arial' },
  nav: { display: 'flex', justifyContent: 'space-between', padding: '10px 60px', background: 'white', borderBottom: '1px solid #e2e8f0', alignItems: 'center' },
  logo: { fontWeight: 'bold', fontSize: '22px' },
  menu: { display: 'flex', gap: '30px' },
  link: { cursor: 'pointer', fontWeight: '500', color: '#64748b' },
  userSection: { display: 'flex', alignItems: 'center', gap: '15px' },
  userBadge: { display: 'flex', alignItems: 'center', gap: '12px', background: '#f1f5f9', padding: '6px 15px', borderRadius: '30px' },
  avatar: { width: '35px', height: '35px', background: '#1e293b', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  logoutBtn: { padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  card: { display: 'flex', justifyContent: 'space-between', background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '15px', alignItems: 'center' }
};

export default Voyages;