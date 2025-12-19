import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { authAPI } from "../services/api";
import DarkModeToggle from "./DarkModeToggle";
import { Ship, Bell } from "lucide-react";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/vessels", label: "Vessels" },
  { to: "/ports", label: "Ports" },
  { to: "/voyages", label: "Voyages" },
  { to: "/events", label: "Events" },
  { to: "/notifications", label: "Notifications" },
  { to: "/live-tracking", label: "Live Tracking" },
];

// Loading screen component
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

const Navbar = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = authAPI.getCurrentUser();

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
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
      
      // Sort by newest first
      notificationsList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setNotifications(notificationsList);
      
      // Count unread notifications
      const unread = notificationsList.filter(n => n.status !== 'read').length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await fetch(`${API_URL}/users/notifications/${notificationId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'read' })
      });

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, status: 'read' } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      // Mark all as read
      for (const notification of notifications.filter(n => n.status !== 'read')) {
        await markNotificationAsRead(notification.id);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white grid place-items-center font-bold shadow">
              <Ship className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">MVTPS</h1>
            </div>
          </div>
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
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg hover:bg-slate-100 transition text-slate-600 hover:text-slate-900"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                
                {/* Unread Badge */}
                {unreadCount > 0 && (
                  <div className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-96 rounded-xl border border-slate-200 bg-white shadow-xl py-2 z-50 max-h-96 overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <p className="text-xs text-slate-500">{unreadCount} unread</p>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium transition"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-slate-500 text-sm">
                        <p>No notifications yet</p>
                        <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => {
                            if (notification.status !== 'read') {
                              markNotificationAsRead(notification.id);
                            }
                          }}
                          className={`px-4 py-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition ${
                            notification.status !== 'read' ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Unread Indicator */}
                            {notification.status !== 'read' && (
                              <div className="h-2 w-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                            )}
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className={`text-sm ${notification.status !== 'read' ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'}`}>
                                  {notification.type?.toUpperCase() || 'NOTIFICATION'}
                                </p>
                                <span className="text-xs text-slate-500 flex-shrink-0">
                                  {formatTime(notification.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              {notification.vessel_name && (
                                <p className="text-xs text-slate-500 mt-1">
                                  Vessel: <span className="font-medium">{notification.vessel_name}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-slate-100">
                      <NavLink
                        to="/notifications"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium transition block text-center py-2"
                      >
                        View All Notifications
                      </NavLink>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <DarkModeToggle className="flex-shrink-0" />

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
        <div className="md:hidden px-4 pb-3 flex flex-wrap gap-2 text-sm font-medium">
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
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;