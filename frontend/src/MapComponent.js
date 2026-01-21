import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- FIX DEFAULT ICON ISSUE IN LEAFLET ---
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// --- FALLBACK SAFETY ZONES (If none provided via props) ---
const defaultSafetyZones = [
  { id: 1, type: "PIRACY ZONE", lat: 12.0, lng: 48.0, radius: 300000, color: "#ef4444", info: "Gulf of Aden: High Hijacking Risk" }, 
  { id: 2, type: "STORM WARNING", lat: 22.0, lng: 125.0, radius: 500000, color: "#f97316", info: "Typhoon Category 4: Avoid Area" }, 
];

const MapUpdater = ({ center, id }) => {
  const map = useMap();
  useEffect(() => {
    if(center) {
      const currentZoom = map.getZoom();
      const targetZoom = currentZoom < 6 ? 6 : currentZoom;
      map.setView(center, targetZoom, { animate: true });
    }
  }, [id, map]); 
  return null;
};

// UPDATED: Now accepts `safetyZones` as a prop
const MapComponent = ({ vessels, selectedVessel, setSelectedVessel, safetyZones = defaultSafetyZones }) => {
  const defaultCenter = [20, 60];

  return (
    <MapContainer center={defaultCenter} zoom={3} style={{ height: "100%", width: "100%", background: "#aad3df" }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap & CartoDB'
      />
      
      {selectedVessel && (
        <MapUpdater 
            center={[selectedVessel.lat, selectedVessel.lng]} 
            id={selectedVessel.id} 
        />
      )}

      {/* RENDER DYNAMIC SAFETY ZONES */}
      {safetyZones.map((zone) => (
        <Circle
          key={zone.id}
          center={[zone.lat, zone.lng]}
          radius={zone.radius}
          pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.2 }}
        >
          <Popup>
            <strong style={{color: zone.color}}>{zone.type}</strong><br/>{zone.info}
          </Popup>
        </Circle>
      ))}

      {vessels.map((ship) => (
        <React.Fragment key={ship.id}>
            {ship.path && (
                <Polyline 
                    positions={ship.path} 
                    pathOptions={{ color: '#2563eb', weight: 2, dashArray: '5, 10', opacity: 0.6 }} 
                />
            )}
            <Marker 
              position={[ship.lat, ship.lng]}
              eventHandlers={{ click: () => setSelectedVessel(ship) }}
            >
              <Popup maxWidth={300} minWidth={250} offset={[0, -10]}>
                <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", borderBottom: "1px solid #eee", paddingBottom: "5px" }}>
                      <strong style={{ color: "#0f172a", fontSize: "1rem" }}>{ship.name}</strong>
                      <span style={{ fontSize: "0.7rem", background: "#e0f2fe", color: "#0284c7", padding: "2px 6px", borderRadius: "4px" }}>{ship.flag}</span>
                  </div>
                  <table style={{ width: "100%", fontSize: "0.85rem", color: "#334155" }}>
                    <tbody>
                      <tr><td>MMSI:</td><td style={{fontWeight:"bold"}}>{ship.mmsi}</td></tr>
                      <tr><td>Type:</td><td style={{fontWeight:"bold"}}>{ship.type}</td></tr>
                      <tr><td>Speed:</td><td style={{fontWeight:"bold", color:"#0ea5e9"}}>{ship.speed} kn</td></tr>
                      <tr><td>Dest:</td><td style={{fontWeight:"bold"}}>{ship.destination}</td></tr>
                    </tbody>
                  </table>
                </div>
              </Popup>
            </Marker>
        </React.Fragment>
      ))}
    </MapContainer>
  );
};

export default MapComponent;