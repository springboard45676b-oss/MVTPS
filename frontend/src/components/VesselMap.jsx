import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";

export default function VesselMap({ filters }) {
  const [vessels, setVessels] = useState([]);

  const fetchVessels = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/tracking/vessels/"
      );
      setVessels(res.data);
    } catch (err) {
      console.error("AIS fetch error", err);
    }
  };

  // 🔁 POLLING every 5 seconds
  useEffect(() => {
    fetchVessels();
    const interval = setInterval(fetchVessels, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = vessels.filter((v) => {
    if (v.type === "TANKER" && !filters.tanker) return false;
    if (v.type === "CARGO" && !filters.cargo) return false;
    if (v.type === "CONTAINER" && !filters.container) return false;
    return true;
  });

  return (
    <MapContainer
      center={[51.9244, 4.4777]} // Rotterdam
      zoom={6}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {filtered.map((v) => (
        <Marker key={v.mmsi} position={[v.latitude, v.longitude]}>
          <Popup>
            <b>{v.name}</b>
            <br />
            MMSI: {v.mmsi}
            <br />
            Type: {v.type}
            <br />
            Speed: {v.speed} kn
            <br />
            Course: {v.course}°
            <br />
            Destination: {v.destination}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
