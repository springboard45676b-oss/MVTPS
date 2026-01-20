import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GlobalHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1] || 'Overview';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const styles = {
    header: {
      height: '70px',
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 30px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    rightSection: { display: 'flex', alignItems: 'center', gap: '20px' },
    iconBtn: { 
      background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', 
      position: 'relative', transition: '0.3s', color: '#64748b' 
    },
    badge: {
      position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444',
      color: 'white', fontSize: '10px', padding: '2px 5px', borderRadius: '50%'
    }
  };

  return (
    <header style={styles.header}>
      <div>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{getPageTitle()}</h2>
      </div>

      <div style={styles.rightSection}>
        {/* Notification Bell */}
        <button style={styles.iconBtn} onClick={() => navigate('/notifications')}>
          🔔
          <span style={styles.badge}>3</span>
        </button>

        {/* Profile Section */}
        <div 
          style={{ ...styles.rightSection, cursor: 'pointer', borderLeft: '1px solid #e2e8f0', paddingLeft: '20px' }}
          onClick={() => navigate('/profile')}
        >
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Pravinaa</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#10b981' }}>Fleet Admin</p>
          </div>
          <div style={{ width: '35px', height: '35px', background: '#0ea5e9', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            P
          </div>
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;