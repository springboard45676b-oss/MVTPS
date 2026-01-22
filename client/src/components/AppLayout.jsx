import React, { useState, useEffect, useCallback } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useNotificationWebSocket } from "../services/useNotificationWebSocket.jsx";
import DarkModeToggle from "./DarkModeToggle";
import { Ship, Bell, Trash2, CheckCheck, X, MapPin } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const LogoutLoadingScreen = () => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200/30"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"></div>
      </div>
      <p className="text-white font-medium">Logging out...</p>
    </div>
  </div>
);

const NotificationPopup = ({ 
  isOpen, 
  onClose, 
  onMarkAllAsRead, 
  onClearAll, 
  notifications, 
  onMarkAsRead, 
  onDelete, 
  onViewAll, 
  formatTime,
  onNotificationClick 
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-end pt-20 pr-4">
      {/* Overlay */}
      <div className="fixed inset-0 z-[90]" onClick={onClose}></div>

      {/* Notification Popup */}
      <div className="relative z-[100] w-96 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50">
          <div>
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-slate-500">{unreadCount} unread</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="h-4 w-4 text-slate-600" />
          </button>
        </div>

        {/* Action Buttons - Smaller */}
        <div className="px-4 py-2 border-b border-slate-100 flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-600 transition text-xs font-medium"
            >
              <CheckCheck className="h-3 w-3" />
              Mark Read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-red-100 hover:bg-red-200 text-red-600 transition text-xs font-medium"
            >
              <Trash2 className="h-3 w-3" />
              Clear All
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500">
              <p className="text-sm">No notifications</p>
              <p className="text-xs text-slate-400 mt-1">You're all caught up! 🎉</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => onNotificationClick(notification)}
                className={`px-4 py-2.5 border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer ${
                  notification.is_read ? '' : 'bg-blue-50'
                }`}
              >
                <div className="flex items-start gap-2">
                  {/* Unread Indicator */}
                  {!notification.is_read && (
                    <div className="h-2 w-2 bg-blue-600 rounded-full mt-1.5 shrink-0" />
                  )}
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-xs font-semibold text-slate-900">
                        {notification.type_display || 'NOTIFICATION'}
                      </p>
                      <span className="text-xs text-slate-500 shrink-0">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-1 line-clamp-2">
                      {notification.message}
                    </p>
                    {notification.vessel_name && (
                      <p className="text-xs text-slate-500">
                        🚢 {notification.vessel_name}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons - Smaller */}
                  <div className="flex gap-1 shrink-0">
                    {!notification.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notification.id);
                        }}
                        className="p-1 rounded hover:bg-blue-200 text-blue-600 transition"
                        title="Mark as read"
                      >
                        <CheckCheck className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification.id);
                      }}
                      className="p-1 rounded hover:bg-red-200 text-red-600 transition"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
            <button
              onClick={onViewAll}
              className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium transition py-1.5"
            >
              View All Notifications →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Navbar = ({ isConnected }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const user = authAPI.getCurrentUser();

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  const getDashboardLink = () => {
     const role = user?.role?.toLowerCase();
     return role === 'admin' ? '/admin/dashboard' : '/dashboard';
   };

   const navItems = [
     { to: getDashboardLink(), label: "Dashboard" },
     { to: "/vessels", label: "Vessels" },
     { to: "/ports", label: "Ports" },
     { to: "/voyages", label: "Voyages" },
     { to: "/live-tracking", label: "Live Tracking" },
   ];

  // Real-time WebSocket notification handler
  const handleNewNotification = useCallback((newNotification) => {
    console.log('New notification received in navbar:', newNotification);
    
    // Extract notification data - handle both formats
    const notificationData = newNotification.data || newNotification;
    
    // Add new notification to the top of the list
    setNotifications(prev => {
      // Prevent duplicates
      const exists = prev.some(n => n.id === notificationData.id);
      if (exists) return prev;
      
      return [notificationData, ...prev];
    });
    
    // Increment unread count if notification is unread
    if (!notificationData.is_read) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Setup WebSocket connection
  useNotificationWebSocket(handleNewNotification);

  useEffect(() => {
    fetchNotifications();
    // Reduce polling interval since WebSocket handles real-time updates
    const interval = setInterval(fetchNotifications, 60000); // 60s backup polling
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

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
      
      const unread = notificationsList.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id);
    }

    // Close dropdown and open detail modal
    setNotificationsOpen(false);
    setSelectedNotification(notification);
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

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
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await fetch(`${API_URL}/users/notifications/${notificationId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      toast.success('Notification deleted', {
        position: 'top-center',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${API_URL}/users/notifications/clear-all/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setNotifications([]);
      setUnreadCount(0);
      setShowClearAllModal(false);

      toast.success(`Cleared ${data.deleted_count} notifications`, {
        position: 'top-center',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
      setShowClearAllModal(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await fetch(`${API_URL}/users/notifications/mark-all-read/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);

      toast.success('All marked as read', {
        position: 'top-center',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const formatMessage = (message) => {
    if (!message) return '';
    
    // Replace space before 'knots', 'kts', 'km', 'm', 'degrees', etc. with non-breaking space
    return message
      .replace(/(\d+\.?\d*)\s+(knots?|kts|km|m|degrees?|°)/gi, '$1\u00A0$2')
      .replace(/Speed:\s+/gi, 'Speed:\u00A0')
      .replace(/\|\s+/g, '|\u00A0');
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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    authAPI.logout();
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  };

  return (
    <>
      {isLoggingOut && <LogoutLoadingScreen />}
      
      <header className="sticky top-0 z-[60] border-b border-slate-200/70 bg-white/90 backdrop-blur overflow-visible">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0 flex-1">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white grid place-items-center font-bold shadow">
              <Ship className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-semibold text-slate-900">MVTPS</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-3 text-sm font-medium">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 transition ${
                    isActive || location.pathname === item.to
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Toolbar */}
          <div className="flex items-center gap-2 shrink-0 flex-1 justify-end">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg hover:bg-slate-100 transition text-slate-600 hover:text-slate-900"
              >
                <Bell className="h-5 w-5" />
                
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </button>

              <NotificationPopup
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                onMarkAllAsRead={markAllAsRead}
                onClearAll={() => setShowClearAllModal(true)}
                notifications={notifications}
                onMarkAsRead={markNotificationAsRead}
                onDelete={deleteNotification}
                onViewAll={() => {
                  setNotificationsOpen(false);
                  navigate('/notifications');
                }}
                formatTime={formatTime}
                onNotificationClick={handleNotificationClick}
              />
            </div>

            <DarkModeToggle className="shrink-0" />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm hover:bg-slate-100"
              >
                <div className="h-9 w-9 rounded-full bg-slate-900 text-white grid place-items-center font-semibold">
                  {user?.username ? user.username.slice(0, 2).toUpperCase() : "U"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs text-slate-500">Signed in</p>
                  <p className="text-sm font-semibold text-slate-900 truncate max-w-[140px]">
                    {user?.username || "User"}
                  </p>
                </div>
                <svg
                  className={`h-4 w-4 text-slate-500 transition ${menuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg py-2 text-sm z-[100]">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500">Signed in as</p>
                    <p className="font-semibold text-slate-900 truncate">{user?.email || user?.username || "User"}</p>
                  </div>
                  <NavLink
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    View Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium disabled:opacity-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden w-full px-4 pb-3 flex flex-wrap gap-2 text-sm font-medium justify-center">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 transition ${
                  isActive || location.pathname === item.to
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </header>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
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
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
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
                onClick={clearAllNotifications}
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
    </>
  );
};

const Footer = () => (
  <footer className="border-t border-slate-200/70 bg-white">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-sm text-slate-500">
      <span>{new Date().getFullYear()} Vessel Tracking</span>
      <span className="text-slate-400">Secure Maritime Operations</span>
    </div>
  </footer>
);

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900 transition-colors duration-200 overflow-visible">
      <Toaster
        position="top-center"
        containerStyle={{ top: 80 }}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1e293b',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
          },
        }}
      />
      
      <Navbar isConnected={true} />
      <main className="mx-auto max-w-7xl px-4 py-6 relative">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;