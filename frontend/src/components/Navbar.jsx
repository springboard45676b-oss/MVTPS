import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Ship, Anchor, Route, MapPin, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import NotificationManager from './NotificationManager';

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/vessels', icon: Ship, label: 'Vessels' },
    { path: '/ports', icon: Anchor, label: 'Ports' },
    { path: '/voyages', icon: Route, label: 'Voyages' },
    { path: '/livetracking', icon: MapPin, label: 'Live Tracking' },
  ];

  const styles = {
    navbar: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#1e40af',
      color: 'white',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      padding: '0 16px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
    },
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    brand: {
      fontSize: '14px',
      fontWeight: '600',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      whiteSpace: 'nowrap',
    },
    menu: {
      display: 'none',
      gap: '2px',
    },
    menuDesktop: {
      display: 'flex',
      gap: '2px',
    },
    mobileMenuButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      border: 'none',
      borderRadius: '6px',
      backgroundColor: 'transparent',
      color: 'white',
      cursor: 'pointer',
    },
    mobileMenu: {
      position: 'absolute',
      top: '64px',
      left: 0,
      right: 0,
      backgroundColor: '#1e40af',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    navLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 12px',
      border: 'none',
      borderRadius: '6px',
      backgroundColor: 'transparent',
      color: 'white',
      cursor: 'pointer',
      fontSize: '13px',
      transition: 'background-color 0.2s',
      textDecoration: 'none',
      whiteSpace: 'nowrap',
    },
    navLinkActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      padding: '6px 12px',
      borderRadius: '6px',
      transition: 'background-color 0.2s',
    },
    avatar: {
      width: '32px',
      height: '32px',
      backgroundColor: '#3b82f6',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      fontSize: '13px',
    },
    userDetails: {
      fontSize: '13px',
      lineHeight: '1.4',
    },
    username: {
      fontWeight: '600',
    },
    role: {
      color: '#bfdbfe',
      fontSize: '11px',
    },
    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      border: 'none',
      borderRadius: '6px',
      backgroundColor: '#dc2626',
      color: 'white',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'background-color 0.2s',
    },
  };

  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          .mobile-menu-button { display: none !important; }
          .menu-desktop { display: flex !important; }
        }
        @media (max-width: 1024px) {
          .menu-desktop { gap: 2px !important; }
          .menu-desktop span { display: none !important; }
        }
        @media (max-width: 768px) {
          .mobile-menu-button { display: flex !important; }
          .menu-desktop { display: none !important; }
          .user-details { display: none !important; }
          .logout-button span { display: none !important; }
        }
      `}</style>
      
      <nav style={styles.navbar}>
        <div style={styles.container}>
          {/* Brand/Logo */}
          <div style={styles.brand}>
            <h1>Maritime Tracking</h1>
          </div>

          {/* Desktop Navigation Links */}
          <div className="menu-desktop" style={styles.menuDesktop}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    ...styles.navLink,
                    ...(isActive ? styles.navLinkActive : {}),
                  })}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.classList.contains('active')) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.classList.contains('active')) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-button"
            style={styles.mobileMenuButton}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* User Info & Logout */}
          <div style={styles.userSection}>
            {user && (
              <>
                <NotificationManager />
                <div style={{ position: 'relative' }}>
                  <div 
                    style={styles.userInfo}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={styles.avatar}>
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="user-details" style={styles.userDetails}>
                      <div style={styles.username}>{user.username}</div>
                      <div style={styles.role}>{user.role || 'User'}</div>
                    </div>
                  </div>
                  
                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: '0',
                      marginTop: '8px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      overflow: 'hidden',
                      zIndex: 1000,
                      minWidth: '160px'
                    }}>
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setShowUserMenu(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 16px',
                          backgroundColor: 'transparent',
                          color: '#1f2937',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          width: '100%',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <User size={16} />
                        Profile
                      </button>
                      <div style={{ height: '1px', backgroundColor: '#e5e7eb' }} />
                      <button
                        onClick={handleLogout}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 16px',
                          backgroundColor: 'transparent',
                          color: '#dc2626',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          width: '100%',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div style={styles.mobileMenu}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                })}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Navbar;