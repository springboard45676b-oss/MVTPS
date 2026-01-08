import { useState, useEffect } from "react";
import { Bell, Check, X, Clock, AlertTriangle } from 'lucide-react';
import { getNotifications } from "../api/notifications";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from '../hooks/useWebSocket';
import '../styles/Notifications.css';

const Notifications = () => {
  const { user, token } = useAuth();
  const { subscribeToAlerts } = useWebSocket('ws://localhost:8000/ws/vessels/alerts/');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getNotifications();
        // Handle different response structures
        if (Array.isArray(data)) {
          setItems(data);
        } else if (data && Array.isArray(data.results)) {
          setItems(data.results);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Subscribe to real-time alerts
  useEffect(() => {
    if (!token) return;

    const unsubscribe = subscribeToAlerts((alert) => {
      const newNotification = {
        id: alert.id,
        title: `${alert.alert_type.toUpperCase()} Alert`,
        message: alert.message,
        type: 'alert',
        created_at: alert.created_at,
        is_read: false,
        vessel_name: alert.vessel.name,
        vessel_mmsi: alert.vessel.mmsi
      };

      setItems(prev => [newNotification, ...prev]);
    });

    return unsubscribe;
  }, [token, subscribeToAlerts]);

  const markAsRead = async (id) => {
    try {
      // API call to mark as read would go here
      setItems(items.map(item => 
        item.id === id ? { ...item, is_read: true } : item
      ));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const getAlertIcon = (type, alertType) => {
    if (type === 'alert') {
      switch (alertType) {
        case 'speed':
          return <AlertTriangle style={{ width: '20px', height: '20px', color: '#ef4444' }} />;
        case 'port':
          return <Bell style={{ width: '20px', height: '20px', color: '#10b981' }} />;
        case 'status':
          return <Bell style={{ width: '20px', height: '20px', color: '#3b82f6' }} />;
        default:
          return <Bell style={{ width: '20px', height: '20px', color: '#64748b' }} />;
      }
    }
    return <Bell style={{ width: '20px', height: '20px', color: '#64748b' }} />;
  };

  const getAlertColor = (type, alertType) => {
    if (type === 'alert') {
      switch (alertType) {
        case 'speed':
          return '#fee2e2';
        case 'port':
          return '#d1fae5';
        case 'status':
          return '#dbeafe';
        default:
          return '#f3f4f6';
      }
    }
    return '#f3f4f6';
  };

  return (
    <div style={{ 
      width: '100%', 
      minHeight: 'calc(100vh - 64px)',
      backgroundColor: '#f8fafc',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              backgroundColor: '#3b82f6', 
              padding: '8px', 
              borderRadius: '8px' 
            }}>
              <Bell style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              margin: 0
            }}>
              Notifications
            </h1>
          </div>
        </div>
        <p style={{ 
          color: '#64748b', 
          fontSize: '14px',
          margin: 0 
        }}>
          View and manage your vessel alerts and system notifications
        </p>
      </div>

      {/* Notifications List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: 'center', color: '#64748b' }}>
            Loading notifications...
          </div>
        ) : items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: item.is_read ? '#f8fafc' : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'background-color 0.2s'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: item.is_read ? '#e2e8f0' : getAlertColor(item.type, item.alert_type),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {getAlertIcon(item.type, item.alert_type)}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: item.is_read ? '400' : '600', 
                  color: '#1f2937',
                  marginBottom: '4px'
                }}>
                  {item.title || 'Notification'}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#64748b',
                  marginBottom: '8px'
                }}>
                  {item.message || 'No message content'}
                </div>
                {item.vessel_name && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#94a3b8',
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    Vessel: {item.vessel_name} (MMSI: {item.vessel_mmsi})
                  </div>
                )}
                <div style={{ 
                  fontSize: '12px', 
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Clock style={{ width: '12px', height: '12px' }} />
                  {item.created_at ? new Date(item.created_at).toLocaleString() : 'Unknown time'}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {!item.is_read && (
                  <button
                    onClick={() => markAsRead(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <Check style={{ width: '14px', height: '14px' }} />
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ 
            padding: "60px", 
            textAlign: "center", 
            color: "#64748b",
            fontSize: '16px'
          }}>
            <Bell style={{ 
              width: '48px', 
              height: '48px', 
              color: '#cbd5e1', 
              margin: '0 auto 16px',
              display: 'block'
            }} />
            No notifications yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;