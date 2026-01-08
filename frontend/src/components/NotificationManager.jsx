import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import api from '../api/axios';
// import { websocketService } from '../services/websocket'; // Real WebSocket
import { websocketService } from '../services/Mockwebsocket'; // Mock for testing

/**
 * Complete Notification System - Bell Icon + Panel
 * Just import and add to your Navbar: <NotificationManager />
 */
const NotificationManager = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([
    // Sample notifications to show immediately
    {
      id: 1,
      vesselName: 'MV Ocean Navigator',
      vesselMmsi: '123456789',
      alertType: 'speed',
      message: 'Speed exceeded maximum threshold of 15 knots',
      timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      read: false
    },
    {
      id: 2,
      vesselName: 'MV Pacific Explorer',
      vesselMmsi: '987654321',
      alertType: 'port',
      message: 'Vessel has entered port zone',
      timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
      read: false
    },
    {
      id: 3,
      vesselName: 'SS Maritime Star',
      vesselMmsi: '555666777',
      alertType: 'status',
      message: 'Navigation status changed to "Under way using engine"',
      timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
      read: true
    }
  ]);
  const [showPanel, setShowPanel] = useState(false);

  const subscribeToAlerts = (callback) => {
    console.log('subscribeToAlerts called, websocketService:', websocketService);
    
    try {
      if (websocketService && websocketService.onAlert) {
        console.log('Subscribing to alerts...');
        return websocketService.onAlert(callback);
      } else {
        console.warn('websocketService.onAlert not available - WebSocket may not be connected');
        return () => {};
      }
    } catch (error) {
      console.error('Error subscribing to alerts:', error);
      return () => {};
    }
  };

  const isConnected = websocketService && websocketService.isConnected 
    ? websocketService.isConnected() 
    : false;

  // Fetch existing notifications from API
  const fetchNotifications = async () => {
    if (!token) return;
    
    try {
      const response = await api.get('vessels/alerts/');
      const alerts = response.data.results || response.data;
      
      const mappedNotifications = alerts.map(alert => ({
        id: alert.id,
        vesselName: alert.vessel_name || alert.vessel?.name || 'Unknown',
        vesselMmsi: alert.vessel_mmsi || alert.vessel?.mmsi || 'N/A',
        alertType: alert.alert_type,
        message: alert.message,
        timestamp: alert.created_at,
        read: true
      }));
      
      setNotifications(mappedNotifications);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('Alerts endpoint not available, will rely on WebSocket');
      } else {
        console.error('Failed to fetch notifications:', error);
      }
    }
  };

  // Load notifications on mount
  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  // Subscribe to real-time WebSocket alerts
  useEffect(() => {
    if (!token) return;

    const unsubscribe = subscribeToAlerts((alert) => {
      console.log('🔔 WebSocket alert received:', alert);
      
      const newNotification = {
        id: alert.id || Date.now(),
        vesselName: alert.vessel?.name || alert.vessel_name || 'Unknown',
        vesselMmsi: alert.vessel?.mmsi || alert.vessel_mmsi || 'N/A',
        alertType: alert.alert_type || 'status',
        message: alert.message || JSON.stringify(alert),
        timestamp: alert.created_at || alert.timestamp || new Date().toISOString(),
        read: false
      };

      setNotifications(prev => [newNotification, ...prev]);
    });

    return unsubscribe;
  }, [token, isConnected]);

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const addTestNotification = () => {
    const testNotification = {
      id: Date.now(),
      vesselName: 'Test Vessel',
      vesselMmsi: '123456789',
      alertType: 'speed',
      message: 'This is a test notification',
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [testNotification, ...prev]);
  };

  const getAlertIcon = (alertType) => {
    const iconStyle = { width: '16px', height: '16px' };
    switch (alertType) {
      case 'speed':
        return <AlertTriangle style={{ ...iconStyle, color: '#ef4444' }} />;
      case 'port':
        return <CheckCircle style={{ ...iconStyle, color: '#10b981' }} />;
      case 'status':
        return <Info style={{ ...iconStyle, color: '#3b82f6' }} />;
      default:
        return <Bell style={{ ...iconStyle, color: '#6b7280' }} />;
    }
  };

  const getAlertColor = (alertType) => {
    switch (alertType) {
      case 'speed':
        return { bg: '#fef2f2', border: '#fecaca' };
      case 'port':
        return { bg: '#f0fdf4', border: '#bbf7d0' };
      case 'status':
        return { bg: '#eff6ff', border: '#bfdbfe' };
      default:
        return { bg: '#f9fafb', border: '#e5e7eb' };
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Bell Icon Button for Navbar */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Bell style={{ width: '20px', height: '20px' }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            minWidth: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: '800',
            padding: '0 4px',
            border: '2px solid white',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel Modal */}
      {showPanel && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px'
          }}
          onClick={() => setShowPanel(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  padding: '12px',
                  borderRadius: '12px'
                }}>
                  <Bell style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: '#1e293b',
                    margin: 0
                  }}>
                    Notifications
                  </h2>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#64748b', 
                    margin: 0,
                    marginTop: '2px'
                  }}>
                    {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                    {unreadCount > 0 && ` • ${unreadCount} unread`}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={addTestNotification}
                  style={{
                    background: '#dbeafe',
                    border: 'none',
                    color: '#3b82f6',
                    fontSize: '13px',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#bfdbfe';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#dbeafe';
                  }}
                >
                  Test Alert
                </button>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '13px',
                      cursor: 'pointer',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#fecaca';
                      e.target.style.color = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f1f5f9';
                      e.target.style.color = '#64748b';
                    }}
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowPanel(false)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e2e8f0';
                    e.target.style.color = '#475569';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f1f5f9';
                    e.target.style.color = '#64748b';
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Notifications List */}
            {notifications.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '64px 32px',
                color: '#64748b'
              }}>
                <Bell style={{
                  width: '64px',
                  height: '64px',
                  color: '#cbd5e1',
                  margin: '0 auto 16px'
                }} />
                <p style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                  No notifications yet
                </p>
                <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px' }}>
                  Subscribe to vessels to receive alerts
                </p>
                {!isConnected && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#f97316', 
                    marginTop: '12px',
                    fontWeight: '600',
                    backgroundColor: '#fff7ed',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #fed7aa'
                  }}>
                    <div style={{ marginBottom: '4px' }}>⚠️ WebSocket Disconnected</div>
                    <div style={{ fontSize: '11px', fontWeight: '500', color: '#c2410c' }}>
                      Real-time alerts unavailable
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.map((notification) => {
                  const colors = getAlertColor(notification.alertType);
                  return (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      style={{
                        background: colors.bg,
                        borderRadius: '16px',
                        padding: '16px',
                        border: `2px solid ${colors.border}`,
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        opacity: notification.read ? 0.7 : 1
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(4px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {!notification.read && (
                        <div style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#ef4444',
                          boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
                        }} />
                      )}
                      
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'white',
                          flexShrink: 0
                        }}>
                          {getAlertIcon(notification.alertType)}
                        </div>
                        
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '6px',
                            gap: '8px'
                          }}>
                            <h3 style={{
                              fontSize: '16px',
                              fontWeight: '700',
                              color: '#1e293b',
                              margin: 0
                            }}>
                              {notification.vesselName}
                            </h3>
                            <span style={{
                              fontSize: '11px',
                              color: '#64748b',
                              fontWeight: '500',
                              whiteSpace: 'nowrap'
                            }}>
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          
                          <p style={{
                            color: '#475569',
                            margin: 0,
                            fontSize: '14px',
                            marginBottom: '8px',
                            lineHeight: '1.5'
                          }}>
                            {notification.message}
                          </p>
                          
                          <div style={{
                            display: 'flex',
                            gap: '12px',
                            fontSize: '12px',
                            color: '#64748b',
                            alignItems: 'center'
                          }}>
                            <span style={{ fontWeight: '500' }}>
                              MMSI: {notification.vesselMmsi}
                            </span>
                            <span>•</span>
                            <span style={{
                              textTransform: 'uppercase',
                              fontWeight: '700',
                              fontSize: '10px',
                              letterSpacing: '0.5px'
                            }}>
                              {notification.alertType}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationManager;