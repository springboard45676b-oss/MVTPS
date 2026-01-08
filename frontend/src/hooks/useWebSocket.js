// hooks/useWebSocket.js
import { useEffect, useState } from 'react';
import { websocketService } from '../services/websocket';

export const useWebSocket = (token) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastAlert, setLastAlert] = useState(null);
  const [lastPositionUpdate, setLastPositionUpdate] = useState(null);

  // Connect to WebSockets when token is available
  useEffect(() => {
    if (!token) {
      return;
    }

    console.log('Connecting WebSockets with token...');
    
    // Connect both WebSocket connections
    websocketService.connectAlerts(token);
    websocketService.connectPositions(token);
    
    // Check connection status periodically
    const checkConnection = () => {
      const connected = websocketService.isConnected();
      setIsConnected(connected);
    };
    
    // Initial check
    checkConnection();
    
    // Set up interval to check connection status
    const connectionInterval = setInterval(checkConnection, 1000);
    
    // Cleanup function
    return () => {
      console.log('Cleaning up WebSocket connections...');
      clearInterval(connectionInterval);
      websocketService.disconnect();
    };
  }, [token]);

  // Subscribe to alerts and position updates
  useEffect(() => {
    // Subscribe to alerts
    const unsubscribeAlert = websocketService.onAlert((alert) => {
      console.log('Alert received in hook:', alert);
      setLastAlert(alert);
    });

    // Subscribe to position updates
    const unsubscribePosition = websocketService.onPositionUpdate((vessel, position) => {
      console.log('Position update received in hook:', vessel, position);
      setLastPositionUpdate({ vessel, position });
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeAlert();
      unsubscribePosition();
    };
  }, []);

  // Subscribe to alerts with custom callback
  const subscribeToAlerts = (callback) => {
    if (typeof callback !== 'function') {
      console.error('subscribeToAlerts: callback must be a function');
      return () => {};
    }
    return websocketService.onAlert(callback);
  };

  // Subscribe to position updates with custom callback
  const subscribeToPositionUpdates = (callback) => {
    if (typeof callback !== 'function') {
      console.error('subscribeToPositionUpdates: callback must be a function');
      return () => {};
    }
    return websocketService.onPositionUpdate(callback);
  };

  // Subscribe to filtered vessels updates with custom callback
  const subscribeToFilteredVessels = (callback) => {
    if (typeof callback !== 'function') {
      console.error('subscribeToFilteredVessels: callback must be a function');
      return () => {};
    }
    return websocketService.onFilteredVesselsUpdate(callback);
  };

  // Send message to alert WebSocket
  const sendAlertMessage = (message) => {
    return websocketService.sendAlertMessage(message);
  };

  // Send message to position WebSocket
  const sendPositionMessage = (message) => {
    return websocketService.sendPositionMessage(message);
  };

  // Subscribe to specific vessel
  const subscribeToVessel = (vesselId) => {
    websocketService.subscribeToVessel(vesselId);
  };

  // Unsubscribe from specific vessel
  const unsubscribeFromVessel = (vesselId) => {
    websocketService.unsubscribeFromVessel(vesselId);
  };

  // Get detailed connection status
  const getConnectionStatus = () => {
    return websocketService.getConnectionStatus();
  };

  return {
    // Connection state
    isConnected,
    
    // Latest received data
    lastAlert,
    lastPositionUpdate,
    
    // Subscription methods
    subscribeToAlerts,
    subscribeToPositionUpdates,
    subscribeToFilteredVessels,
    
    // Send message methods
    sendAlertMessage,
    sendPositionMessage,
    
    // Vessel subscription methods
    subscribeToVessel,
    unsubscribeFromVessel,
    
    // Connection status
    getConnectionStatus,
  };
};