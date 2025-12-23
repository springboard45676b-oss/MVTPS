import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Trash2, CheckCheck, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("You must be logged in");
        return;
      }

      const response = await fetch(`${API_URL}/users/notifications/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      const notificationsList = Array.isArray(data) ? data : data.results || [];
      
      notificationsList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setNotifications(notificationsList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_URL}/users/notifications/${notificationId}/mark-read/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to mark as read");

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      
      if (selectedNotification?.id === notificationId) {
        setSelectedNotification({ ...selectedNotification, is_read: true });
      }

      toast.success("Marked as read ✓", {
        duration: 2000,
        style: {
          background: "#10b981",
          color: "#fff",
        },
      });
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_URL}/users/notifications/mark-all-read/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to mark all as read");

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );

      toast.success(`All notifications marked as read ✓`, {
        duration: 2000,
        style: {
          background: "#10b981",
          color: "#fff",
        },
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_URL}/users/notifications/${notificationId}/delete/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete notification");

      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );

      if (selectedNotification?.id === notificationId) {
        setSelectedNotification(null);
        setShowModal(false);
      }

      toast.success("Notification deleted", {
        duration: 2000,
        icon: "🗑️",
        style: {
          background: "#ef4444",
          color: "#fff",
        },
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const clearAllNotifications = async () => {
    if (!window.confirm("Are you sure you want to delete all notifications? This cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_URL}/users/notifications/clear-all/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to clear notifications");

      const data = await response.json();

      setNotifications([]);
      setSelectedNotification(null);
      setShowModal(false);

      toast.success(`Cleared ${data.deleted_count} notifications`, {
        duration: 2000,
        icon: "🗑️",
        style: {
          background: "#ef4444",
          color: "#fff",
        },
      });
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Failed to clear notifications");
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
  };

  const goToVessel = (vesselId) => {
    setShowModal(false);
    navigate(`/live-tracking?vessel=${vesselId}`);
    
    toast.success("Opening vessel in Live Tracking", {
      duration: 2000,
      style: {
        background: "#3b82f6",
        color: "#fff",
      },
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
            <p className="text-slate-600 mt-1">
              {notifications.length} total
              {unreadCount > 0 && ` • ${unreadCount} unread`}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
                title="Mark all as read"
              >
                <CheckCheck className="h-4 w-4" />
                Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium"
                title="Delete all notifications"
              >
                <Trash className="h-4 w-4" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-slate-500 text-lg">No notifications yet</p>
            <p className="text-slate-400 text-sm mt-2">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  notification.is_read
                    ? "bg-white border-slate-200 hover:border-slate-300"
                    : "bg-blue-50 border-blue-200 hover:bg-blue-100 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {!notification.is_read && (
                        <div className="h-3 w-3 bg-blue-600 rounded-full shrink-0" />
                      )}
                      <h3 className="font-semibold text-slate-900 text-lg">
                        {notification.type_display}
                      </h3>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {notification.event_type_display}
                      </span>
                    </div>

                    <p className="text-slate-700 mb-2">{notification.message}</p>

                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="font-medium">
                        🚢 {notification.vessel_name}
                      </span>
                      <span className="text-xs">
                        {notification.vessel_type} • {notification.vessel_flag}
                      </span>
                      <span className="text-xs">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex gap-2 shrink-0">
                    {!notification.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="p-2 rounded-lg hover:bg-slate-200 transition text-slate-600"
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
                      className="p-2 rounded-lg hover:bg-red-100 transition text-red-600"
                      title="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}
      {showModal && selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-linear-to-r from-blue-50 to-cyan-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedNotification.type_display}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {formatTime(selectedNotification.timestamp)}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-200 rounded-lg transition"
              >
                <X className="h-6 w-6 text-slate-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Event Type Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-600">Event Type:</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-medium">
                  {selectedNotification.event_type_display}
                </span>
              </div>

              {/* Message */}
              <div>
                <h3 className="text-sm font-semibold text-slate-600 mb-2">Message</h3>
                <p className="text-slate-900 text-base leading-relaxed bg-slate-50 p-4 rounded-lg">
                  {selectedNotification.message}
                </p>
              </div>

              {/* Vessel Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-slate-900 text-lg">
                  🚢 {selectedNotification.vessel_name}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 text-xs">IMO Number</p>
                    <p className="font-mono font-semibold text-slate-900">
                      {selectedNotification.vessel_imo}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs">Type</p>
                    <p className="font-semibold text-slate-900">
                      {selectedNotification.vessel_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs">Flag</p>
                    <p className="font-semibold text-slate-900">
                      {selectedNotification.vessel_flag}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs">Status</p>
                    <p className={`font-semibold ${selectedNotification.is_read ? 'text-slate-500' : 'text-blue-600'}`}>
                      {selectedNotification.is_read ? 'Read' : 'Unread'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Meta Information */}
              <div className="text-xs text-slate-500 space-y-1">
                <p>ID: {selectedNotification.id}</p>
                <p>Created: {new Date(selectedNotification.timestamp).toLocaleString()}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
              {!selectedNotification.is_read && (
                <button
                  onClick={() => {
                    markAsRead(selectedNotification.id);
                    setShowModal(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark as Read
                </button>
              )}
              <button
                onClick={() => goToVessel(selectedNotification.vessel)}
                className="flex-1 px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition font-medium"
              >
                View on Map 🗺️
              </button>
              <button
                onClick={() => {
                  deleteNotification(selectedNotification.id);
                  setShowModal(false);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex items-center justify-center px-4 py-2 rounded-lg bg-slate-200 text-slate-900 hover:bg-slate-300 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;