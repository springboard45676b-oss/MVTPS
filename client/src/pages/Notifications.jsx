// src/pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, Filter, Search, Ship, X, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/users/notifications/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch notifications');

      const data = await response.json();
      const notificationsList = Array.isArray(data) ? data : (data.results || []);
      
      notificationsList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setNotifications(notificationsList);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Open detail modal
    setSelectedNotification(notification);
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${API_URL}/users/notifications/${notificationId}/mark-read/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${API_URL}/users/notifications/mark-all-read/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${API_URL}/users/notifications/${notificationId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const clearAll = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/users/notifications/clear-all/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setNotifications([]);
      setShowClearAllModal(false);
      toast.success(`Cleared ${data.deleted_count} notifications`);
    } catch (error) {
      console.error('Error clearing all:', error);
      toast.error('Failed to clear notifications');
      setShowClearAllModal(false);
    }
  };

  const formatMessage = (message) => {
    if (!message) return '';
    
    // Replace space before 'knots', 'kts', 'km', 'm', 'degrees', etc. with non-breaking space
    return message
      .replace(/(\d+\.?\d*)\s+(knots?|kts|km|m|degrees?|°)/gi, '$1\u00A0$2')
      .replace(/Speed:\s+/gi, 'Speed:\u00A0')
      .replace(/\|\s+/g, '|\u00A0');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const formatFullDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getEventTypeColor = (type) => {
    const colors = {
      'position_update': 'bg-blue-100 text-blue-700',
      'departure': 'bg-yellow-100 text-yellow-700',
      'arrival': 'bg-green-100 text-green-700',
      'alert': 'bg-red-100 text-red-700',
      'default': 'bg-slate-100 text-slate-700'
    };
    return colors[type?.toLowerCase()] || colors.default;
  };

  const handleViewOnMap = (notification) => {
    setSelectedNotification(null);
    if (notification.vessel_id) {
      navigate('/live-tracking', {
        state: {
          selectedVesselId: notification.vessel_id,
          vesselName: notification.vessel_name
        }
      });
    } else {
      navigate('/live-tracking');
    }
  };

  const handleDeleteFromModal = async (notificationId) => {
    await deleteNotification(notificationId);
    setSelectedNotification(null);
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    // Filter by read/unread
    if (filter === 'unread' && n.is_read) return false;
    if (filter === 'read' && !n.is_read) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        n.message?.toLowerCase().includes(query) ||
        n.vessel_name?.toLowerCase().includes(query) ||
        n.type_display?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" />
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
              {unreadCount} unread
            </span>
          )}
        </div>
        <p className="text-slate-600">Stay updated with your vessel alerts and events</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'read'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Read
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition flex items-center gap-1"
              >
                <CheckCheck className="h-4 w-4" />
                Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => setShowClearAllModal(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium mb-1">No notifications</p>
            <p className="text-slate-500 text-sm">
              {searchQuery
                ? 'No notifications match your search'
                : filter === 'unread'
                ? "You're all caught up!"
                : 'No notifications yet'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition cursor-pointer ${
                notification.is_read ? 'border-slate-200' : 'border-blue-300 bg-blue-50'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    notification.is_read ? 'bg-slate-100' : 'bg-blue-100'
                  }`}>
                    <Ship className={`h-5 w-5 ${
                      notification.is_read ? 'text-slate-600' : 'text-blue-600'
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {notification.type_display || 'Notification'}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500 shrink-0 whitespace-nowrap">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-sm">
                      {notification.vessel_name && (
                        <span className="text-slate-600 flex items-center gap-1">
                          <Ship className="h-3.5 w-3.5" />
                          {notification.vessel_name}
                        </span>
                      )}
                      {notification.event_type_display && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {notification.event_type_display}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 shrink-0">
                    {!notification.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition"
                        title="Mark as read"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-fadeIn">
            {/* Header with gradient */}
            <div className="px-5 py-4 bg-gradient-to-br from-blue-600 to-cyan-600 text-white relative">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <h2 className="text-lg font-bold">Vessel Alert</h2>
                </div>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="p-1 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-blue-100 text-sm">{formatTime(selectedNotification.timestamp)}</p>
            </div>

            {/* Content */}
            <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Vessel Card */}
              {selectedNotification.vessel_name && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">🚢</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-base">{selectedNotification.vessel_name}</h3>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${getEventTypeColor(selectedNotification.event_type)}`}>
                        {selectedNotification.type_display || selectedNotification.event_type_display || 'Alert'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {selectedNotification.vessel_imo && (
                      <div className="bg-white/60 rounded-lg p-2">
                        <p className="text-slate-500 font-medium mb-0.5">IMO</p>
                        <p className="text-slate-900 font-bold">{selectedNotification.vessel_imo}</p>
                      </div>
                    )}
                    {selectedNotification.vessel_type && (
                      <div className="bg-white/60 rounded-lg p-2">
                        <p className="text-slate-500 font-medium mb-0.5">Type</p>
                        <p className="text-slate-900 font-bold">{selectedNotification.vessel_type}</p>
                      </div>
                    )}
                    {selectedNotification.vessel_flag && (
                      <div className="bg-white/60 rounded-lg p-2">
                        <p className="text-slate-500 font-medium mb-0.5">Flag</p>
                        <p className="text-slate-900 font-bold">{selectedNotification.vessel_flag}</p>
                      </div>
                    )}
                    <div className="bg-white/60 rounded-lg p-2">
                      <p className="text-slate-500 font-medium mb-0.5">Status</p>
                      <p className={`font-bold ${selectedNotification.is_read ? 'text-slate-600' : 'text-blue-600'}`}>
                        {selectedNotification.is_read ? 'Read' : 'Unread'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Message</p>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-700 leading-relaxed text-center">
                    {formatMessage(selectedNotification.message)}
                  </p>
                </div>
              </div>

              {/* Timestamp only */}
              <div className="text-right">
                <p className="text-xs text-slate-400">
                  {formatFullDate(selectedNotification.timestamp)}
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => handleViewOnMap(selectedNotification)}
                className="flex-1 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                <MapPin className="h-4 w-4" />
                View on Map
              </button>
              <button
                onClick={() => handleDeleteFromModal(selectedNotification.id)}
                className="px-3 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition text-sm"
              >
                Close
              </button>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
            .animate-fadeIn {
              animation: fadeIn 0.2s ease-out;
            }
          `}</style>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
            <div className="px-5 py-3 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-600" />
                Clear All Notifications
              </h3>
            </div>
            
            <div className="px-5 py-4 text-center">
              <p className="text-slate-800 text-base font-medium">
                Clear all <span className="font-bold text-red-600">{notifications.length} notifications</span>?
              </p>
              <p className="text-xs text-slate-500 mt-2">
                This action cannot be undone.
              </p>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => setShowClearAllModal(false)}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={clearAll}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-1.5 text-sm"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear All
              </button>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
            .animate-fadeIn {
              animation: fadeIn 0.2s ease-out;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default Notifications;