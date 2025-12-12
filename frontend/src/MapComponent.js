import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = () => {
  const [vessels, setVessels] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Search State

  useEffect(() => {
    const fetchVessels = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/vessels/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVessels(res.data);
      } catch (error) {
        console.error("Error loading map data:", error);
      }
    };
    fetchVessels();
  }, []);

  // Filter Logic
  const filteredVessels = vessels.filter(ship => 
    ship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ship.vessel_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      
      {/* SEARCH BAR OVERLAY */}
      <div style={{
        position: "absolute", 
        top: "10px", 
        right: "10px", 
        zIndex: 1000, 
        background: "white", 
        padding: "10px", 
        borderRadius: "5px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
      }}>
        <input 
          type="text" 
          placeholder="Search vessel or type..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px", width: "200px" }}
        />
      </div>

      <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        {filteredVessels.map((ship) => (
          <Marker key={ship.id} position={[ship.latitude, ship.longitude]}>
            <Popup>
              <div style={{textAlign: "center"}}>
                <strong style={{color: "#0c2461"}}>{ship.name}</strong><br />
                <span style={{fontSize: "0.8rem"}}>{ship.vessel_type}</span><br />
                <span style={{color: "green", fontWeight: "bold"}}>{ship.status}</span><br/>
                <button style={{marginTop: "5px", background: "#3498db", color: "white", border: "none", padding: "5px", borderRadius: "3px", cursor: "pointer"}}>Subscribe to Alerts</button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;