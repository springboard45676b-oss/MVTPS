// src/pages/liveTracking/hooks/useVesselAlerts.js
import { useRef } from 'react';
import toast from 'react-hot-toast';
import { calculateDistance } from '../utils/vesselUtils';

export const useVesselAlerts = (API_URL, weatherAlerts, piracyZones) => {
  const toastNotificationTracker = useRef({});

  const checkVesselDanger = async (vessel, position) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      const subsResponse = await fetch(`${API_URL}/users/subscriptions/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!subsResponse.ok) return;
      
      const subsData = await subsResponse.json();
      const subscriptions = Array.isArray(subsData) ? subsData : (subsData.results || []);
      const subscription = subscriptions.find(sub => 
        sub.vessel === vessel.id && sub.is_active
      );
      
      if (!subscription) return;

      // Check weather alerts
      if (subscription.weather_alerts === true) {
        for (const alert of weatherAlerts) {
          const distance = calculateDistance(
            position.latitude,
            position.longitude,
            alert.latitude,
            alert.longitude
          );
          
          if (distance <= alert.radius_km) {
            const notificationKey = `weather-${vessel.id}-${alert.id}`;
            
            if (!toastNotificationTracker.current[notificationKey]) {
              toastNotificationTracker.current[notificationKey] = true;
              
              toast(`⚠️ ${vessel.name} near ${alert.weather_type_display}`, {
                position: 'top-right',
                duration: 4000,
                style: {
                  background: '#fff7ed',
                  color: '#7c2d12',
                  border: '2px solid #ea580c',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                }
              });
              
              // Send to backend
              await fetch(`${API_URL}/notifications/`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  vessel: vessel.id,
                  notification_type: 'weather_alert',
                  title: `Weather Alert: ${vessel.name}`,
                  message: `${vessel.name} entered ${alert.name} - ${alert.weather_type_display} (${alert.severity})`,
                  severity: alert.severity,
                  latitude: position.latitude,
                  longitude: position.longitude
                })
              }).catch(err => console.error('Notification error:', err));
            }
          }
        }
      }

      // Check piracy zones
      if (subscription.piracy_alerts === true) {
        for (const zone of piracyZones) {
          const distance = calculateDistance(
            position.latitude,
            position.longitude,
            zone.latitude,
            zone.longitude
          );
          
          if (distance <= (zone.radius_km || 200)) {
            const notificationKey = `piracy-${vessel.id}-${zone.id}`;
            
            if (!toastNotificationTracker.current[notificationKey]) {
              toastNotificationTracker.current[notificationKey] = true;
              
              toast(`🚨 ${vessel.name} in piracy zone`, {
                position: 'top-right',
                duration: 4000,
                style: {
                  background: '#fef2f2',
                  color: '#7f1d1d',
                  border: '2px solid #dc2626',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                }
              });
              
              // Send to backend
              await fetch(`${API_URL}/notifications/`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  vessel: vessel.id,
                  notification_type: 'piracy_alert',
                  title: `Piracy Alert: ${vessel.name}`,
                  message: `${vessel.name} entered piracy zone: ${zone.name} - ${zone.risk_level} risk`,
                  severity: zone.risk_level,
                  latitude: position.latitude,
                  longitude: position.longitude
                })
              }).catch(err => console.error('Notification error:', err));
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking vessel danger:', error);
    }
  };

  const clearNotificationTrackers = () => {
    toastNotificationTracker.current = {};
  };

  return { 
    checkVesselDanger,
    clearNotificationTrackers,
    toastNotificationTracker 
  };
};