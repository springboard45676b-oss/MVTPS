// src/pages/liveTracking/components/SafetyOverlay.jsx
/**
 * Professional Safety Overlay - Clean Icons & Subtle Animations
 * NO EXPIRY DATE - Weather alerts, piracy zones, accident history
 */

import React, { useState, useEffect } from 'react';
import { Circle, Popup, Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';

const SafetyOverlay = ({ selectedVessel, ports }) => {
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [piracyZones, setPiracyZones] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    fetchSafetyData();
    const interval = setInterval(fetchSafetyData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchSafetyData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      const [weatherRes, piracyRes] = await Promise.all([
        fetch(`${API_URL}/weather-alerts/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/piracy-zones/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (weatherRes.ok) {
        const data = await weatherRes.json();
        setWeatherAlerts(data.results || data);
      }
      
      if (piracyRes.ok) {
        const data = await piracyRes.json();
        setPiracyZones(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching safety data:', error);
    }
  };

  const createWeatherIcon = (alert) => {
    const { severity, weather_type } = alert;
    
    const config = {
      extreme: { size: 32, color: '#dc2626', bgColor: '#fef2f2', borderColor: '#dc2626', shadow: '0 2px 8px rgba(220, 38, 38, 0.3)' },
      severe: { size: 28, color: '#ea580c', bgColor: '#fff7ed', borderColor: '#ea580c', shadow: '0 2px 6px rgba(234, 88, 12, 0.3)' },
      moderate: { size: 26, color: '#f59e0b', bgColor: '#fffbeb', borderColor: '#f59e0b', shadow: '0 2px 4px rgba(245, 158, 11, 0.25)' },
      minor: { size: 24, color: '#3b82f6', bgColor: '#eff6ff', borderColor: '#3b82f6', shadow: '0 2px 4px rgba(59, 130, 246, 0.25)' }
    }[severity] || { size: 24, color: '#3b82f6', bgColor: '#eff6ff', borderColor: '#3b82f6', shadow: '0 2px 4px rgba(59, 130, 246, 0.25)' };
    
    const icons = {
      hurricane: `<svg viewBox="0 0 24 24" fill="none" stroke="${config.color}" stroke-width="2"><path d="M12 2C12 2 8 6 8 10C8 12 9 14 11 15C11 15 10 16 8 16C6 16 4 14 2 12C2 12 6 16 10 16C12 16 14 15 15 13C15 13 16 14 16 16C16 18 14 20 12 22C12 22 16 18 16 14C16 12 15 10 13 9C13 9 14 8 16 8C18 8 20 10 22 12C22 12 18 8 14 8C12 8 10 9 9 11C9 11 8 10 8 8C8 6 10 4 12 2Z"/></svg>`,
      typhoon: `<svg viewBox="0 0 24 24" fill="none" stroke="${config.color}" stroke-width="2"><path d="M12 2C12 2 8 6 8 10C8 12 9 14 11 15C11 15 10 16 8 16C6 16 4 14 2 12C2 12 6 16 10 16C12 16 14 15 15 13C15 13 16 14 16 16C16 18 14 20 12 22C12 22 16 18 16 14C16 12 15 10 13 9C13 9 14 8 16 8C18 8 20 10 22 12C22 12 18 8 14 8C12 8 10 9 9 11C9 11 8 10 8 8C8 6 10 4 12 2Z"/></svg>`,
      cyclone: `<svg viewBox="0 0 24 24" fill="none" stroke="${config.color}" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3 L12 8 M12 16 L12 21 M3 12 L8 12 M16 12 L21 12"/><circle cx="12" cy="12" r="2" fill="${config.color}"/></svg>`,
      tropical_storm: `<svg viewBox="0 0 24 24" fill="none" stroke="${config.color}" stroke-width="2"><path d="M14 3 L12 8 L18 6 L12 13 L14 21 L8 18 L12 13 Z"/></svg>`,
      thunderstorm: `<svg viewBox="0 0 24 24" fill="none" stroke="${config.color}" stroke-width="2"><path d="M13 2 L3 14 H11 L9 22 L19 10 H11 L13 2 Z" fill="${config.color}"/></svg>`,
      fog: `<svg viewBox="0 0 24 24" fill="none" stroke="${config.color}" stroke-width="2"><line x1="4" y1="8" x2="20" y2="8"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="4" y1="16" x2="20" y2="16"/></svg>`,
      high_winds: `<svg viewBox="0 0 24 24" fill="none" stroke="${config.color}" stroke-width="2"><path d="M2 8 H12 C14 8 16 6 16 4 C16 2 14 2 14 2"/><path d="M2 12 H18 C20 12 22 14 22 16 C22 18 20 18 20 18"/><path d="M2 16 H14 C16 16 18 18 18 20 C18 22 16 22 16 22"/></svg>`,
      rough_seas: `<svg viewBox="0 0 24 24" fill="none" stroke="${config.color}" stroke-width="2"><path d="M2 12 Q5 8 8 12 T14 12 T20 12 T24 12"/><path d="M2 16 Q5 12 8 16 T14 16 T20 16 T24 16"/></svg>`,
      ice: `<svg viewBox="0 0 24 24" fill="none" stroke="${config.color}" stroke-width="2"><path d="M12 2 L12 22 M6 6 L18 18 M6 18 L18 6"/><circle cx="12" cy="12" r="3"/></svg>`
    };
    
    return divIcon({
      html: `<div class="safety-marker ${severity === 'extreme' ? 'weather-pulse' : ''}" style="width:${config.size}px;height:${config.size}px;background:${config.bgColor};border:2px solid ${config.borderColor};border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:${config.shadow}"><div style="width:${config.size*0.6}px;height:${config.size*0.6}px">${icons[weather_type] || icons.tropical_storm}</div></div>`,
      className: '',
      iconSize: [config.size, config.size],
      iconAnchor: [config.size/2, config.size/2],
      popupAnchor: [0, -config.size/2-5]
    });
  };

  const createPiracyIcon = (zone) => {
    const { risk_level, incidents_90_days } = zone;
    
    const config = {
      critical: { size: 32, color: '#7f1d1d', bgColor: '#fef2f2', borderColor: '#7f1d1d', shadow: '0 2px 8px rgba(127, 29, 29, 0.3)' },
      high: { size: 28, color: '#991b1b', bgColor: '#fef2f2', borderColor: '#991b1b', shadow: '0 2px 6px rgba(153, 27, 27, 0.3)' },
      moderate: { size: 26, color: '#ea580c', bgColor: '#fff7ed', borderColor: '#ea580c', shadow: '0 2px 4px rgba(234, 88, 12, 0.25)' },
      low: { size: 24, color: '#f59e0b', bgColor: '#fffbeb', borderColor: '#f59e0b', shadow: '0 2px 4px rgba(245, 158, 11, 0.25)' }
    }[risk_level] || { size: 24, color: '#f59e0b', bgColor: '#fffbeb', borderColor: '#f59e0b', shadow: '0 2px 4px rgba(245, 158, 11, 0.25)' };
    
    return divIcon({
      html: `<div class="safety-marker ${risk_level === 'critical' ? 'piracy-pulse' : ''}" style="width:${config.size}px;height:${config.size}px;background:${config.bgColor};border:2px solid ${config.borderColor};border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:${config.shadow};position:relative"><div style="width:${config.size*0.55}px;height:${config.size*0.55}px"><svg viewBox="0 0 24 24" fill="${config.color}"><path d="M12 2C6.48 2 2 6.48 2 12c0 2.21.72 4.25 1.94 5.9L6 14.5c.55-.83 1.5-1.4 2.55-1.4.55 0 1.05.17 1.45.45.4-.28.9-.45 1.45-.45s1.05.17 1.45.45c.4-.28.9-.45 1.45-.45 1.05 0 2 .57 2.55 1.4l2.06 3.4C20.28 16.25 21 14.21 21 12c0-5.52-4.48-10-10-10zm-3.5 11c-.83 0-1.5-.67-1.5-1.5S7.67 10 8.5 10s1.5.67 1.5 1.5S9.33 13 8.5 13zm7 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/><path d="M12 17c-1.1 0-2 .45-2 1v3h4v-3c0-.55-.9-1-2-1z"/></svg></div>${incidents_90_days > 0 ? `<div style="position:absolute;top:-4px;right:-4px;background:${config.color};color:white;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;padding:0 4px;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.2)">${incidents_90_days}</div>` : ''}</div>`,
      className: '',
      iconSize: [config.size, config.size],
      iconAnchor: [config.size/2, config.size/2],
      popupAnchor: [0, -config.size/2-5]
    });
  };

  const getWeatherZoneStyle = (severity) => ({
    extreme: { color: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.08, weight: 2, dashArray: '8,4' },
    severe: { color: '#ea580c', fillColor: '#ea580c', fillOpacity: 0.06, weight: 1.5, dashArray: '6,3' },
    moderate: { color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.05, weight: 1.5, dashArray: '5,3' },
    minor: { color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.04, weight: 1, dashArray: '4,2' }
  }[severity] || { color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.04, weight: 1, dashArray: '4,2' });

  const getPiracyZoneStyle = (riskLevel) => ({
    critical: { color: '#7f1d1d', fillColor: '#7f1d1d', fillOpacity: 0.1, weight: 2, dashArray: '10,5' },
    high: { color: '#991b1b', fillColor: '#991b1b', fillOpacity: 0.08, weight: 1.5, dashArray: '8,4' },
    moderate: { color: '#ea580c', fillColor: '#ea580c', fillOpacity: 0.06, weight: 1.5, dashArray: '6,3' },
    low: { color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.05, weight: 1, dashArray: '5,3' }
  }[riskLevel] || { color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.05, weight: 1, dashArray: '5,3' });

  return (
    <>
      <style>{`
        .safety-marker{cursor:pointer;transition:transform 0.2s ease}
        .safety-marker:hover{transform:scale(1.1);z-index:1000!important}
        @keyframes subtle-pulse{0%,100%{box-shadow:0 2px 8px rgba(220,38,38,0.3);transform:scale(1)}50%{box-shadow:0 4px 16px rgba(220,38,38,0.5);transform:scale(1.05)}}
        .weather-pulse,.piracy-pulse{animation:subtle-pulse 2.5s ease-in-out infinite}
      `}</style>

      {weatherAlerts.map((alert) => (
        <React.Fragment key={`weather-${alert.id}`}>
          <Circle center={[alert.latitude, alert.longitude]} radius={alert.radius_km * 1000} pathOptions={getWeatherZoneStyle(alert.severity)} />
          <Marker position={[alert.latitude, alert.longitude]} icon={createWeatherIcon(alert)}>
            <Popup maxWidth={300}>
              <div style={{fontFamily:'system-ui,sans-serif',padding:'4px'}}>
                <div style={{fontSize:'16px',fontWeight:600,color:'#111827',marginBottom:'8px',paddingBottom:'8px',borderBottom:'2px solid #e5e7eb'}}>{alert.name}</div>
                <div style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'4px 10px',borderRadius:'6px',fontSize:'11px',fontWeight:600,marginBottom:'10px',background:alert.severity==='extreme'?'#fef2f2':alert.severity==='severe'?'#fff7ed':alert.severity==='moderate'?'#fffbeb':'#eff6ff',color:alert.severity==='extreme'?'#dc2626':alert.severity==='severe'?'#ea580c':alert.severity==='moderate'?'#f59e0b':'#3b82f6'}}>
                  <span style={{fontSize:'14px'}}>⚠️</span>
                  <span>{alert.severity.toUpperCase()} - {alert.weather_type_display}</span>
                </div>
                {(alert.wind_speed_kmh || alert.wave_height_m || alert.visibility_km) && (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(70px,1fr))',gap:'8px',marginBottom:'10px',padding:'10px',background:'#f9fafb',borderRadius:'6px'}}>
                    {alert.wind_speed_kmh && <div style={{textAlign:'center'}}><div style={{fontSize:'18px',fontWeight:700,color:'#374151'}}>{alert.wind_speed_kmh}</div><div style={{fontSize:'10px',color:'#6b7280',fontWeight:500}}>Wind km/h</div></div>}
                    {alert.wave_height_m && <div style={{textAlign:'center'}}><div style={{fontSize:'18px',fontWeight:700,color:'#374151'}}>{alert.wave_height_m}m</div><div style={{fontSize:'10px',color:'#6b7280',fontWeight:500}}>Waves</div></div>}
                    {alert.visibility_km && <div style={{textAlign:'center'}}><div style={{fontSize:'18px',fontWeight:700,color:'#374151'}}>{alert.visibility_km}</div><div style={{fontSize:'10px',color:'#6b7280',fontWeight:500}}>Visibility km</div></div>}
                  </div>
                )}
                {alert.description && <div style={{fontSize:'12px',color:'#4b5563',lineHeight:1.5}}>{alert.description}</div>}
              </div>
            </Popup>
          </Marker>
        </React.Fragment>
      ))}

      {piracyZones.map((zone) => (
        <React.Fragment key={`piracy-${zone.id}`}>
          <Circle center={[zone.latitude, zone.longitude]} radius={(zone.radius_km || 200) * 1000} pathOptions={getPiracyZoneStyle(zone.risk_level)} />
          <Marker position={[zone.latitude, zone.longitude]} icon={createPiracyIcon(zone)}>
            <Popup maxWidth={300}>
              <div style={{fontFamily:'system-ui,sans-serif',padding:'4px'}}>
                <div style={{fontSize:'16px',fontWeight:600,color:'#7f1d1d',marginBottom:'8px',paddingBottom:'8px',borderBottom:'2px solid #fecaca'}}>{zone.name}</div>
                <div style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'4px 10px',borderRadius:'6px',fontSize:'11px',fontWeight:600,marginBottom:'10px',background:'#fef2f2',color:zone.risk_level==='critical'?'#7f1d1d':zone.risk_level==='high'?'#991b1b':zone.risk_level==='moderate'?'#ea580c':'#f59e0b'}}>
                  <span style={{fontSize:'14px'}}>⚠️</span>
                  <span>{zone.risk_level.toUpperCase()} RISK</span>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px',marginBottom:'10px',padding:'10px',background:'#fef2f2',borderRadius:'6px',border:'1px solid #fecaca'}}>
                  <div style={{textAlign:'center'}}><div style={{fontSize:'20px',fontWeight:700,color:'#7f1d1d'}}>{zone.incidents_90_days}</div><div style={{fontSize:'10px',color:'#991b1b',fontWeight:500}}>Incidents (90d)</div></div>
                  <div style={{textAlign:'center'}}><div style={{fontSize:'20px',fontWeight:700,color:'#7f1d1d'}}>{zone.radius_km}km</div><div style={{fontSize:'10px',color:'#991b1b',fontWeight:500}}>Zone Radius</div></div>
                </div>
                {zone.total_accidents > 0 && (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px',marginBottom:'10px',padding:'8px',background:'#fff7ed',borderRadius:'6px',border:'1px solid #fed7aa'}}>
                    <div style={{textAlign:'center'}}><div style={{fontSize:'16px',fontWeight:700,color:'#9a3412'}}>{zone.total_accidents}</div><div style={{fontSize:'9px',color:'#c2410c',fontWeight:500}}>Accidents</div></div>
                    <div style={{textAlign:'center'}}><div style={{fontSize:'16px',fontWeight:700,color:'#9a3412'}}>{zone.casualties||0}</div><div style={{fontSize:'9px',color:'#c2410c',fontWeight:500}}>Casualties</div></div>
                    <div style={{textAlign:'center'}}><div style={{fontSize:'16px',fontWeight:700,color:'#9a3412'}}>{zone.vessels_lost||0}</div><div style={{fontSize:'9px',color:'#c2410c',fontWeight:500}}>Vessels Lost</div></div>
                  </div>
                )}
                {zone.description && <div style={{fontSize:'12px',color:'#4b5563',lineHeight:1.5,marginBottom:'8px'}}>{zone.description}</div>}
                <div style={{fontSize:'11px',color:'#166534',padding:'8px',background:'#f0fdf4',borderRadius:'6px',border:'1px solid #bbf7d0',lineHeight:1.6}}><strong>Safety:</strong> Travel in convoy • 24/7 surveillance • Report to authorities</div>
              </div>
            </Popup>
          </Marker>
        </React.Fragment>
      ))}
    </>
  );
};

export default SafetyOverlay;