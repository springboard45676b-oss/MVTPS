// src/ProjectInfo.js
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ProjectInfo() {
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API = "http://127.0.0.1:8000/api/ports/"; // backend endpoint

  useEffect(() => {
    let mounted = true;

    const fetchPorts = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("access");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(API, { headers });

        if (mounted) setPorts(res.data);
      } catch (err) {
        console.error("Failed to fetch ports", err);
        if (mounted) {
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            setError("Not authorized. Please log in again.");
          } else {
            setError("Failed to load ports. Make sure backend is running.");
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPorts();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div style={styles.card}>
      <h1 style={styles.title}>Maritime Vessel Tracking — Ports</h1>

      <p style={styles.lead}>
        Ports section shows example port details fetched securely from the Django backend.
      </p>

      <section style={styles.section}>
        <h3 style={styles.h3}>Ports (live)</h3>

        {loading && <div style={styles.note}>Loading ports…</div>}

        {error && (
          <div style={{ ...styles.note, color: "#ffb4b4" }}>
            {error}
          </div>
        )}

        {!loading && !error && ports.length === 0 && (
          <div style={styles.note}>
            No ports found. Add ports in Django admin or via the API.
          </div>
        )}

        <div style={styles.grid}>
          {ports.map((p) => (
            <div key={p.id} style={styles.cardSmall}>
              <div style={{ fontWeight: 700 }}>Port: {p.name}</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>
                Type: {p.port_type || "—"}
                <br />
                Country: {p.country || "—"}
                <br />
                Berths: {p.berths}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  card: {
    background: "#0b1220",
    padding: 20,
    borderRadius: 16,
    color: "#e5e7eb",
    boxShadow: "0 0 20px rgba(0,0,0,0.4)",
  },
  title: {
    margin: 0,
    marginBottom: 8,
    fontSize: 20,
    textAlign: "left",
  },
  lead: {
    marginTop: 0,
    marginBottom: 18,
    color: "#9ca3af",
    fontSize: 13,
  },
  section: { marginBottom: 14 },
  h3: { marginBottom: 8, color: "#a5b4fc", fontSize: 15 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },
  cardSmall: {
    background: "#020617",
    padding: 14,
    borderRadius: 10,
    color: "#dbeafe",
    minHeight: "80px",
    border: "1px solid #1e293b",
  },
  note: { marginTop: 8, color: "#9fb7d6", fontSize: 13 },
};
