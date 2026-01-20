import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// Custom Icon for Replay
const historyIcon = new L.DivIcon({
  className: 'history-icon',
  html: `<div style="background: #0f172a; color: white; padding: 5px; border-radius: 50%; border: 2px solid #fff; font-size: 10px;">🚢</div>`,
  iconSize: [25, 25]
});

const VoyageReplay = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [replaySpeed, setReplaySpeed] = useState(500); // ms

  // Mock History Data (Route from Singapore toward Malacca)
  const voyageData = {
    vesselName: "Maersk Sovereign",
    imo: "9356123",
    history: [
      { lat: 1.28, lng: 103.77, timestamp: "2026-01-18 10:00", speed: "12kn", zone: "Port" },
      { lat: 1.25, lng: 103.70, timestamp: "2026-01-18 11:00", speed: "18kn", zone: "EEZ" },
      { lat: 1.22, lng: 103.60, timestamp: "2026-01-18 12:00", speed: "22kn", zone: "High Seas" },
      { lat: 1.18, lng: 103.50, timestamp: "2026-01-18 13:00", speed: "21kn", zone: "High Seas" },
      { lat: 1.15, lng: 103.40, timestamp: "2026-01-18 14:00", speed: "19kn", zone: "Sanctioned Area" }, // Violation point
      { lat: 1.12, lng: 103.30, timestamp: "2026-01-18 15:00", speed: "15kn", zone: "Safe" },
    ]
  };

  // Replay Logic
  useEffect(() => {
    let timer;
    if (isPlaying && currentIndex < voyageData.history.length - 1) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => prev + 1);
      }, replaySpeed);
    } else {
      setIsPlaying(false);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentIndex, replaySpeed]);

  const currentPos = voyageData.history[currentIndex];
  
  // Compliance Logic: Check if vessel is in "Sanctioned Area"
  const isViolating = currentPos.zone === "Sanctioned Area";

  const styles = {
    panel: { position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', width: '600px', background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '15px' },
    auditCard: { position: 'absolute', top: '20px', right: '20px', width: '280px', background: '#fff', padding: '20px', borderRadius: '12px', zIndex: 1000, borderLeft: isViolating ? '5px solid #ef4444' : '5px solid #10b981' }
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      
      {/* 1. Map View */}
      <MapContainer center={[1.2, 103.5]} zoom={10} style={{ height: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Full Path Trace */}
        <Polyline positions={voyageData.history.map(h => [h.lat, h.lng])} color="#64748b" weight={2} dashArray="5, 10" />
        
        {/* Moving Vessel Icon */}
        <Marker position={[currentPos.lat, currentPos.lng]} icon={historyIcon}>
          <Popup>Timestamp: {currentPos.timestamp}</Popup>
        </Marker>

        {/* Visual Sanction Zone */}
        <Circle center={[1.15, 103.40]} radius={5000} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1 }} />
      </MapContainer>

      {/* 2. Audit Compliance Card */}
      <div style={styles.auditCard}>
        <h4 style={{ margin: '0 0 10px 0' }}>Compliance Audit</h4>
        <div style={{ fontSize: '13px' }}>
          <p><b>Vessel:</b> {voyageData.vesselName}</p>
          <p><b>Zone:</b> {currentPos.zone}</p>
          <p><b>Speed:</b> {currentPos.speed}</p>
          <hr />
          <p style={{ color: isViolating ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
            {isViolating ? "⚠️ VOID: Unauthorized Zone Entry" : "✅ STATUS: Compliant"}
          </p>
        </div>
      </div>

      {/* 3. Replay Control Panel */}
      <div style={styles.panel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setIsPlaying(!isPlaying)} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
            {isPlaying ? "⏸ Pause" : "▶ Play Voyage"}
          </button>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Time: {currentPos.timestamp}</div>
          <button onClick={() => {setCurrentIndex(0); setIsPlaying(false)}} style={{ background: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '8px' }}>🔄 Reset</button>
        </div>
        
        <input 
          type="range" 
          min="0" 
          max={voyageData.history.length - 1} 
          value={currentIndex} 
          onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
          <span>Departure</span>
          <span>In Progress</span>
          <span>Arrival</span>
        </div>
      </div>
    </div>
  );
};

export default VoyageReplay;