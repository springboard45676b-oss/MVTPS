// src/hooks/useNotificationWebSocket.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Custom hook for notification management
 * Uses REST API polling instead of WebSocket (no Daphne needed)
 * Checks for new notifications every 30 seconds (reduced server load)
 */
export const useNotificationWebSocket = (onNotificationReceived) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const lastNotificationTimeRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const toastIdRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
  const POLLING_INTERVAL = 30000; // 30 seconds instead of 10 to reduce server load

  // Fetch notifications via REST API
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsConnected(false);
        return;
      }

      const response = await fetch(`${API_URL}/users/notifications/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      const notifications = Array.isArray(data) ? data : (data.results || []);

      // Check for new notifications (newer than last check)
      if (notifications.length > 0) {
        const latestNotification = notifications[0]; // First one is newest (ordered by -timestamp)
        const notificationTime = new Date(latestNotification.timestamp).getTime();

        // If this is a new notification we haven't seen before
        if (!lastNotificationTimeRef.current || notificationTime > lastNotificationTimeRef.current) {
          lastNotificationTimeRef.current = notificationTime;

          // Call the callback with notification data
          if (onNotificationReceived) {
            onNotificationReceived(latestNotification);
          }

          // Dismiss previous toast if exists
          if (toastIdRef.current) {
            toast.dismiss(toastIdRef.current);
          }

          // Show toast notification with custom styling
          console.log('📢 New notification received:', latestNotification);
          toastIdRef.current = toast.custom(
            (t) => (
              <div className="w-80 bg-white rounded-sm shadow-lg overflow-hidden">
                {/* Header with close button */}
                <div className="flex items-start justify-between p-4 pb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {(latestNotification.type || 'ALERT').toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">{latestNotification.message}</p>
                    {latestNotification.vessel_name && (
                      <p className="text-xs text-gray-500 mt-2">
                        Vessel: {latestNotification.vessel_name}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors ml-2"
                    aria-label="Close notification"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                {/* Progress bar */}
                <div className="h-1 bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{
                      animation: `slideOut 15s linear forwards`,
                      '@keyframes slideOut': {
                        '0%': { width: '100%' },
                        '100%': { width: '0%' }
                      }
                    }}
                  />
                </div>
              </div>
            ),
            {
              duration: 15000, // 15 seconds visible
              position: 'top-right'
            }
          );
        }
      }

      setIsConnected(true);
      setConnectionError(null);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setIsConnected(false);
      setConnectionError('Failed to fetch notifications');
    }
  }, [API_URL, onNotificationReceived]);

  useEffect(() => {
    console.log('✅ Notification polling initialized (using REST API)');

    // Initial fetch
    fetchNotifications();

    // Set up polling interval (check every 30 seconds to reduce server load)
    pollingIntervalRef.current = setInterval(() => {
      fetchNotifications();
    }, POLLING_INTERVAL);

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchNotifications]);

  // Manual refresh function
  const refresh = useCallback(() => {
    console.log('🔄 Manual notification refresh');
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    isConnected,
    connectionError,
    refresh,
    markAsRead: () => {}, // Not used with REST API polling
    markAllAsRead: () => {}, // Not used with REST API polling
  };
};