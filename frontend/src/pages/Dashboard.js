import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics/dashboard/');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleBasedFeatures = () => {
    const baseFeatures = [
      {
        title: 'Vessel Tracking',
        description: 'Monitor real-time vessel positions and movements',
        icon: '🚢',
        link: '/vessels',
        color: 'blue'
      },
      {
        title: 'Port Analytics',
        description: 'Analyze port congestion and traffic data',
        icon: '🏗️',
        link: '/ports',
        color: 'green'
      }
    ];

    const analystFeatures = [
      {
        title: 'Safety Overlays',
        description: 'View safety zones and weather conditions',
        icon: '⚠️',
        link: '/safety',
        color: 'orange'
      },
      {
        title: 'Advanced Analytics',
        description: 'Historical data and voyage analytics',
        icon: '📈',
        link: '/analytics',
        color: 'purple'
      }
    ];

    const adminFeatures = [
      {
        title: 'System Management',
        description: 'Manage users and system settings',
        icon: '⚙️',
        link: '/admin',
        color: 'red'
      }
    ];

    let features = [...baseFeatures];
    
    if (user?.role === 'analyst' || user?.role === 'admin') {
      features = [...features, ...analystFeatures];
    }
    
    if (user?.role === 'admin') {
      features = [...features, ...adminFeatures];
    }

    return features;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        {/* Welcome Section */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1 className="dashboard-title">
              {getGreeting()}, {user?.first_name || user?.username}!
            </h1>
            <p className="dashboard-subtitle">
              Here's what's happening with your maritime operations today.
            </p>
          </div>
          
          <div className="quick-actions">
            <Link to="/vessels" className="quick-action-btn">
              <span className="action-icon">🚢</span>
              Track Vessels
            </Link>
            <Link to="/ports" className="quick-action-btn">
              <span className="action-icon">🏗️</span>
              Port Status
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="metrics-section">
          <h2 className="section-title">Key Metrics</h2>
          <div className="metrics-grid">
            {analytics ? (
              <>
                <div className="metric-card">
                  <div className="metric-icon">🚢</div>
                  <div className="metric-content">
                    <div className="metric-number">{analytics.summary.total_voyages}</div>
                    <div className="metric-label">Total Voyages</div>
                    <div className="metric-change positive">+12% from last month</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">⚡</div>
                  <div className="metric-content">
                    <div className="metric-number">{analytics.summary.active_voyages}</div>
                    <div className="metric-label">Active Voyages</div>
                    <div className="metric-change positive">+5% from yesterday</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">✅</div>
                  <div className="metric-content">
                    <div className="metric-number">{analytics.summary.completed_voyages}</div>
                    <div className="metric-label">Completed Voyages</div>
                    <div className="metric-change positive">+8% from last week</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">🎯</div>
                  <div className="metric-content">
                    <div className="metric-number">98.5%</div>
                    <div className="metric-label">On-Time Performance</div>
                    <div className="metric-change positive">+2.1% from last month</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="metrics-placeholder">
                <p>Loading metrics...</p>
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="features-section">
          <h2 className="section-title">Platform Features</h2>
          <div className="features-grid">
            {getRoleBasedFeatures().map((feature, index) => (
              <Link 
                key={index}
                to={feature.link} 
                className={`feature-card feature-${feature.color}`}
              >
                <div className="feature-header">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3 className="feature-title">{feature.title}</h3>
                </div>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-arrow">→</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {analytics?.recent_events && analytics.recent_events.length > 0 && (
          <div className="activity-section">
            <div className="section-header">
              <h2 className="section-title">Recent Activity</h2>
              <Link to="/analytics" className="view-all-link">View All →</Link>
            </div>
            
            <div className="activity-list">
              {analytics.recent_events.slice(0, 5).map((event, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {event.event_type === 'departure' && '🚀'}
                    {event.event_type === 'arrival' && '🏁'}
                    {event.event_type === 'port_call' && '🏗️'}
                    {event.event_type === 'anchor' && '⚓'}
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">
                      {event.event_type.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="activity-description">{event.description}</div>
                    <div className="activity-time">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;