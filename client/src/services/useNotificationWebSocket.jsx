// src/services/useNotificationWebSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

// Configuration object
const CONFIG = {
  MAX_RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 3000,
  HEARTBEAT_INTERVAL: 30000,
  NOTIFICATION_DEBOUNCE: 1000,
  MAX_VISIBLE_TOASTS: 5,
  CONNECTION_TIMEOUT: 10000,
  TOAST_DURATION: 15000
};

export const useNotificationWebSocket = (onNotificationReceived) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(true);
  const heartbeatTimeoutRef = useRef(null);
  const isConnectingRef = useRef(false);
  const mountedRef = useRef(true);
  const lastNotificationTimeRef = useRef(0);
  const processingNotificationRef = useRef(false);
  const activeToastsRef = useRef(new Set());

  const WS_URL = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000';

  const getToastStyle = (type) => {
    const typeMap = {
      'info': {
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-600',
        progressColor: 'bg-blue-500',
        icon: '💡'
      },
      'success': {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600',
        progressColor: 'bg-green-500',
        icon: '✅'
      },
      'warning': {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-600',
        progressColor: 'bg-yellow-500',
        icon: '⚠️'
      },
      'error': {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        progressColor: 'bg-red-500',
        icon: '❌'
      },
      'alert': {
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        iconColor: 'text-orange-600',
        progressColor: 'bg-orange-500',
        icon: '🚨'
      },
      'update': {
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        iconColor: 'text-purple-600',
        progressColor: 'bg-purple-500',
        icon: '🔄'
      }
    };

    return typeMap[type] || typeMap['info'];
  };

  const showToast = useCallback((notification) => {
    // Prevent notification spam - debounce notifications
    const now = Date.now();
    if (processingNotificationRef.current || (now - lastNotificationTimeRef.current) < CONFIG.NOTIFICATION_DEBOUNCE) {
      console.log('Notification debounced - too soon since last notification');
      return;
    }

    processingNotificationRef.current = true;
    lastNotificationTimeRef.current = now;

    const { notification_type = 'info', message, vessel_name, event_type, timestamp } = notification;
    const style = getToastStyle(notification_type);

    // Limit number of visible toasts - dismiss oldest if we have too many
    if (activeToastsRef.current.size >= CONFIG.MAX_VISIBLE_TOASTS) {
      const oldestToastId = Array.from(activeToastsRef.current)[0];
      toast.dismiss(oldestToastId);
      activeToastsRef.current.delete(oldestToastId);
    }

    // Allow notifications to stack - don't dismiss previous ones
    const toastId = toast.custom(
      (t) => (
        <div 
          className={`w-96 ${style.bgColor} border-l-4 ${style.borderColor} rounded-lg shadow-xl overflow-hidden ${
            t.visible 
              ? 'animate-slideIn' 
              : 'animate-slideOut'
          }`}
          style={{
            animation: t.visible 
              ? 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards' 
              : 'slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
          }}
        >
          <div className="flex items-start p-4">            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-800 font-semibold leading-tight">
                  {message}
                </p>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors ml-3"
                  aria-label="Close notification"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                {vessel_name && (
                  <span className="inline-flex items-center gap-1">
                    <span className="text-base">🚢</span>
                    <span className="font-medium">{vessel_name}</span>
                  </span>
                )}
                {event_type && event_type !== 'unknown' && (
                  <span className="inline-flex items-center gap-1">
                    <span className="text-base">📍</span>
                    <span>{event_type.replace('_', ' ')}</span>
                  </span>
                )}
                {timestamp && (
                  <span className="inline-flex items-center gap-1">
                    <span className="text-base">🕐</span>
                    <span>{new Date(timestamp).toLocaleTimeString()}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="h-1 bg-gray-200 overflow-hidden">
            <div 
              className={`h-full ${style.progressColor}`}
              style={{ 
                animation: t.visible ? 'progressBar 15s linear forwards' : 'none',
                width: t.visible ? '100%' : '0%'
              }} 
            />
          </div>
          
          <style>{`
            @keyframes slideIn {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            
            @keyframes slideOut {
              from {
                transform: translateX(0) scale(1);
                opacity: 1;
                max-height: 200px;
                margin-bottom: 8px;
              }
              to {
                transform: translateX(100%) scale(0.95);
                opacity: 0;
                max-height: 0;
                margin-bottom: 0;
              }
            }
            
            @keyframes progressBar {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}</style>
        </div>
      ),
      { 
        duration: CONFIG.TOAST_DURATION, 
        position: 'top-right',
        style: {
          marginTop: '80px',
          zIndex: 9999
        }
      }
    );

    // Track active toasts
    activeToastsRef.current.add(toastId);

    // Remove from tracking when toast is dismissed
    setTimeout(() => {
      activeToastsRef.current.delete(toastId);
    }, CONFIG.TOAST_DURATION);

    // Reset processing flag after a short delay
    setTimeout(() => {
      processingNotificationRef.current = false;
    }, 500);
  }, []);

  const setupHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current);
    }

    const sendHeartbeat = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ type: 'ping' }));
        } catch (error) {
          console.error('WebSocket: Failed to send heartbeat');
        }
      }
    };

    heartbeatTimeoutRef.current = setInterval(sendHeartbeat, CONFIG.HEARTBEAT_INTERVAL);
  }, []);

  const clearHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current || !shouldReconnectRef.current || !mountedRef.current) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsConnected(false);
        setConnectionError('Authentication required');
        return;
      }

      // If already connected, don't reconnect
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        return;
      }

      // If currently connecting, wait for it to finish
      if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
        return;
      }

      // Close any existing connection before creating new one
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {
          // Silent error handling
        }
        wsRef.current = null;
      }

      isConnectingRef.current = true;
      const wsUrl = `${WS_URL}/ws/notifications/?token=${token}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Set a timeout to handle connections that take too long
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close();
          isConnectingRef.current = false;
          setConnectionError('Connection timeout');
        }
      }, CONFIG.CONNECTION_TIMEOUT);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        
        if (!mountedRef.current) {
          ws.close();
          return;
        }
        
        console.log('WebSocket connected successfully');
        isConnectingRef.current = false;
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
        setupHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'pong' || data.type === 'connection_established') {
            return;
          }

          if (data.type === 'notification' && onNotificationReceived) {
            onNotificationReceived(data);
            showToast(data.data || data);
          }
        } catch (error) {
          console.error('WebSocket: Error parsing message');
        }
      };

      ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        
        if (!mountedRef.current) return;
        
        isConnectingRef.current = false;
        setConnectionError('Connection error');
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        
        if (!mountedRef.current) return;
        
        isConnectingRef.current = false;
        clearHeartbeat();
        setIsConnected(false);

        // Only attempt reconnection if it was not a clean close
        if (shouldReconnectRef.current && 
            reconnectAttemptsRef.current < CONFIG.MAX_RECONNECT_ATTEMPTS &&
            event.code !== 1000 && 
            event.code !== 1001) {
          
          reconnectAttemptsRef.current += 1;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current && shouldReconnectRef.current) {
              connectWebSocket();
            }
          }, CONFIG.RECONNECT_DELAY);
        } else if (reconnectAttemptsRef.current >= CONFIG.MAX_RECONNECT_ATTEMPTS) {
          setConnectionError('Failed to connect to notification service. Please refresh the page.');
          shouldReconnectRef.current = false;
        }
      };

    } catch (error) {
      if (!mountedRef.current) return;
      
      isConnectingRef.current = false;
      setConnectionError('Failed to establish connection');
    }
  }, [WS_URL, onNotificationReceived, showToast, setupHeartbeat, clearHeartbeat]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    clearHeartbeat();
    isConnectingRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close(1000, 'Client disconnecting');
      } catch (e) {
        // Silent error handling
      }
      wsRef.current = null;
    }

    setIsConnected(false);
  }, [clearHeartbeat]);

  // Only run once on mount
  useEffect(() => {
    mountedRef.current = true;
    shouldReconnectRef.current = true;
    
    // Small delay to ensure component is fully mounted
    const initTimeout = setTimeout(() => {
      if (mountedRef.current) {
        connectWebSocket();
      }
    }, 100);

    return () => {
      mountedRef.current = false;
      clearTimeout(initTimeout);
      disconnect();
    };
  }, []);

  const send = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
      } catch (error) {
        console.error('WebSocket: Failed to send message');
      }
    }
  }, []);

  const markAsRead = useCallback((notificationId) => {
    send({
      type: 'mark_read',
      notification_id: notificationId
    });
  }, [send]);

  const markAllAsRead = useCallback(() => {
    send({
      type: 'mark_all_read'
    });
  }, [send]);

  return {
    isConnected,
    connectionError,
    disconnect,
    send,
    markAsRead,
    markAllAsRead,
    showToast,
  };
};

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/users/subscriptions/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch subscriptions');

      const data = await response.json();
      setSubscriptions(data);
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const subscribe = useCallback(async (vesselId) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/vessels/${vesselId}/subscribe/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to subscribe');
    
    await fetchSubscriptions();
  }, [API_URL, fetchSubscriptions]);

  const unsubscribe = useCallback(async (vesselId) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/vessels/${vesselId}/unsubscribe/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to unsubscribe');
    
    await fetchSubscriptions();
  }, [API_URL, fetchSubscriptions]);

  return {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    subscribe,
    unsubscribe,
  };
};