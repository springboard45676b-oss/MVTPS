import React from 'react';
import { FaExclamationTriangle, FaWind, FaSkullCrossbones, FaAnchor } from 'react-icons/fa';

// Mock NOAA & Safety Data
const alerts = [
  { id: 1, type: 'weather', title: 'Cyclone Warning', location: 'Pacific Ocean (12.4N, 130E)', severity: 'high', icon: <FaWind /> },
  { id: 2, type: 'piracy', title: 'Piracy Activity', location: 'Gulf of Aden', severity: 'critical', icon: <FaSkullCrossbones /> },
  { id: 3, type: 'port', title: 'Port Strike', location: 'Felixstowe', severity: 'medium', icon: <FaAnchor /> },
];

const SafetyWidgets = () => {
  return (
    <div style={{ padding: "15px", background: "#fff5f5", borderRadius: "10px", border: "1px solid #feb2b2" }}>
      <h4 style={{ color: "#c53030", margin: "0 0 15px 0", display: "flex", alignItems: "center", gap: "10px" }}>
        <FaExclamationTriangle /> Active Safety Alerts
      </h4>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {alerts.map(alert => (
          <div key={alert.id} style={{ 
            display: "flex", alignItems: "center", gap: "15px", 
            background: "white", padding: "12px", borderRadius: "8px", 
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            borderLeft: `4px solid ${alert.severity === 'critical' ? '#e74c3c' : '#f1c40f'}`
          }}>
            <span style={{ color: "#555", fontSize: "1.2rem" }}>{alert.icon}</span>
            <div style={{flex: 1}}>
              <div style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#2d3748" }}>{alert.title}</div>
              <div style={{ fontSize: "0.8rem", color: "#718096" }}>{alert.location}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SafetyWidgets;