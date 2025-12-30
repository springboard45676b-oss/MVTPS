import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-authenticated">
      <div className="container">
        <div className="navbar-content">
          <Link to="/dashboard" className="navbar-brand">
            <span className="logo-icon">⚓</span>
            <span className="logo-text">MaritimeTracker</span>
          </Link>
          
          <ul className="navbar-nav">
            <li>
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                <span className="nav-icon">📊</span>
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/vessels" 
                className={`nav-link ${isActive('/vessels') ? 'active' : ''}`}
              >
                <span className="nav-icon">🚢</span>
                Vessels
              </Link>
            </li>
            <li>
              <Link 
                to="/ports" 
                className={`nav-link ${isActive('/ports') ? 'active' : ''}`}
              >
                <span className="nav-icon">🏗️</span>
                Ports
              </Link>
            </li>
            <li>
              <Link 
                to="/safety" 
                className={`nav-link ${isActive('/safety') ? 'active' : ''}`}
              >
                <span className="nav-icon">⚠️</span>
                Safety
              </Link>
            </li>
            <li>
              <Link 
                to="/analytics" 
                className={`nav-link ${isActive('/analytics') ? 'active' : ''}`}
              >
                <span className="nav-icon">📈</span>
                Analytics
              </Link>
            </li>
            <li>
              <Link 
                to="/notifications" 
                className={`nav-link ${isActive('/notifications') ? 'active' : ''}`}
              >
                <span className="nav-icon">🔔</span>
                Notifications
              </Link>
            </li>
          </ul>

          <div className="navbar-user">
            <div 
              className="user-menu-trigger"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                <span className="user-initials">
                  {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                </span>
              </div>
              <div className="user-info">
                <span className="user-name">
                  {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
                </span>
                <span className="user-role">{user?.role}</span>
              </div>
              <span className="dropdown-arrow">▼</span>
            </div>

            {showUserMenu && (
              <div className="user-dropdown">
                <Link 
                  to="/profile" 
                  className="dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <span className="dropdown-icon">👤</span>
                  My Profile
                </Link>
                <Link 
                  to="/settings" 
                  className="dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <span className="dropdown-icon">⚙️</span>
                  Settings
                </Link>
                <div className="dropdown-divider"></div>
                <button 
                  onClick={handleLogout} 
                  className="dropdown-item logout-btn"
                >
                  <span className="dropdown-icon">🚪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;