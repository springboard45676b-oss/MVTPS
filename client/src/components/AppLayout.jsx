import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useNotificationWebSocket } from "../hooks/useNotificationWebSocket.jsx";
import DarkModeToggle from "./DarkModeToggle";
import { Ship, Bell, Trash2, CheckCheck, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/vessels", label: "Vessels" },
  { to: "/ports", label: "Ports" },
  { to: "/voyages", label: "Voyages" },
  { to: "/live-tracking", label: "Live Tracking" },
];

const LogoutLoadingScreen = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200/30"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"></div>
      </div>
      <p className="text-white font-medium">Logging out...</p>
    </div>
  </div>
);

const NotificationPopup = ({ isOpen, onClose, onMarkAllAsRead, onClearAll, notifications, onMarkAsRead, onDelete, onViewAll, formatTime }) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end pt-20 pr-4">
      {/* Overlay to close popup */}
      <div className="fixed inset-0 z-30" onClick={onClose}></div>

      {/* Notification Rectangle Popup */}
      <div className="relative z-40 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[600px]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-linear-to-r from-blue-50 to-cyan-50">
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-slate-500">{unreadCount} unread</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-3 border-b border-slate-100 flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition text-sm font-medium"
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition text-sm font-medium"
              title="Delete all notifications"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-500">
              <p className="text-sm">No notifications</p>
              <p className="text-xs text-slate-400 mt-1">You're all caught up! 🎉</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-6 py-3 border-b border-slate-100 hover:bg-slate-50 transition ${
                  notification.is_read ? '' : 'bg-blue-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Unread Indicator */}
                  {!notification.is_read && (
                    <div className="h-2 w-2 bg-blue-600 rounded-full mt-2 shrink-0" />
                  )}
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {notification.type_display || 'NOTIFICATION'}
                      </p>
                      <span className="text-xs text-slate-500 shrink-0">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    {notification.vessel_name && (
                      <p className="text-xs text-slate-500">
                        🚢 {notification.vessel_name}
                      </p>
                    )}
                    {notification.event_type_display && (
                      <p className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded inline-block mt-2">
                        {notification.event_type_display}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1 shrink-0">
                    {!notification.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notification.id);
                        }}
                        className="p-1.5 rounded hover:bg-blue-200 text-blue-600 transition"
                        title="Mark as read"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification.id);
                      }}
                      className="p-1.5 rounded hover:bg-red-200 text-red-600 transition"
                      title="Delete notification"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50">
            <button
              onClick={onViewAll}
              className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium transition py-2"
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
  const user = authAPI.getCurrentUser();

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
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
        duration: 2000,
        icon: '🗑️',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (!window.confirm('Clear all notifications?')) return;

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

      toast.success(`Cleared ${data.deleted_count} notifications`, {
        duration: 2000,
        icon: '🗑️',
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
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

      toast.success('All marked as read ✓', {
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
      
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 gap-4">
          {/* Logo and Title - Left */}
          <div className="flex items-center gap-3 shrink-0 flex-1">
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 text-white grid place-items-center font-bold shadow">
              <Ship className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-semibold text-slate-900">MVTPS</h1>
          </div>

          {/* Navigation - Centered */}
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

          {/* Toolbar - Right */}
          <div className="flex items-center gap-2 shrink-0 flex-1 justify-end">
            {/* Notification Bell Button - Opens Rectangle Popup */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg hover:bg-slate-100 transition text-slate-600 hover:text-slate-900"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                
                {/* Unread Badge - RED */}
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}

                {/* Connection Indicator */}
                {isConnected && (
                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse border border-white" title="Connected" />
                )}
              </button>

              {/* Notification Rectangle Popup */}
              <NotificationPopup
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                onMarkAllAsRead={markAllAsRead}
                onClearAll={clearAllNotifications}
                notifications={notifications}
                onMarkAsRead={markNotificationAsRead}
                onDelete={deleteNotification}
                onViewAll={() => {
                  setNotificationsOpen(false);
                  navigate('/notifications');
                }}
                formatTime={formatTime}
              />
            </div>

            {/* Dark Mode Toggle */}
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
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg py-2 text-sm z-50">
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
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Nav - Centered */}
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
  const [wsConnected, setWsConnected] = useState(false);

  useNotificationWebSocket((notification) => {
    console.log('Notification received:', notification);
    setWsConnected(true);
  });

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Enhanced Toast Configuration */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={12}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1e293b',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e2e8f0',
            fontWeight: '500',
            padding: '16px',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
              color: '#fff',
              border: 'none',
            },
            icon: '✓',
          },
          error: {
            duration: 3000,
            style: {
              background: '#ef4444',
              color: '#fff',
              border: 'none',
            },
            icon: '✕',
          },
          loading: {
            style: {
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
            },
          },
        }}
      />
      
      <Navbar isConnected={wsConnected} />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;