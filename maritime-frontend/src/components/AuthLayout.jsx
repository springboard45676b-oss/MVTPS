// src/components/AuthLayout.jsx
import React from "react";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0b1220",
      color: "#e6eef8",
      padding: 24
    }}>
      <div style={{ width: "100%", maxWidth: 980, display: "flex", gap: 32 }}>
        <div style={{
          flex: 1,
          padding: 28,
          borderRadius: 12,
          background: "linear-gradient(180deg,#071327,#0b1722)",
          boxShadow: "0 10px 30px rgba(2,6,23,0.6)"
        }}>
          <h1 style={{ margin: 0, fontSize: 26 }}>{title}</h1>
          <p style={{ marginTop: 6, color: "#9fb0c8" }}>{subtitle}</p>
          <div style={{ marginTop: 20 }}>{children}</div>
        </div>
        <div style={{
          width: 320,
          padding: 20,
          borderRadius: 12,
          background: "#071428",
          color: "#a9c2d8"
        }}>
          <h3 style={{ marginTop: 0 }}>Maritime Platform</h3>
          <p style={{ fontSize: 13 }}>Track vessels, view analytics and manage alerts. Sign in to continue.</p>
        </div>
      </div>
    </div>
  );
}
