import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

const TopHorizontalBar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="top-horizontal-bar">
      {/* Notification Bell */}
      <Link to="/notifications" className="notification-bell">
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-count-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>

      {/* Profile Section */}
      <div className="profile-section">
        <div 
          className="profile-trigger"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="profile-avatar">
            <span className="profile-initials">
              {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
            </span>
          </div>
          <span className="profile-name">
            {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
          </span>
          <span className="dropdown-arrow">▼</span>
        </div>

        {/* Dropdown Menu */}
        {showDropdown && (
          <>
            <div 
              className="dropdown-overlay"
              onClick={() => setShowDropdown(false)}
            />
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-user-info">
                  <div className="dropdown-avatar">
                    <span className="dropdown-initials">
                      {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                  <div className="dropdown-details">
                    <h4 className="dropdown-name">
                      {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
                    </h4>
                    <p className="dropdown-email">{user?.email}</p>
                    <span className="dropdown-role">{user?.role}</span>
                  </div>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <div className="dropdown-menu-items">
                <Link 
                  to="/profile" 
                  className="dropdown-menu-item"
                  onClick={() => setShowDropdown(false)}
                >
                  <span className="dropdown-icon">👤</span>
                  <span className="dropdown-text">My Profile</span>
                </Link>

                <Link 
                  to="/notifications" 
                  className="dropdown-menu-item"
                  onClick={() => setShowDropdown(false)}
                >
                  <span className="dropdown-icon">🔔</span>
                  <span className="dropdown-text">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="dropdown-badge">{unreadCount}</span>
                  )}
                </Link>

                <Link 
                  to="/subscriptions" 
                  className="dropdown-menu-item"
                  onClick={() => setShowDropdown(false)}
                >
                  <span className="dropdown-icon">📡</span>
                  <span className="dropdown-text">Subscriptions</span>
                </Link>

                <div className="dropdown-divider"></div>

                <button 
                  onClick={handleLogout}
                  className="dropdown-menu-item logout-item"
                >
                  <span className="dropdown-icon">🚪</span>
                  <span className="dropdown-text">Logout</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TopHorizontalBar;