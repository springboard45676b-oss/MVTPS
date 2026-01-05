// src/components/NOAASafetyOverlay.jsx
/**
 * NOAA Safety Overlay - Clean & Professional Edition
 * 
 * DATA SOURCES:
 * =============
 * 
 * 1. PIRACY ZONES ✅
 *    - Source: Your Backend Database
 *    - Endpoint: /api/piracy-zones/
 *    - Fields: name, latitude, longitude, risk_level, incidents_90_days, radius_km, last_incident_date
 *    - Data: Stored in your PiracyZone model
 * 
 * 2. WEATHER/STORMS 🌪️
 *    - Source: NOAA (National Oceanic and Atmospheric Administration) - US Government
 *    - API: https://api.weather.gov/alerts/active
 *    - Real-time weather alerts for maritime areas
 *    - Free public API (no API key required)
 *    - Data includes: severity, event type, affected areas, expiration time
 * 
 * 3. ACCIDENTS/INCIDENTS ❌
 *    - Status: NOT CURRENTLY IMPLEMENTED
 *    - To implement: You would need to:
 *      a) Create an Incident/Accident model in your database
 *      b) Add an API endpoint like /api/incidents/
 *      c) Store historical accident data (date, location, type, casualties, etc.)
 *      d) Add visualization similar to piracy zones
 * 
 * Design principles:
 * - Zones highlighted with colored overlays (NO markers that look like vessels/ports)
 * - Compact, essential-info-only popups
 * - Clear visual distinction from vessel and port markers
 * - Smart notifications without overwhelming UI
 */

import React, { useState, useEffect } from 'react';
import { Circle, Popup } from 'react-leaflet';
import toast from 'react-hot-toast';

const NOAASafetyOverlay = ({ selectedVessel, ports }) => {
  const [noaaAlerts, setNoaaAlerts] = useState([]);
  const [piracyZones, setPiracyZones] = useState([]);
  const [notificationsSent, setNotificationsSent] = useState(new Set());

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
  const NOAA_API_URL = 'https://api.weather.gov';

  // ===== CALCULATE DISTANCE =====
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // ===== FETCH SAFETY DATA =====
  const fetchSafetyData = async (lat, lon) => {
    try {
      // Fetch NOAA Alerts
      const alertsRes = await fetch(
        `${NOAA_API_URL}/alerts/active?point=${lat},${lon}`,
        { headers: { 'User-Agent': '(MVTPS-VesselTracking, safety-monitoring)' } }
      );

      if (alertsRes.ok) {
        const data = await alertsRes.json();
        const alerts = data.features || [];
        setNoaaAlerts(alerts);

        alerts.forEach((alert) => {
          const notifKey = `alert-${alert.id}`;
          if (!notificationsSent.has(notifKey)) {
            const severity = alert.properties.severity;
            if (severity === 'Severe' || severity === 'Extreme') {
              notifyWeatherAlert(alert);
              setNotificationsSent((prev) => new Set([...prev, notifKey]));
            }
          }
        });
      }

      // Fetch Piracy Zones
      const token = localStorage.getItem('access_token');
      const piracyRes = await fetch(`${API_URL}/piracy-zones/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (piracyRes.ok) {
        const data = await piracyRes.json();
        const zones = data.results || data;
        setPiracyZones(zones);

        zones.forEach((zone) => {
          const distance = calculateDistance(lat, lon, zone.latitude, zone.longitude);
          const notifKey = `piracy-${zone.id}`;
          if (distance < zone.radius_km && !notificationsSent.has(notifKey)) {
            notifyPiracyRisk(zone);
            setNotificationsSent((prev) => new Set([...prev, notifKey]));
          }
        });
      }
    } catch (error) {
      console.error('Error fetching safety data:', error);
    }
  };

  // ===== NOTIFICATIONS =====
  const notifyWeatherAlert = (alert) => {
    toast(
      `🌪️ ${alert.properties.event} - ${alert.properties.severity}`,
      {
        duration: 6000,
        position: 'top-right',
        style: {
          background: '#7f1d1d',
          color: '#fef2f2',
          fontWeight: 600,
          padding: '14px 18px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }
      }
    );
  };

  const notifyPiracyRisk = (zone) => {
    toast(
      `🏴‍☠️ Entering ${zone.name} - ${zone.risk_level.toUpperCase()} risk`,
      {
        duration: 8000,
        position: 'top-right',
        style: {
          background: '#450a0a',
          color: '#fef2f2',
          fontWeight: 600,
          padding: '14px 18px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
        }
      }
    );
  };

  // ===== FETCH ON VESSEL CHANGE =====
  useEffect(() => {
    if (selectedVessel?.last_position_lat && selectedVessel?.last_position_lon) {
      setNotificationsSent(new Set());
      fetchSafetyData(selectedVessel.last_position_lat, selectedVessel.last_position_lon);
    }
  }, [selectedVessel?.id]);

  // ===== ZONE STYLES =====
  const getWeatherZoneStyle = (severity) => {
    const styles = {
      Extreme: { color: '#991b1b', fillColor: '#7f1d1d', fillOpacity: 0.25, weight: 3, dashArray: '10,10' },
      Severe: { color: '#ea580c', fillColor: '#c2410c', fillOpacity: 0.2, weight: 2.5, dashArray: '8,8' },
      Moderate: { color: '#f59e0b', fillColor: '#d97706', fillOpacity: 0.15, weight: 2, dashArray: '6,6' },
      Minor: { color: '#3b82f6', fillColor: '#2563eb', fillOpacity: 0.12, weight: 1.5, dashArray: '4,4' }
    };
    return styles[severity] || styles.Minor;
  };

  const getPiracyZoneStyle = (riskLevel) => {
    const styles = {
      critical: { color: '#7f1d1d', fillColor: '#450a0a', fillOpacity: 0.3, weight: 3, dashArray: '15,5' },
      high: { color: '#991b1b', fillColor: '#7f1d1d', fillOpacity: 0.25, weight: 2.5, dashArray: '12,5' },
      moderate: { color: '#ea580c', fillColor: '#c2410c', fillOpacity: 0.2, weight: 2, dashArray: '10,5' },
      low: { color: '#f59e0b', fillColor: '#d97706', fillOpacity: 0.15, weight: 1.5, dashArray: '8,5' }
    };
    return styles[riskLevel] || styles.low;
  };

  return (
    <>
      {/* ===== WEATHER ALERT ZONES (Highlighted areas only) ===== */}
      {noaaAlerts.map((alert) => {
        try {
          const coordinates = alert.geometry.coordinates[0];
          const centerLat = coordinates.reduce((sum, c) => sum + c[1], 0) / coordinates.length;
          const centerLon = coordinates.reduce((sum, c) => sum + c[0], 0) / coordinates.length;
          const style = getWeatherZoneStyle(alert.properties.severity);

          return (
            <Circle
              key={alert.id}
              center={[centerLat, centerLon]}
              radius={100000}
              pathOptions={style}
            >
              <Popup>
                <div className="w-64 text-sm">
                  <div className="font-bold text-lg mb-3 text-orange-600">{alert.properties.event}</div>
                  <div className="space-y-2 text-slate-700">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold">Area:</span>
                      <span className="text-right">{alert.properties.areaDesc}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold">Severity:</span>
                      <span className={`font-bold ${
                        alert.properties.severity === 'Extreme' ? 'text-red-700' :
                        alert.properties.severity === 'Severe' ? 'text-orange-700' :
                        'text-yellow-700'
                      }`}>{alert.properties.severity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Expires:</span>
                      <span className="text-right text-xs">{new Date(alert.properties.expires).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Circle>
          );
        } catch (error) {
          return null;
        }
      })}

      {/* ===== PIRACY ZONES (Highlighted areas only) ===== */}
      {piracyZones.map((zone) => {
        const style = getPiracyZoneStyle(zone.risk_level);

        return (
          <Circle
            key={`piracy-${zone.id}`}
            center={[zone.latitude, zone.longitude]}
            radius={(zone.radius_km || 200) * 1000}
            pathOptions={style}
          >
            <Popup>
              <div className="w-72 text-sm">
                {/* Title with Risk Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold text-lg text-red-900">{zone.name}</div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    zone.risk_level === 'critical' ? 'bg-red-900 text-white' :
                    zone.risk_level === 'high' ? 'bg-red-700 text-white' :
                    zone.risk_level === 'moderate' ? 'bg-orange-600 text-white' :
                    'bg-yellow-600 text-white'
                  }`}>
                    {zone.risk_level.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 text-slate-700">
                  {/* Piracy Statistics */}
                  <div className="bg-red-50 p-2 rounded border border-red-200">
                    <div className="text-xs font-bold text-red-900 mb-2">🏴‍☠️ PIRACY INCIDENTS</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center">
                        <div className="text-xl font-bold text-red-900">{zone.incidents_90_days}</div>
                        <div className="text-xs text-red-700">Last 90 Days</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-red-900">{zone.radius_km}</div>
                        <div className="text-xs text-red-700">Radius (km)</div>
                      </div>
                    </div>
                  </div>

                  {/* Accident History */}
                  {zone.total_accidents > 0 && (
                    <div className="bg-orange-50 p-2 rounded border border-orange-200">
                      <div className="text-xs font-bold text-orange-900 mb-2">💥 ACCIDENT HISTORY</div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-900">{zone.total_accidents}</div>
                          <div className="text-xs text-orange-700">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-900">{zone.casualties || 0}</div>
                          <div className="text-xs text-orange-700">Casualties</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-900">{zone.vessels_lost || 0}</div>
                          <div className="text-xs text-orange-700">Vessels Lost</div>
                        </div>
                      </div>
                      {zone.last_accident_date && (
                        <div className="text-xs text-orange-800">
                          <strong>Last:</strong> {new Date(zone.last_accident_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Last Incident */}
                  {zone.last_incident_date && (
                    <div className="flex justify-between border-b pb-2 text-xs">
                      <span className="font-semibold">Last Piracy Incident:</span>
                      <span>{new Date(zone.last_incident_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="bg-green-50 p-2 rounded border border-green-200">
                    <div className="font-semibold text-green-900 mb-1 text-xs">⚓ SAFETY MEASURES</div>
                    <div className="text-xs text-green-800 space-y-1">
                      <div>• Travel in convoy (2+ vessels)</div>
                      <div>• Enhanced 24/7 surveillance</div>
                      <div>• Report to authorities</div>
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </Circle>
        );
      })}
    </>
  );
};

export default NOAASafetyOverlay;