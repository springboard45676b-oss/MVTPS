import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNotifications } from '../contexts/NotificationContext';
import api from '../services/api';

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  } = useNotifications();

  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('all');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [filteredNotifications, setFilteredNotifications] = useState([]);

  useEffect(() => {
    fetchStats();
    refreshNotifications(); // Refresh when component mounts
  }, []);

  useEffect(() => {
    // Filter notifications based on current filters
    let filtered = [...notifications];

    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.is_read);
    }

    if (selectedType) {
      filtered = filtered.filter(n => n.notification_type === selectedType);
    }

    if (selectedPriority) {
      filtered = filtered.filter(n => n.priority === selectedPriority);
    }

    setFilteredNotifications(filtered);
  }, [notifications, filter, selectedType, selectedPriority]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/notifications/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      fetchStats(); // Refresh stats
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      fetchStats(); // Refresh stats
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      fetchStats(); // Refresh stats
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📢';
      case 'low': return 'ℹ️';
      default: return '📝';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'position_update': return '📍';
      case 'status_change': return '🔄';
      case 'port_arrival': return '🏗️';
      case 'port_departure': return '🚢';
      case 'speed_change': return '⚡';
      case 'course_change': return '🧭';
      case 'emergency': return '🚨';
      case 'maintenance': return '🔧';
      case 'weather_warning': return '🌊';
      case 'subscription': return '📋';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner"></div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          <span className="page-icon">🔔</span>
          Notifications
          {unreadCount > 0 && (
            <span className="page-notification-badge">
              {unreadCount} new
            </span>
          )}
        </h1>
        <p className="page-description">
          Stay updated with vessel activities and system alerts
        </p>
      </div>

      {/* Notification Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{notifications.length}</div>
            <div className="stat-label">Total Notifications</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔔</div>
          <div className="stat-content">
            <div className="stat-number">{unreadCount}</div>
            <div className="stat-label">Unread</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <div className="stat-number">
              {notifications.filter(n => n.priority === 'critical').length}
            </div>
            <div className="stat-label">Critical</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-number">
              {notifications.filter(n => n.priority === 'high').length}
            </div>
            <div className="stat-label">High Priority</div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="notification-controls">
        <div className="filter-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only ({unreadCount})</option>
            <option value="read">Read Only ({notifications.length - unreadCount})</option>
          </select>

          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="position_update">Position Updates</option>
            <option value="status_change">Status Changes</option>
            <option value="port_arrival">Port Arrivals</option>
            <option value="port_departure">Port Departures</option>
            <option value="emergency">Emergency Alerts</option>
            <option value="weather_warning">Weather Warnings</option>
            <option value="subscription">Subscription Updates</option>
          </select>

          <select 
            value={selectedPriority} 
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="filter-select"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="action-controls">
          <button 
            onClick={refreshNotifications}
            className="btn btn-outline"
            title="Refresh notifications"
          >
            🔄 Refresh
          </button>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="btn btn-secondary"
            >
              Mark All Read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-container">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>No notifications found</h3>
            <p>
              {filter === 'all' 
                ? "You're all caught up! No notifications to show."
                : `No ${filter} notifications match your current filters.`
              }
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
              >
                <div className="notification-header">
                  <div className="notification-meta">
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(notification.priority) }}
                    >
                      {getPriorityIcon(notification.priority)} {notification.priority}
                    </span>
                    <span className="type-badge">
                      {getTypeIcon(notification.notification_type)} 
                      {notification.notification_type.replace('_', ' ')}
                    </span>
                    <span className="time-ago">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="notification-actions">
                    {!notification.is_read && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="btn-icon"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="btn-icon delete"
                      title="Delete notification"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="notification-content">
                  <h4 className="notification-title">{notification.title}</h4>
                  <p className="notification-message">{notification.message}</p>
                  
                  {notification.vessel && (
                    <div className="vessel-info">
                      <span className="vessel-icon">🚢</span>
                      <span className="vessel-name">{notification.vessel.name}</span>
                      <span className="vessel-mmsi">MMSI: {notification.vessel.mmsi}</span>
                    </div>
                  )}

                  {notification.data && Object.keys(notification.data).length > 0 && (
                    <div className="notification-data">
                      <details>
                        <summary>Additional Details</summary>
                        <pre>{JSON.stringify(notification.data, null, 2)}</pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;