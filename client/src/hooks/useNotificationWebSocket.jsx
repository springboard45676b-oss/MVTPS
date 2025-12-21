// src/hooks/useNotificationWebSocket.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Custom hook for notification management
 * Uses REST API polling instead of WebSocket (no Daphne needed)
 * Checks for new notifications every 10 seconds
 */
export const useNotificationWebSocket = (onNotificationReceived) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const lastNotificationTimeRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

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

          // Show toast notification
          console.log('📢 New notification received:', latestNotification);
          toast.success(
            () => (
              <div className="flex flex-col gap-1">
                <p className="font-semibold">
                  {(latestNotification.type || 'alert').toUpperCase()}
                </p>
                <p className="text-sm">{latestNotification.message}</p>
                {latestNotification.vessel_name && (
                  <p className="text-xs opacity-75">
                    Vessel: {latestNotification.vessel_name}
                  </p>
                )}
              </div>
            ),
            {
              duration: 5000,
              position: 'top-right',
              icon: '🚢',
              style: {
                background: '#10b981',
                color: '#fff',
              }
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

    // Set up polling interval (check every 10 seconds)
    pollingIntervalRef.current = setInterval(() => {
      fetchNotifications();
    }, 10000);

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