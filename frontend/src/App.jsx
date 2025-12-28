import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Vessels from './pages/Vessels';
import Ports from './pages/Ports';
import Voyages from './pages/Voyages';
import Events from './pages/Events';
import Notifications from './pages/Notifications';
import LiveTracking from './pages/LiveTracking';
import Profile from './pages/Profile'
import { Ship, Anchor, Navigation, Calendar, Bell, MapPin, User, LogOut, Activity, TrendingUp, BarChart3, Clock, Info } from 'lucide-react';
const Dash = ({ onNavigate }) => {
  return (
    <div style={{ 
      width: '100%',
      minHeight: 'calc(100vh - 64px)',
      background: 'linear-gradient(135deg, #eff6ff 0%, #f3e8ff 50%, #fce7f3 100%)', 
      padding: '40px',
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', marginTop: 0 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '20px', color: '#6b7280', marginBottom: '40px', marginTop: 0 }}>
          Maritime Vessel Tracking System
        </p>
        {/* Dashboard Cards Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, 320px)', 
          gap: '24px', 
          marginBottom: '24px'
        }}>
          
          {/* Vessels Card */}
          <div 
            onClick={() => onNavigate('vessels')}
            style={{ 
              background: 'white', 
              borderRadius: '16px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
              padding: '24px',
              cursor: 'pointer',
              width: '320px',
              height: '160px',
              position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', marginTop: 0 }}>
                  VESSELS
                </p>
                <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827', margin: 0, lineHeight: 1 }}>
                  125
                </p>
              </div>
              <div style={{ background: '#f3e8ff', padding: '16px', borderRadius: '16px', flexShrink: 0 }}>
                <Activity style={{ width: '32px', height: '32px', color: '#9333ea', display: 'block' }} />
              </div>
            </div>
            <span style={{ color: '#2563eb', fontWeight: '500', fontSize: '14px' }}>
              View details →
            </span>
          </div>

          {/* Ports Card */}
          <div 
            onClick={() => onNavigate('ports')}
            style={{ 
              background: 'white', 
              borderRadius: '16px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
              padding: '24px',
              cursor: 'pointer',
              width: '320px',
              height: '160px',
              position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', marginTop: 0 }}>
                  PORTS
                </p>
                <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827', margin: 0, lineHeight: 1 }}>
                  354
                </p>
              </div>
              <div style={{ background: '#fce7f3', padding: '16px', borderRadius: '16px', flexShrink: 0 }}>
                <TrendingUp style={{ width: '32px', height: '32px', color: '#ec4899', display: 'block' }} />
              </div>
            </div>
            <span style={{ color: '#2563eb', fontWeight: '500', fontSize: '14px' }}>
              View details →
            </span>
          </div>

          {/* Voyages Card */}
          <div 
            onClick={() => onNavigate('voyages')}
            style={{ 
              background: 'white', 
              borderRadius: '16px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
              padding: '24px',
              cursor: 'pointer',
              width: '320px',
              height: '160px',
              position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', marginTop: 0 }}>
                  VOYAGES
                </p>
                <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827', margin: 0, lineHeight: 1 }}>
                  266
                </p>
              </div>
              <div style={{ background: '#cffafe', padding: '16px', borderRadius: '16px', flexShrink: 0 }}>
                <BarChart3 style={{ width: '32px', height: '32px', color: '#06b6d4', display: 'block' }} />
              </div>
            </div>
            <span style={{ color: '#2563eb', fontWeight: '500', fontSize: '14px' }}>
              View details →
            </span>
          </div>

          {/* Events Card */}
          <div 
            onClick={() => onNavigate('events')}
            style={{ 
              background: 'white', 
              borderRadius: '16px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
              padding: '24px',
              cursor: 'pointer',
              width: '320px',
              height: '160px',
              position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', marginTop: 0 }}>
                  EVENTS
                </p>
                <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827', margin: 0, lineHeight: 1 }}>
                  121
                </p>
              </div>
              <div style={{ background: '#d1fae5', padding: '16px', borderRadius: '16px', flexShrink: 0 }}>
                <Clock style={{ width: '32px', height: '32px', color: '#10b981', display: 'block' }} />
              </div>
            </div>
            <span style={{ color: '#2563eb', fontWeight: '500', fontSize: '14px' }}>
              View details →
            </span>
          </div>

          {/* Notifications Card */}
          <div 
            onClick={() => onNavigate('notifications')}
            style={{ 
              background: 'white', 
              borderRadius: '16px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
              padding: '24px', 
              width: '320px',
              height: '160px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', marginTop: 0 }}>
                  NOTIFICATIONS
                </p>
                <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827', margin: 0, lineHeight: 1 }}>
                  123
                </p>
              </div>
              <div style={{ background: '#fed7aa', padding: '16px', borderRadius: '16px', flexShrink: 0 }}>
                <Info style={{ width: '32px', height: '32px', color: '#f97316', display: 'block' }} />
              </div>
            </div>
            <span style={{ color: '#2563eb', fontWeight: '500', fontSize: '14px' }}>
              View details →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder pages
const Vessel= () => (
  <div style={{ padding: '20px' }}>
    <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Vessels</h2>
    <p style={{ color: '#6b7280' }}>Vessel management and tracking</p>
  </div>
);

const Port = () => (
  <div style={{ padding: '20px' }}>
    <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Ports</h2>
    <p style={{ color: '#6b7280' }}>Port information and management</p>
  </div>
);

const Voyage = () => (
  <div style={{ padding: '20px' }}>
    <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Voyages</h2>
    <p style={{ color: '#6b7280' }}>Voyage planning and history</p>
  </div>
);

const Event = () => (
  <div style={{ padding: '20px' }}>
    <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Events</h2>
    <p style={{ color: '#6b7280' }}>Maritime events and incidents</p>
  </div>
);

const Notification = () => (
  <div style={{ padding: '20px' }}>
    <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Notifications</h2>
    <p style={{ color: '#6b7280' }}>System notifications and alerts</p>
  </div>
);

const LiveTrackings = () => (
  <div style={{ padding: '20px' }}>
    <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Live Tracking</h2>
    <p style={{ color: '#6b7280' }}>Real-time vessel tracking</p>
  </div>
);

const Profiles= () => (
  <div style={{ padding: '20px' }}>
    <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Profile</h2>
    <p style={{ color: '#6b7280', marginBottom: '16px' }}>ankitha</p>
    <p style={{ color: '#6b7280' }}>Role: Analyst</p>
  </div>
);

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const handleLogout = () => {
    setCurrentPage('login');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    header: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#1e40af',
      color: 'white',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      padding: '0 32px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '40px',
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    nav: {
      display: 'flex',
      gap: '4px',
    },
    navButton: {
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
      whiteSpace: 'nowrap',
    },
    navButtonActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    profileSection: {
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
    profileInfo: {
      fontSize: '13px',
      lineHeight: '1.4',
    },
    profileName: {
      fontWeight: '600',
    },
    profileRole: {
      color: '#bfdbfe',
      fontSize: '11px',
    },
    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      border: 'none',
      borderRadius: '6px',
      backgroundColor: '#dc2626',
      color: 'white',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      transition: 'background-color 0.2s',
    },
    mainContent: {
      marginTop: '64px',
      minHeight: 'calc(100vh - 64px)',
    },
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigation} />;
      case 'vessels':
        return <Vessels onNavigate={handleNavigation} />;
      case 'ports':
        return <Ports onNavigate={handleNavigation} />;
      case 'voyages':
        return <Voyages onNavigate={handleNavigation} />;
      case 'events':
        return <Events onNavigate={handleNavigation} />;
      case 'notifications':
        return <Notifications onNavigate={handleNavigation} />;
      case 'livetracking':
        return <LiveTracking onNavigate={handleNavigation} />;
      case 'profile':
        return <Profile onNavigate={handleNavigation} />;
      default:
        return <Dashboard onNavigate={handleNavigation} />;
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.leftSection}>
            <h1 style={styles.title}>
              <Ship size={24} />
              Maritime Tracking
            </h1>
            
            <nav style={styles.nav}>
              <button
                onClick={() => handleNavigation('dashboard')}
                style={{
                  ...styles.navButton,
                  ...(currentPage === 'dashboard' ? styles.navButtonActive : {}),
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'dashboard') {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'dashboard') {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Activity size={16} />
                Dashboard
              </button>
              
              <button
                onClick={() => handleNavigation('vessels')}
                style={{
                  ...styles.navButton,
                  ...(currentPage === 'vessels' ? styles.navButtonActive : {}),
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'vessels') {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'vessels') {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Ship size={16} />
                Vessels
              </button>
              
              <button
                onClick={() => handleNavigation('ports')}
                style={{
                  ...styles.navButton,
                  ...(currentPage === 'ports' ? styles.navButtonActive : {}),
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'ports') {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'ports') {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Anchor size={16} />
                Ports
              </button>
              
              <button
                onClick={() => handleNavigation('voyages')}
                style={{
                  ...styles.navButton,
                  ...(currentPage === 'voyages' ? styles.navButtonActive : {}),
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'voyages') {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'voyages') {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Navigation size={16} />
                Voyages
              </button>
              
              <button
                onClick={() => handleNavigation('events')}
                style={{
                  ...styles.navButton,
                  ...(currentPage === 'events' ? styles.navButtonActive : {}),
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'events') {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'events') {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Calendar size={16} />
                Events
              </button>
              
              <button
                onClick={() => handleNavigation('notifications')}
                style={{
                  ...styles.navButton,
                  ...(currentPage === 'notifications' ? styles.navButtonActive : {}),
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'notifications') {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'notifications') {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Bell size={16} />
                Notifications
              </button>
              
              <button
                onClick={() => handleNavigation('livetracking')}
                style={{
                  ...styles.navButton,
                  ...(currentPage === 'livetracking' ? styles.navButtonActive : {}),
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'livetracking') {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'livetracking') {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <MapPin size={16} />
                Live Tracking
              </button>
            </nav>
          </div>
          
          <div style={styles.rightSection}>
            <div 
              style={styles.profileSection}
              onClick={() => handleNavigation('profile')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={styles.avatar}>
                <span>A</span>
              </div>
              <div style={styles.profileInfo}>
                <div style={styles.profileName}>ankita12345</div>
                <div style={styles.profileRole}>Analyst</div>
              </div>
            </div>
            <button 
              style={styles.logoutButton}
              onClick={handleLogout}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={styles.mainContent}>
        {renderPage()}
      </main>
    </div>
  );
}
export default App;
