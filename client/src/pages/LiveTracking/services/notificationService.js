// src/pages/liveTracking/services/notificationService.js
import toast from 'react-hot-toast';

/**
 * Enhanced notification service for maritime tracking
 * Handles position updates, arrivals, departures, weather, and piracy alerts
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Track recent notifications to prevent duplicates
const recentNotifications = new Map();
const NOTIFICATION_COOLDOWN = 2000; // 2 seconds cooldown between same type notifications

/**
 * Check if we should send notification (prevent spam)
 */
const shouldSendNotification = (key) => {
  const now = Date.now();
  const lastSent = recentNotifications.get(key);
  
  if (lastSent && (now - lastSent) < NOTIFICATION_COOLDOWN) {
    return false; // Too soon, skip this notification
  }
  
  recentNotifications.set(key, now);
  return true;
};

// Toast styles
const toastStyles = {
  success: {
    background: '#ffffff',
    color: '#059669',
    padding: '8px 14px',
    borderRadius: '8px',
    boxShadow: '0 3px 10px rgba(5, 150, 105, 0.12)',
    border: '1px solid #d1fae5',
    fontSize: '13px',
    fontWeight: '500',
    maxWidth: '320px',
  },
  warning: {
    background: '#ffffff',
    color: '#d97706',
    padding: '8px 14px',
    borderRadius: '8px',
    boxShadow: '0 3px 10px rgba(217, 119, 6, 0.12)',
    border: '1px solid #fed7aa',
    fontSize: '13px',
    fontWeight: '500',
    maxWidth: '320px',
  },
  danger: {
    background: '#ffffff',
    color: '#dc2626',
    padding: '8px 14px',
    borderRadius: '8px',
    boxShadow: '0 3px 10px rgba(220, 38, 38, 0.12)',
    border: '1px solid #fee2e2',
    fontSize: '13px',
    fontWeight: '500',
    maxWidth: '320px',
  },
  info: {
    background: '#ffffff',
    color: '#2563eb',
    padding: '8px 14px',
    borderRadius: '8px',
    boxShadow: '0 3px 10px rgba(37, 99, 235, 0.12)',
    border: '1px solid #dbeafe',
    fontSize: '13px',
    fontWeight: '500',
    maxWidth: '320px',
  }
};

/**
 * Send position update notification
 */
export const sendPositionUpdateNotification = async (vessel, position) => {
  try {
    const notificationKey = `position_${vessel.id}`;
    if (!shouldSendNotification(notificationKey)) {
      return; // Skip duplicate notification
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    // Check if user is subscribed to this vessel
    const subscription = await checkSubscription(vessel.id, token);
    if (!subscription || !subscription.is_active) return;

    // Check if position updates are enabled
    if (subscription.alert_type !== 'all' && subscription.alert_type !== 'position_update') return;

    // Send to backend
    const response = await fetch(`${API_URL}/notifications/send/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vessel: vessel.id,
        type: 'position_update',
        message: `${vessel.name} position updated`,
        data: {
          latitude: position.latitude,
          longitude: position.longitude,
          speed: position.speed,
          course: position.course
        }
      })
    });

    // Show progress bar toast on top-right (backend response)
    if (response.ok) {
      toast.success(`${vessel.name} position updated`, {
        position: 'top-right',
        duration: 3000,
        icon: '📍',
        style: {
          background: '#ffffff',
          color: '#059669',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 3px 10px rgba(5, 150, 105, 0.12)',
          border: '1px solid #d1fae5',
          fontSize: '12px',
          fontWeight: '500',
        }
      });
    }
  } catch (error) {
    console.error('Error sending position update:', error);
  }
};

/**
 * Send arrival notification
 */
export const sendArrivalNotification = async (vessel, port) => {
  try {
    const notificationKey = `arrival_${vessel.id}_${port.id}`;
    if (!shouldSendNotification(notificationKey)) {
      return; // Skip duplicate notification
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const subscription = await checkSubscription(vessel.id, token);
    if (!subscription || !subscription.is_active) return;

    if (subscription.alert_type !== 'all' && subscription.alert_type !== 'arrival') return;

    // Backend notification
    const response = await fetch(`${API_URL}/notifications/send/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vessel: vessel.id,
        type: 'arrival',
        message: `${vessel.name} arrived at ${port.name}`,
        data: {
          port: port.name,
          arrival_time: new Date().toISOString()
        }
      })
    });

    // Show progress bar toast on top-right
    if (response.ok) {
      toast.success(`${vessel.name} arrived at ${port.name}`, {
        position: 'top-right',
        duration: 3000,
        icon: '⚓',
        style: {
          background: '#ffffff',
          color: '#059669',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 3px 10px rgba(5, 150, 105, 0.12)',
          border: '1px solid #d1fae5',
          fontSize: '12px',
          fontWeight: '500',
        }
      });
    }
  } catch (error) {
    console.error('Error sending arrival notification:', error);
  }
};

/**
 * Send departure notification
 */
export const sendDepartureNotification = async (vessel, port) => {
  try {
    const notificationKey = `departure_${vessel.id}_${port.id}`;
    if (!shouldSendNotification(notificationKey)) {
      return; // Skip duplicate notification
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const subscription = await checkSubscription(vessel.id, token);
    if (!subscription || !subscription.is_active) return;

    if (subscription.alert_type !== 'all' && subscription.alert_type !== 'departure') return;

    // Backend notification
    const response = await fetch(`${API_URL}/notifications/send/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vessel: vessel.id,
        type: 'departure',
        message: `${vessel.name} departed from ${port.name}`,
        data: {
          port: port.name,
          departure_time: new Date().toISOString()
        }
      })
    });

    // Show progress bar toast on top-right
    if (response.ok) {
      toast.success(`${vessel.name} departed from ${port.name}`, {
        position: 'top-right',
        duration: 3000,
        icon: '🚢',
        style: {
          background: '#ffffff',
          color: '#059669',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 3px 10px rgba(5, 150, 105, 0.12)',
          border: '1px solid #d1fae5',
          fontSize: '12px',
          fontWeight: '500',
        }
      });
    }
  } catch (error) {
    console.error('Error sending departure notification:', error);
  }
};

/**
 * Send piracy zone alert
 * FIXED: Only send if piracy_alerts is explicitly true
 */
export const sendPiracyAlert = async (vessel, zone) => {
  try {
    const notificationKey = `piracy_${vessel.id}`;
    if (!shouldSendNotification(notificationKey)) {
      return; // Skip duplicate notification
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const subscription = await checkSubscription(vessel.id, token);
    if (!subscription || !subscription.is_active) return;

    // CRITICAL FIX: Check if piracy_alerts is explicitly enabled
    if (subscription.piracy_alerts !== true) return;

    // Backend notification
    const response = await fetch(`${API_URL}/notifications/send/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vessel: vessel.id,
        type: 'piracy_alert',
        message: `${vessel.name} entering piracy zone`,
        data: {
          zone_name: zone.name || 'High-Risk Area',
          risk_level: zone.risk_level || 'high',
          coordinates: {
            latitude: vessel.last_position_lat,
            longitude: vessel.last_position_lon
          }
        }
      })
    });

    // Show progress bar toast on top-right
    if (response.ok) {
      toast.error(`⚠️ ${vessel.name} entering piracy zone`, {
        position: 'top-right',
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 3px 10px rgba(220, 38, 38, 0.12)',
          border: '1px solid #fee2e2',
          fontSize: '12px',
          fontWeight: '500',
        }
      });
    }
  } catch (error) {
    console.error('Error sending piracy alert:', error);
  }
};

/**
 * Send weather alert
 * FIXED: Only send if weather_alerts is explicitly true
 */
export const sendWeatherAlert = async (vessel, weatherData) => {
  try {
    const notificationKey = `weather_${vessel.id}`;
    if (!shouldSendNotification(notificationKey)) {
      return; // Skip duplicate notification
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const subscription = await checkSubscription(vessel.id, token);
    if (!subscription || !subscription.is_active) return;

    // CRITICAL FIX: Check if weather_alerts is explicitly enabled
    if (subscription.weather_alerts !== true) return;

    // Backend notification
    const response = await fetch(`${API_URL}/notifications/send/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vessel: vessel.id,
        type: 'weather_alert',
        message: `${vessel.name} - ${weatherData.condition}`,
        data: {
          condition: weatherData.condition,
          severity: weatherData.severity,
          wind_speed: weatherData.wind_speed,
          wave_height: weatherData.wave_height,
          coordinates: {
            latitude: vessel.last_position_lat,
            longitude: vessel.last_position_lon
          }
        }
      })
    });

    // Show progress bar toast on top-right
    if (response.ok) {
      toast.error(`⛈️ ${vessel.name} - ${weatherData.condition}`, {
        position: 'top-right',
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 3px 10px rgba(220, 38, 38, 0.12)',
          border: '1px solid #fee2e2',
          fontSize: '12px',
          fontWeight: '500',
        }
      });
    }
  } catch (error) {
    console.error('Error sending weather alert:', error);
  }
};

/**
 * Send route warning for bad weather conditions
 * FIXED: Only send if weather_alerts is explicitly true
 */
export const sendRouteWeatherWarning = async (vessel, weatherInfo) => {
  try {
    const notificationKey = `route_weather_${vessel.id}`;
    if (!shouldSendNotification(notificationKey)) {
      return; // Skip duplicate notification
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const subscription = await checkSubscription(vessel.id, token);
    if (!subscription || !subscription.is_active) return;

    // CRITICAL FIX: Check if weather_alerts is explicitly enabled
    if (subscription.weather_alerts !== true) return;

    // Backend notification
    const response = await fetch(`${API_URL}/notifications/send/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vessel: vessel.id,
        type: 'route_weather_warning',
        message: `Weather warning on ${vessel.name} route`,
        data: weatherInfo
      })
    });

    // Show progress bar toast on top-right
    if (response.ok) {
      toast.error(`⛈️ Weather warning on ${vessel.name} route`, {
        position: 'top-right',
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 3px 10px rgba(220, 38, 38, 0.12)',
          border: '1px solid #fee2e2',
          fontSize: '12px',
          fontWeight: '500',
        }
      });
    }
  } catch (error) {
    console.error('Error sending route weather warning:', error);
  }
};

/**
 * Check if user has subscription for vessel
 */
const checkSubscription = async (vesselId, token) => {
  try {
    const response = await fetch(`${API_URL}/users/subscriptions/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    const results = Array.isArray(data) ? data : (data.results || []);
    return results.find(sub => sub.vessel === vesselId && sub.is_active);
  } catch (error) {
    console.error('Error checking subscription:', error);
    return null;
  }
};

export default {
  sendPositionUpdateNotification,
  sendArrivalNotification,
  sendDepartureNotification,
  sendPiracyAlert,
  sendWeatherAlert,
  sendRouteWeatherWarning
};