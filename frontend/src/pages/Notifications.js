import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [filter, selectedType, selectedPriority]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filter === 'unread') {
        params.append('is_read', 'false');
      } else if (filter === 'read') {
        params.append('is_read', 'true');
      }
      
      if (selectedType) {
        params.append('type', selectedType);
      }
      
      if (selectedPriority) {
        params.append('priority', selectedPriority);
      }

      const response = await api.get(`/notifications/?${params.toString()}`);
      setNotifications(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/notifications/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/read/`);
      setNotifications(notifications.map(notif => 
        notif.id === notificationId 
          ? { ...notif, is_read: true, read_at: new Date().toISOString() }
          : notif
      ));
      fetchStats();
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read/');
      setNotifications(notifications.map(notif => ({ 
        ...notif, 
        is_read: true, 
        read_at: new Date().toISOString() 
      })));
      fetchStats();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}/delete/`);
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
      fetchStats();
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
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
            <div className="stat-number">{stats.total || 0}</div>
            <div className="stat-label">Total Notifications</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔔</div>
          <div className="stat-content">
            <div className="stat-number">{stats.unread || 0}</div>
            <div className="stat-label">Unread</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <div className="stat-number">{stats.priority_counts?.critical || 0}</div>
            <div className="stat-label">Critical</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-number">{stats.priority_counts?.high || 0}</div>
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
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
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
          {stats.unread > 0 && (
            <button 
              onClick={markAllAsRead}
              className="btn btn-secondary"
            >
              Mark All Read ({stats.unread})
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-container">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>No notifications found</h3>
            <p>You're all caught up! No notifications match your current filters.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
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
                    <span className="time-ago">{notification.time_ago}</span>
                  </div>
                  <div className="notification-actions">
                    {!notification.is_read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="btn-icon"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification.id)}
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