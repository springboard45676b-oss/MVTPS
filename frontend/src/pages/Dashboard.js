import React, { useState } from 'react';
import { useAuth } from '../services/AuthContext';
import '../styles/index.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Maritime Platform</h1>
          
          <div className="header-right">
            <div className="profile-dropdown">
              <div className="profile-trigger" onClick={toggleProfileDropdown}>
                <div className="profile-avatar">
                  {getInitials(user?.first_name || user?.username)}
                </div>
                <div className="profile-info">
                  <div className="profile-name">
                    {user?.first_name || user?.username}
                  </div>
                  <div className="profile-role">{user?.role}</div>
                </div>
              </div>
              
              {showProfileDropdown && (
                <div className="profile-dropdown-menu">
                  <div className="profile-summary">
                    <div className="profile-avatar">
                      {getInitials(user?.first_name || user?.username)}
                    </div>
                    <div className="profile-name" style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      {user?.first_name || user?.username}
                    </div>
                    <div className="role-badge">{user?.role}</div>
                  </div>
                  
                  <div className="profile-details">
                    <div className="detail-item">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{user?.email}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">Company</span>
                      <span className="detail-value">{user?.company || 'Not specified'}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">Phone</span>
                      <span className="detail-value">{user?.phone || 'Not specified'}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">Member Since</span>
                      <span className="detail-value">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button onClick={handleLogout} className="btn-logout">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Total Vessels</span>
              <div className="stat-icon">🚢</div>
            </div>
            <div className="stat-value">24</div>
            <div className="stat-change">+2 this month</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Active Voyages</span>
              <div className="stat-icon">🗺️</div>
            </div>
            <div className="stat-value">12</div>
            <div className="stat-change">+3 this week</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Ports Connected</span>
              <div className="stat-icon">🏭</div>
            </div>
            <div className="stat-value">8</div>
            <div className="stat-change">+1 this month</div>
          </div>
        </div>

        <div className="content-card">
          <h2 className="card-title">Recent Activity</h2>
          
          <div className="activity-item">
            <div className="activity-icon">🚢</div>
            <div className="activity-content">
              <div className="activity-title">Vessel "Ocean Explorer" departed from Port A</div>
              <div className="activity-time">2 hours ago</div>
              <div className="activity-status info">In Transit</div>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">📍</div>
            <div className="activity-content">
              <div className="activity-title">New port "Harbor Bay" added to network</div>
              <div className="activity-time">5 hours ago</div>
              <div className="activity-status success">Active</div>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">⚠️</div>
            <div className="activity-content">
              <div className="activity-title">Weather alert for Route 7</div>
              <div className="activity-time">1 day ago</div>
              <div className="activity-status warning">Alert</div>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">✅</div>
            <div className="activity-content">
              <div className="activity-title">Voyage "Atlantic Cross" completed successfully</div>
              <div className="activity-time">2 days ago</div>
              <div className="activity-status success">Completed</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;