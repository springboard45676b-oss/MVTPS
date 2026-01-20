import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

const ProfileSidebar = () => {
  const { user, logout } = useAuth();
  const { unreadCount, refreshNotifications } = useNotifications();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNotificationClick = () => {
    // Refresh notifications when user clicks on notifications
    refreshNotifications();
  };

  if (!user) return null;

  return (
    <div className={`profile-sidebar ${isExpanded ? 'expanded' : ''}`}>
      <div className="profile-sidebar-content">
        {/* Profile Header */}
        <div className="profile-header-sidebar">
          <div className="profile-avatar-sidebar">
            <div className="avatar-circle-sidebar">
              <span className="user-initials-sidebar">
                {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
              </span>
            </div>
            {isExpanded && (
              <div className="profile-info-sidebar">
                <h3 className="profile-name-sidebar">
                  {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
                </h3>
                <span className="profile-role-sidebar">{user?.role}</span>
                <span className="profile-email-sidebar">{user?.email}</span>
              </div>
            )}
          </div>
          
          <button 
            className="sidebar-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '◀' : '▶'}
          </button>
        </div>

        {/* Quick Stats */}
        {isExpanded && (
          <div className="profile-stats-sidebar">
            <div className="stat-item-sidebar">
              <span className="stat-icon">🚢</span>
              <div className="stat-info">
                <span className="stat-number">15</span>
                <span className="stat-label">Vessels</span>
              </div>
            </div>
            <div className="stat-item-sidebar">
              <span className="stat-icon">🔔</span>
              <div className="stat-info">
                <span className="stat-number">{unreadCount}</span>
                <span className="stat-label">New Alerts</span>
              </div>
            </div>
            <div className="stat-item-sidebar">
              <span className="stat-icon">📡</span>
              <div className="stat-info">
                <span className="stat-number">1</span>
                <span className="stat-label">Subscriptions</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="profile-actions-sidebar">
          <Link 
            to="/profile" 
            className="action-item-sidebar"
            title="My Profile"
          >
            <span className="action-icon">👤</span>
            {isExpanded && <span className="action-label">My Profile</span>}
          </Link>
          
          <Link 
            to="/notifications" 
            className="action-item-sidebar"
            title="Notifications"
            onClick={handleNotificationClick}
          >
            <span className="action-icon">🔔</span>
            {isExpanded && <span className="action-label">Notifications</span>}
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </Link>
          
          <Link 
            to="/subscriptions" 
            className="action-item-sidebar"
            title="Real-Time Subscriptions"
          >
            <span className="action-icon">📡</span>
            {isExpanded && <span className="action-label">Subscriptions</span>}
          </Link>
          
          <div className="action-divider"></div>
          
          <button 
            onClick={handleLogout}
            className="action-item-sidebar logout-action"
            title="Logout"
          >
            <span className="action-icon">🚪</span>
            {isExpanded && <span className="action-label">Logout</span>}
          </button>
        </div>

        {/* Status Indicator */}
        <div className="profile-status-sidebar">
          <div className="status-indicator">
            <span className="status-dot online"></span>
            {isExpanded && <span className="status-text">Online</span>}
          </div>
          {isExpanded && (
            <div className="last-activity">
              <span className="activity-text">Active now</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;