import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import websocketService from '../services/websocket';
import { toast } from 'react-toastify';

export const useLiveVesselTracking = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [trackedVessels, setTrackedVessels] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);

  // Initialize WebSocket connection
  useEffect(() => {
    if (user?.token) {
      websocketService.connect(user.token);

      // Subscribe to connection events
      const unsubscribeConnection = websocketService.subscribe('connection', (data) => {
        setIsConnected(data.status === 'connected');
      });

      // Subscribe to vessel updates
      const unsubscribeVesselUpdate = websocketService.subscribe('vessel_update', (data) => {
        handleVesselUpdate(data);
      });

      // Subscribe to destination reached events
      const unsubscribeDestination = websocketService.subscribe('destination_reached', (data) => {
        handleDestinationReached(data);
      });

      // Subscribe to notifications
      const unsubscribeNotification = websocketService.subscribe('notification', (data) => {
        handleNotification(data);
      });

      return () => {
        unsubscribeConnection();
        unsubscribeVesselUpdate();
        unsubscribeDestination();
        unsubscribeNotification();
        websocketService.disconnect();
      };
    }
  }, [user]);

  // Handle vessel position updates
  const handleVesselUpdate = useCallback((data) => {
    const { mmsi, latitude, longitude, speed, course, status, timestamp } = data;
    
    setTrackedVessels(prev => {
      const updated = new Map(prev);
      const vessel = updated.get(mmsi);
      
      if (vessel) {
        const updatedVessel = {
          ...vessel,
          latitude,
          longitude,
          speed,
          course,
          status,
          timestamp,
          lastUpdate: new Date()
        };
        
        updated.set(mmsi, updatedVessel);
        
        // Update vessel position in tracking component
        if (vessel.trackingRef?.current) {
          vessel.trackingRef.current.updatePosition(latitude, longitude);
        }
      }
      
      return updated;
    });
  }, []);

  // Handle destination reached events
  const handleDestinationReached = useCallback((data) => {
    const { mmsi, vessel_name, destination, arrival_time } = data;
    
    // Show toast notification
    toast.success(`🎯 ${vessel_name} has reached ${destination}!`, {
      position: "top-right",
      autoClose: 8000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });

    // Add to notification system
    addNotification({
      id: Date.now(),
      type: 'destination_reached',
      title: 'Destination Reached',
      message: `${vessel_name} has arrived at ${destination}`,
      vessel_mmsi: mmsi,
      timestamp: arrival_time,
      is_read: false,
      priority: 'high'
    });

    // Play notification sound if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`🚢 ${vessel_name} - Destination Reached`, {
        body: `${vessel_name} has arrived at ${destination}`,
        icon: '/favicon.ico',
        tag: `destination-${mmsi}`
      });
    }
  }, [addNotification]);

  // Handle general notifications
  const handleNotification = useCallback((data) => {
    addNotification(data);
    
    // Show toast for important notifications
    if (data.priority === 'high') {
      toast.info(data.message, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [addNotification]);

  // Start tracking a vessel
  const startTracking = useCallback((vessel) => {
    if (!isConnected) {
      toast.error('WebSocket not connected. Cannot start tracking.');
      return false;
    }

    const { mmsi } = vessel;
    
    // Add to tracked vessels
    setTrackedVessels(prev => {
      const updated = new Map(prev);
      updated.set(mmsi, {
        ...vessel,
        isTracked: true,
        trackingStarted: new Date(),
        trackingRef: { current: null }
      });
      return updated;
    });

    // Subscribe to vessel updates via WebSocket
    websocketService.subscribeToVessel(mmsi);
    
    toast.success(`Started tracking ${vessel.name}`, {
      position: "bottom-right",
      autoClose: 3000,
    });

    return true;
  }, [isConnected]);

  // Stop tracking a vessel
  const stopTracking = useCallback((mmsi) => {
    setTrackedVessels(prev => {
      const updated = new Map(prev);
      const vessel = updated.get(mmsi);
      
      if (vessel) {
        // Unsubscribe from vessel updates
        websocketService.unsubscribeFromVessel(mmsi);
        updated.delete(mmsi);
        
        toast.info(`Stopped tracking ${vessel.name}`, {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
      
      return updated;
    });
  }, []);

  // Get tracking status for a vessel
  const isVesselTracked = useCallback((mmsi) => {
    return trackedVessels.has(mmsi);
  }, [trackedVessels]);

  // Get tracked vessel data
  const getTrackedVessel = useCallback((mmsi) => {
    return trackedVessels.get(mmsi);
  }, [trackedVessels]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notifications enabled for vessel tracking!');
      }
    }
  }, []);

  return {
    trackedVessels: Array.from(trackedVessels.values()),
    isConnected,
    startTracking,
    stopTracking,
    isVesselTracked,
    getTrackedVessel,
    requestNotificationPermission
  };
};