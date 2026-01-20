import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Notifications = ({ user, setUser }) => {
  const navigate = useNavigate();
  
  // Alert data as shown in your reference image requirements
  const [notifications] = useState([
    { id: 1, title: 'Storm Warning Updated', msg: 'New storm cell detected near Rotterdam coordinates. Wind speeds 50+ knots.', date: 'Just now', type: 'Critical' },
    { id: 2, title: 'Vessel Delayed', msg: 'MSC GULSEUM is reporting a 4-hour delay due to port congestion.', date: '2 hours ago', type: 'Warning' },
    { id: 3, title: 'System Maintenance', msg: 'MVTPS backend will undergo maintenance at 02:00 UTC tonight.', date: 'Yesterday', type: 'System' },
    { id: 4, title: 'AIS Signal Lost', msg: 'Vessel ONE INNOVATION has not reported a signal for 30 minutes.', date: 'Yesterday', type: 'Critical' }
  ]);

  const handleLogout = () => { setUser(null); navigate('/login'); };

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
            <h2>🔔 Notifications & Alerts</h2>
            <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>Back to Dashboard</button>
        </div>

        <div style={styles.notifList}>
          {notifications.map(n => (
            <div key={n.id} style={{
                ...styles.notifCard, 
                borderLeft: n.type === 'Critical' ? '5px solid #ef4444' : n.type === 'Warning' ? '5px solid #f59e0b' : '5px solid #3b82f6'
            }}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div>
                  <h4 style={{margin: '0 0 5px 0'}}>{n.title}</h4>
                  <p style={{margin: 0, color: '#475569', fontSize: '14px'}}>{n.msg}</p>
                </div>
                <small style={{color: '#94a3b8', whiteSpace: 'nowrap'}}>{n.date}</small>
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
  container: { padding: '40px 60px', maxWidth: '900px', margin: '0 auto' },
  backBtn: { padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  notifList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  notifCard: { background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }
};

export default Notifications;