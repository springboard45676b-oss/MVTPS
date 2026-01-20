import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const userRole = localStorage.getItem('userRole') || 'operator';

  // MASTER MENU WITH ROLE DEFINITIONS
  const allMenuItems = [
    { path: '/overview', label: 'Overview', icon: '📊', roles: ['operator', 'admin'] },
    { path: '/map', label: 'Fleet Map', icon: '📍', roles: ['operator', 'analyst', 'admin'] },
    { path: '/ports', label: 'Port Hubs', icon: '⚓', roles: ['operator', 'admin'] },
    { path: '/analytics', label: 'Analytics', icon: '📈', roles: ['operator', 'analyst'] },
    { path: '/replay', label: 'Voyage Replay', icon: '⏪', roles: ['operator', 'analyst'] },
    { path: '/admin', label: 'Admin Control', icon: '⚙️', roles: ['operator'] },
  ];

  // Filter items based on the logged-in role
  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  const styles = {
    sidebar: {
      width: '260px',
      background: '#0f172a',
      height: '100vh',
      padding: '20px 15px',
    },
    logo: { color: '#38bdf8', fontSize: '20px', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' },
    navLink: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      padding: '12px',
      borderRadius: '10px',
      marginBottom: '8px',
      background: isActive ? '#0ea5e9' : 'transparent',
      color: isActive ? '#fff' : '#94a3b8',
      fontWeight: '500'
    })
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>MVTPS PORTAL</div>
      <p style={{ color: '#475569', fontSize: '10px', textAlign: 'center', marginBottom: '20px' }}>
        ROLE: {userRole.toUpperCase()}
      </p>
      <nav>
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path} style={styles.navLink(location.pathname === item.path)}>
            <span style={{ marginRight: '12px' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;