import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaShip, FaAnchor, FaSignOutAlt, FaChartPie, FaWater } from 'react-icons/fa';

const Navbar = ({ onLogout }) => {
  const location = useLocation();

  // Styles for the Navigation Bar
  const styles = {
    nav: {
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      padding: '0 30px',
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#0f172a',
      textDecoration: 'none',
    },
    linksSection: {
      display: 'flex',
      gap: '30px',
    },
    link: {
      textDecoration: 'none',
      color: '#64748b',
      fontSize: '1rem',
      fontWeight: '600',
      padding: '10px 0',
      borderBottom: '3px solid transparent',
      transition: 'all 0.3s',
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px'
    },
    activeLink: {
      color: '#0ea5e9', // Blue color
      borderBottom: '3px solid #0ea5e9',
    },
    logoutBtn: {
      backgroundColor: '#fee2e2',
      color: '#ef4444',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      fontWeight: 'bold',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.9rem',
    }
  };

  const getLinkStyle = (path) => {
    return location.pathname === path 
      ? { ...styles.link, ...styles.activeLink } 
      : styles.link;
  };

  return (
    <nav style={styles.nav}>
      {/* LEFT: LOGO */}
      <div style={styles.logoSection}>
        <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '8px', borderRadius: '8px', display:'flex' }}>
            <FaAnchor size={20}/>
        </div>
        <span>MVTPS</span>
      </div>

      {/* MIDDLE: LINKS */}
      <div style={styles.linksSection}>
        <Link to="/" style={getLinkStyle('/')}>
           <FaChartPie /> Dashboard
        </Link>
        <Link to="/voyages" style={getLinkStyle('/voyages')}>
           <FaShip /> Voyages
        </Link>
        {/* Placeholder links to match your design */}
        <span style={{...styles.link, opacity: 0.5, cursor: 'not-allowed'}}>
            <FaWater /> Live Tracking
        </span>
      </div>

      {/* RIGHT: LOGOUT */}
      <button onClick={onLogout} style={styles.logoutBtn}>
        <FaSignOutAlt /> Logout
      </button>
    </nav>
  );
};

export default Navbar;