// src/pages/VesselsList.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function VesselsList() {
  const [vessels, setVessels] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/vessels/");
        setVessels(res.data || []);
      } catch (err) {
        console.error(err);
        setVessels([]);
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Vessels</h1>
      {vessels.length === 0 ? (
        <p>No vessels available.</p>
      ) : (
        <ul>
          {vessels.map((v) => <li key={v.id || v.name}>{v.name} — {v.mmsi || v.imo || "—"}</li>)}
        </ul>
      )}
    </div>
  );
}
