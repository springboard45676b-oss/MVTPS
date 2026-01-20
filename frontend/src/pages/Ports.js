import React from 'react';
import { useNavigate } from 'react-router-dom';

const Ports = ({ user, setUser }) => {
  const navigate = useNavigate();

  // Updated port data structure
  const portData = [
    { name: "Port of Rotterdam", congestion: "45%", wait: "12.4h", status: "Operational" },
    { name: "Port of Singapore", congestion: "68%", wait: "24.1h", status: "High Traffic" },
    { name: "Port of Shanghai", congestion: "82%", wait: "36.8h", status: "Congested" }
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
          <span style={{...styles.link, color:'#3b82f6', borderBottom: '2px solid #3b82f6'}}>Ports</span>
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
        <h2>⚓ Port Statistics & Congestion</h2>
        
        {/* Updated Table Implementation */}
        <table style={{width:'100%', borderCollapse:'collapse', marginTop:'20px', background: 'white', borderRadius: '8px', overflow: 'hidden'}}>
          <thead>
            <tr style={{background:'#f1f5f9', textAlign: 'left'}}>
              <th style={styles.th}>Port</th>
              <th style={styles.th}>Congestion</th>
              <th style={styles.th}>Wait Time</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {portData.map((p, i) => (
              <tr key={i} style={{borderBottom:'1px solid #eee'}}>
                <td style={styles.td}><strong>{p.name}</strong></td>
                <td style={styles.td}>{p.congestion}</td>
                <td style={styles.td}>{p.wait}</td>
                <td style={{...styles.td, fontWeight: 'bold', color: p.status === 'Congested' ? 'red' : 'green'}}>
                  {p.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{...styles.logoutBtn, backgroundColor: '#3b82f6', marginTop: '30px'}}
        >
          Return to Dashboard
        </button>
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
  th: { padding: '15px 20px', color: '#475569', fontSize: '14px' },
  td: { padding: '15px 20px' }
};

export default Ports;