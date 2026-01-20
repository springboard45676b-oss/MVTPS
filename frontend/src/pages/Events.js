import React from 'react';
import { useNavigate } from 'react-router-dom';

const Events = ({ user, setUser }) => {
  const navigate = useNavigate();

  // Mock operational events data
  const eventLogs = [
    { id: 1, type: 'Port Entry', vessel: 'MSC Gulseum', location: 'Rotterdam', time: '2026-01-05 08:30', severity: 'Info' },
    { id: 2, type: 'Weather Alert', vessel: 'COSCO SHIPPING UNIVERSE', location: 'North Sea', time: '2026-01-05 06:15', severity: 'High' },
    { id: 3, type: 'Departure', vessel: 'ONE Innovation', location: 'Singapore', time: '2026-01-04 22:00', severity: 'Info' },
    { id: 4, type: 'Route Deviation', vessel: 'Ever Given', location: 'Suez Canal', time: '2026-01-04 14:45', severity: 'Medium' }
  ];

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.logo}>🚢 MVTPS</div>
        <div style={styles.userSection}>
          <div style={styles.userBadge}>
            <div style={styles.avatar}>EA</div>
            <strong style={{fontSize:'14px'}}>emmadishettianjali</strong>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
            <h2>📝 Operational Events</h2>
            <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>Back to Dashboard</button>
        </div>

        <div style={styles.logList}>
          {eventLogs.map(log => (
            <div key={log.id} style={styles.eventCard}>
              <div style={{
                ...styles.severityBar, 
                backgroundColor: log.severity === 'High' ? '#ef4444' : log.severity === 'Medium' ? '#f59e0b' : '#3b82f6'
              }}></div>
              <div style={{flex: 1}}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <strong style={{fontSize:'16px'}}>{log.type}: {log.vessel}</strong>
                  <small style={{color:'#64748b'}}>{log.time}</small>
                </div>
                <p style={{margin: '5px 0', color: '#475569'}}>Location: {log.location}</p>
                <span style={{
                    fontSize: '10px', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    background: '#f1f5f9',
                    color: '#64748b',
                    fontWeight: 'bold'
                }}>{log.severity.toUpperCase()}</span>
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
  userSection: { display: 'flex', alignItems: 'center', gap: '15px' },
  userBadge: { display: 'flex', alignItems: 'center', gap: '12px', background: '#f1f5f9', padding: '6px 15px', borderRadius: '30px' },
  avatar: { width: '30px', height: '30px', background: '#1e293b', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  logoutBtn: { padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  container: { padding: '40px 60px' },
  backBtn: { padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  logList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  eventCard: { display: 'flex', background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  severityBar: { width: '5px', borderRadius: '10px', marginRight: '20px' }
};

export default Events;