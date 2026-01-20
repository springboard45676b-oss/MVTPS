import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VesselList = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [vessels, setVessels] = useState([]);

  useEffect(() => {
    // This connects to the Django database you are currently filling
    axios.get('http://127.0.0.1:8000/api/vessels/')
      .then(res => setVessels(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleLogout = () => { setUser(null); navigate('/login'); };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.logo}>🚢 MVTPS</div>
        <div style={styles.userBadge}>
            <div style={styles.avatar}>EA</div>
            <strong>emmadishettianjali</strong>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>
      <div style={{ padding: '40px' }}>
        <h2>Fleet List ({vessels.length})</h2>
        <div style={styles.grid}>
          {vessels.map(v => (
            <div key={v.id} style={styles.card}>
              <strong>{v.name}</strong><br/>
              <small>IMO: {v.imo_number} | Flag: {v.flag}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// This section fixes the "styles is not defined" error
const styles = {
  page: { background: '#f8fafc', minHeight: '100vh', fontFamily: 'Arial' },
  nav: { display: 'flex', justifyContent: 'space-between', padding: '10px 60px', background: 'white', borderBottom: '1px solid #ddd', alignItems: 'center' },
  logo: { fontWeight: 'bold', fontSize: '22px' },
  userBadge: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '30px', height: '30px', background: '#1e293b', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoutBtn: { padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  grid: { display: 'grid', gap: '15px' },
  card: { background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }
};

// This line fixes the "export 'default' was not found" error
export default VesselList;