import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Component to handle "Fly-to" vessel location
function MapFocus({ center }) {
  const map = useMap();
  if (center) map.flyTo(center, 8, { duration: 2 });
  return null;
}

const LiveMap = () => {
  const [mapMode, setMapMode] = useState('light');
  const [focusCoord, setFocusCoord] = useState(null);
  const [showBoundaries, setShowBoundaries] = useState(false);
  
  // 13 Vessels with simulated AIS data
  const vessels = [
    { id: 1, name: "Maersk Sovereign", lat: 1.25, lng: 103.8, heading: 45, type: "Container", eta: "2h 15m", status: "Underway" },
    { id: 2, name: "Ever Given II", lat: 29.9, lng: 32.5, heading: 180, type: "Cargo", eta: "Docking", status: "Slow Speed" },
    { id: 3, name: "Nordic Tanker", lat: 51.5, lng: 3.5, heading: 270, type: "Tanker", eta: "1d 4h", status: "Underway" },
    { id: 4, name: "Arctic Pearl", lat: 64.1, lng: -21.9, heading: 90, type: "Container", eta: "4h 20m", status: "Underway" },
    { id: 5, name: "Pacific Wave", lat: 33.7, lng: -118.2, heading: 120, type: "Cargo", eta: "At Anchor", status: "Stationary" },
    { id: 6, name: "Swarna Kamal", lat: 18.9, lng: 72.8, heading: 30, type: "Tanker", eta: "10h 05m", status: "Underway" },
    { id: 7, name: "Baltic Spirit", lat: 59.3, lng: 18.1, heading: 210, type: "Cargo", eta: "Arrived", status: "Moored" },
    { id: 8, name: "Oceanic 101", lat: -33.8, lng: 151.2, heading: 0, type: "Container", eta: "2d 1h", status: "Underway" },
    { id: 9, name: "Red Sea Titan", lat: 21.4, lng: 39.1, heading: 340, type: "Tanker", eta: "6h 45m", status: "Underway" },
    { id: 10, name: "Gulf Express", lat: 25.2, lng: 55.3, heading: 15, type: "Cargo", eta: "12h 30m", status: "Underway" },
    { id: 11, name: "Tokyo Maru", lat: 35.6, lng: 139.8, heading: 280, type: "Container", eta: "Arrived", status: "Moored" },
    { id: 12, name: "Cape Town Star", lat: -33.9, lng: 18.4, heading: 160, type: "Tanker", eta: "3d 12h", status: "Underway" },
    { id: 13, name: "Santos Carrier", lat: -23.9, lng: -46.3, heading: 45, type: "Cargo", eta: "5h 15m", status: "Underway" }
  ];

  const tileURL = mapMode === 'light' 
    ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <div style={{ display: 'flex', height: '100%', background: '#fff' }}>
      {/* Search & Fleet Sidebar */}
      <div style={{ width: '320px', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', background: '#f8fafc' }}>
          <h3 style={{ margin: 0 }}>Live AIS Feed</h3>
          <input 
            placeholder="Search Vessel Name..." 
            style={{ width: '100%', padding: '10px', marginTop: '15px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {vessels.map(v => (
            <div 
              key={v.id} 
              onClick={() => setFocusCoord([v.lat, v.lng])}
              style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', borderRadius: '8px' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f0f9ff'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>{v.name}</span>
                <span style={{ fontSize: '10px', color: v.status === 'Underway' ? '#10b981' : '#f59e0b' }}>● {v.status}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>ETA: {v.eta} | {v.type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Control Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Floating Toggle Controls */}
        <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000, display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setShowBoundaries(!showBoundaries)}
            style={{ padding: '10px 15px', borderRadius: '8px', background: '#fff', border: '1px solid #ddd', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {showBoundaries ? '🌐 Hide EEZ' : '🌐 Show EEZ'}
          </button>
          <button 
            onClick={() => setMapMode(mapMode === 'light' ? 'dark' : 'light')}
            style={{ padding: '10px 15px', borderRadius: '8px', background: mapMode === 'dark' ? '#334155' : '#fff', color: mapMode === 'dark' ? '#fff' : '#334155', border: '1px solid #ddd', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {mapMode === 'light' ? '🌙 Night Mode' : '☀️ Day Mode'}
          </button>
        </div>

        <MapContainer center={[20, 0]} zoom={3} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <MapFocus center={focusCoord} />
          <TileLayer url={tileURL} />

          {/* Exclusive Economic Zone (EEZ) / Territorial Waters simulation */}
          {showBoundaries && (
            <Circle center={[1.25, 103.8]} radius={222240} pathOptions={{ color: '#0ea5e9', weight: 1, dashArray: '10, 10', fillOpacity: 0.05 }} />
          )}

          {vessels.map(v => (
            <Marker 
              key={v.id} 
              position={[v.lat, v.lng]}
              icon={new L.DivIcon({
                className: 'custom-vessel',
                html: `<div style="transform: rotate(${v.heading}deg); font-size: 20px;">🚢</div>`,
                iconSize: [25, 25]
              })}
            >
              <Popup>
                <div style={{ minWidth: '180px' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#1e3a8a' }}>{v.name}</h4>
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Status:</span> <b>{v.status}</b></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>ETA Port:</span> <b>{v.eta}</b></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Heading:</span> <b>{v.heading}°</b></div>
                  </div>
                  <button style={{ width: '100%', marginTop: '10px', padding: '8px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Full Vessel Log
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveMap;