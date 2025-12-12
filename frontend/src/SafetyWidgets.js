import React from 'react';
import { FaExclamationTriangle, FaWind, FaSkullCrossbones } from 'react-icons/fa';

const alerts = [
  { id: 1, type: 'storm', title: 'Cyclone Warning', location: 'Pacific Ocean', icon: <FaWind /> },
  { id: 2, type: 'piracy', title: 'Piracy Risk', location: 'Gulf of Aden', icon: <FaSkullCrossbones /> },
  { id: 3, type: 'congestion', title: 'High Congestion', location: 'Port of Shanghai', icon: <FaExclamationTriangle /> },
];

const SafetyWidgets = () => {
  return (
    <div style={{ padding: "15px", background: "#fff5f5", borderRadius: "10px", border: "1px solid #feb2b2" }}>
      <h4 style={{ color: "#c53030", margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: "10px" }}>
        <FaExclamationTriangle /> Active Safety Alerts
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {alerts.map(alert => (
          <div key={alert.id} style={{ display: "flex", alignItems: "center", gap: "10px", background: "white", padding: "10px", borderRadius: "5px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
            <span style={{ color: "#e53e3e", fontSize: "1.2rem" }}>{alert.icon}</span>
            <div>
              <div style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#2d3748" }}>{alert.title}</div>
              <div style={{ fontSize: "0.8rem", color: "#718096" }}>{alert.location}</div>
            </div>
            <button style={{ marginLeft: "auto", fontSize: "0.7rem", padding: "3px 8px", background: "#fed7d7", border: "none", color: "#c53030", borderRadius: "4px", cursor: "pointer" }}>Ack</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SafetyWidgets;