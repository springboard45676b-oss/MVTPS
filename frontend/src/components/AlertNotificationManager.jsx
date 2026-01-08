import { useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export const AlertNotificationManager = () => {
  const { token } = useAuth();
  const wsUrl = 'ws://localhost:8000/ws/vessels/alerts/';
  const { subscribeToAlerts, isConnected } = useWebSocket(wsUrl);

  useEffect(() => {
    if (!token || !isConnected) return;

    const unsubscribe = subscribeToAlerts((alert) => {
      const { alert_type, message, vessel } = alert;
      const vesselName = vessel?.name || alert.vessel_name || 'Unknown Vessel';
      
      // Show toast notification based on alert type
      switch (alert_type) {
        case 'speed':
          toast.error(`⚡ Speed Alert: ${vesselName}`, {
            description: message,
            duration: 5000,
          });
          break;
        case 'port':
          toast.success(`🚢 Port Activity: ${vesselName}`, {
            description: message,
            duration: 5000,
          });
          break;
        case 'status':
          toast(`📊 Status Update: ${vesselName}`, {
            description: message,
            duration: 5000,
          });
          break;
        default:
          toast(message, {
            icon: '🔔',
            duration: 5000,
          });
      }
    });

    return unsubscribe;
  }, [token, subscribeToAlerts, isConnected]);

  // Show connection status
  useEffect(() => {
    if (token && !isConnected) {
      console.log('WebSocket not connected');
    }
  }, [token, isConnected]);

  return null; // This component only manages notifications
};