// src/pages/VesselForm.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function VesselForm({ vessel = null, onSaved = () => {}, onCancel = () => {} }) {
  const [form, setForm] = useState({
    name: "",
    mmsi: "",
    imo: "",
    callsign: "",
    vessel_type: "",
    length_m: "",
    beam_m: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (vessel) {
      setForm({
        name: vessel.name || "",
        mmsi: vessel.mmsi || "",
        imo: vessel.imo || "",
        callsign: vessel.callsign || "",
        vessel_type: vessel.vessel_type || "",
        length_m: vessel.length_m ?? "",
        beam_m: vessel.beam_m ?? "",
      });
    } else {
      setForm({
        name: "",
        mmsi: "",
        imo: "",
        callsign: "",
        vessel_type: "",
        length_m: "",
        beam_m: "",
      });
    }
    setError("");
  }, [vessel]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (vessel) {
        const res = await api.put(`/api/vessels/${vessel.id}/`, {
          ...form,
          length_m: form.length_m === "" ? null : parseFloat(form.length_m),
          beam_m: form.beam_m === "" ? null : parseFloat(form.beam_m),
        });
        onSaved(res.data);
      } else {
        const res = await api.post("/api/vessels/", {
          ...form,
          length_m: form.length_m === "" ? null : parseFloat(form.length_m),
          beam_m: form.beam_m === "" ? null : parseFloat(form.beam_m),
        });
        onSaved(res.data);
      }
    } catch (err) {
      console.error("Save vessel error:", err.response || err);
      const msg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      setError("Failed to save vessel: " + msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h3 style={{ marginBottom: 12, color: "#cbd5e1" }}>{vessel ? "Edit vessel" : "Create vessel"}</h3>

      {error && <div style={{ background: "#411212", color: "#ffdede", padding: 8, borderRadius: 6, marginBottom: 12 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "block" }}>
            <div style={{ color: "#cbd5e1", marginBottom: 6 }}>Name</div>
            <input name="name" value={form.name} onChange={handleChange} required className="auth-input" />
          </label>

          <label style={{ display: "block" }}>
            <div style={{ color: "#cbd5e1", marginBottom: 6 }}>MMSI</div>
            <input name="mmsi" value={form.mmsi} onChange={handleChange} />
          </label>

          <label style={{ display: "block" }}>
            <div style={{ color: "#cbd5e1", marginBottom: 6 }}>IMO</div>
            <input name="imo" value={form.imo} onChange={handleChange} />
          </label>

          <label style={{ display: "block" }}>
            <div style={{ color: "#cbd5e1", marginBottom: 6 }}>Callsign</div>
            <input name="callsign" value={form.callsign} onChange={handleChange} />
          </label>

          <label style={{ display: "block" }}>
            <div style={{ color: "#cbd5e1", marginBottom: 6 }}>Type</div>
            <input name="vessel_type" value={form.vessel_type} onChange={handleChange} />
          </label>

          <label style={{ display: "block" }}>
            <div style={{ color: "#cbd5e1", marginBottom: 6 }}>Length (m)</div>
            <input name="length_m" type="number" step="0.01" value={form.length_m} onChange={handleChange} />
          </label>

          <label style={{ display: "block" }}>
            <div style={{ color: "#cbd5e1", marginBottom: 6 }}>Beam (m)</div>
            <input name="beam_m" type="number" step="0.01" value={form.beam_m} onChange={handleChange} />
          </label>

          <div />
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(90deg,#0ea5e9,#10b981)",
              color: "#022c22",
              fontWeight: 700,
            }}
          >
            {saving ? "Saving…" : vessel ? "Save changes" : "Create vessel"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.06)",
              background: "transparent",
              color: "#cbd5e1",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
