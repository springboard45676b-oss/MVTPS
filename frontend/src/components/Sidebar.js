import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ user, setUser }) => {
    // Dynamic style to highlight the active page
    const navLinkStyle = ({ isActive }) => ({
        display: 'block',
        padding: '12px 20px',
        textDecoration: 'none',
        color: isActive ? '#3b82f6' : '#64748b', // Blue if active, grey if not
        fontWeight: isActive ? 'bold' : 'normal',
        backgroundColor: isActive ? '#eff6ff' : 'transparent',
        borderRadius: '8px',
        marginBottom: '5px',
        transition: 'all 0.3s ease'
    });

    const handleLogout = () => {
        setUser(null);
    };

    return (
        <div style={styles.sidebar}>
            <div style={styles.logo}>🚢 MVTPS</div>
            <nav style={styles.nav}>
                <NavLink to="/dashboard" style={navLinkStyle}>📊 Dashboard</NavLink>
                <NavLink to="/vessels" style={navLinkStyle}>🚢 Vessels List</NavLink>
                <NavLink to="/tracking" style={navLinkStyle}>📍 Live Tracking</NavLink>
                {/* Correct Link to your new Voyages page */}
                <NavLink to="/voyages" style={navLinkStyle}>📅 Voyage Schedules</NavLink>
            </nav>
            
            <div style={styles.footer}>
                <div style={styles.userInfo}>
                    <small>User: {user?.username || 'Operator'}</small>
                </div>
                <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </div>
        </div>
    );
};

const styles = {
    sidebar: { width: '260px', height: '100vh', background: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0 },
    logo: { padding: '25px', fontSize: '22px', fontWeight: 'bold', borderBottom: '1px solid #f1f5f9' },
    nav: { flex: 1, padding: '20px' },
    footer: { padding: '20px', borderTop: '1px solid #f1f5f9' },
    userInfo: { marginBottom: '10px', fontSize: '12px', color: '#64748b' },
    logoutBtn: { width: '100%', padding: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};

// CRITICAL: This default export fixes the "Module has no exports" error
export default Sidebar;