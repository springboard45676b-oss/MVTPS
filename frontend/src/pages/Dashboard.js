import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user, setUser }) => {
  const navigate = useNavigate();

  // Define which links each role can see
  const rolePermissions = {
    Admin: ['Vessels', 'Ports', 'Voyages', 'Events', 'Notifications', 'Live Tracking'],
    Operator: ['Vessels', 'Voyages', 'Live Tracking'],
    Analyst: ['Ports', 'Events']
  };

  const menuItems = [
    { name: 'Vessels', desc: 'Fleet overview and positions', path: '/vessels', icon: '🚢' },
    { name: 'Ports', desc: 'Port stats & congestion', path: '/ports', icon: '⚓' },
    { name: 'Voyages', desc: 'Schedules and statuses', path: '/voyages', icon: '📅' },
    { name: 'Events', desc: 'Operational events', path: '/events', icon: '📝' },
    { name: 'Notifications', desc: 'Alerts and updates', path: '/notifications', icon: '🔔' },
    { name: 'Live Tracking', desc: 'Interactive World Map', path: '/tracking', icon: '🗺️' }
  ];

  const allowedItems = menuItems.filter(item => 
    rolePermissions[user?.role]?.includes(item.name)
  );

  const handleLogout = () => { setUser(null); navigate('/login'); };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.logo}>🚢 MVTPS</div>
        <div style={styles.userBadge}>
          <div style={styles.avatar}>EA</div>
          <strong style={{fontSize:'14px'}}>{user?.username || 'emmadishettianjali'}</strong>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.container}>
        <h1 style={styles.title}>{user?.role} Dashboard</h1>
        <p style={styles.subtitle}>Welcome, {user?.username || 'emmadishettianjali'}.</p>

        {/* 🚀 ONLY ADMIN SEES THESE SUMMARY CARDS */}
        {user?.role === 'Admin' && (
          <div style={styles.statsRow}>
            <div style={styles.summaryCard}><small>Total Fleet</small><h2>12 Vessels</h2></div>
            <div style={styles.summaryCard}><small>Active Voyages</small><h2>8 In-Transit</h2></div>
            <div style={{...styles.summaryCard, borderLeft: '4px solid #f59e0b'}}>
                <small>Average Congestion</small><h2 style={{color: '#f59e0b'}}>6.2/10</h2>
            </div>
            <div style={{...styles.summaryCard, borderLeft: '4px solid #ef4444'}}>
                <small>System Alerts</small><h2 style={{color: '#ef4444'}}>3 Urgent</h2>
            </div>
          </div>
        )}

        <div style={styles.grid}>
          {allowedItems.map(item => (
            <div key={item.name} onClick={() => navigate(item.path)} style={styles.card}>
              <div style={styles.cardIcon}>{item.icon}</div>
              <h3>{item.name}</h3>
              <p style={styles.cardDesc}>{item.desc}</p>
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
  userBadge: { display: 'flex', alignItems: 'center', gap: '12px', background: '#f1f5f9', padding: '6px 15px', borderRadius: '30px' },
  avatar: { width: '30px', height: '30px', background: '#1e293b', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  logoutBtn: { padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginLeft: '10px' },
  container: { padding: '40px 60px' },
  title: { fontSize: '32px', marginBottom: '5px' },
  subtitle: { color: '#64748b', marginBottom: '30px' },
  statsRow: { display: 'flex', gap: '20px', marginBottom: '30px' },
  summaryCard: { flex: 1, background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card: { background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer' },
  cardIcon: { fontSize: '24px', marginBottom: '10px' },
  cardDesc: { color: '#64748b', fontSize: '13px' }
};

export default Dashboard;