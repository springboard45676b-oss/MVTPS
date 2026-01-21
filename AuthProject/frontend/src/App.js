import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

// IMPORT YOUR COMPONENTS
import Dashboard from "./Dashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // CHECK LOGIN STATUS ON LOAD
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/token/", {
        username,
        password,
      });
      localStorage.setItem("token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      setIsLoggedIn(true);
      setError("");
    } catch (err) {
      // Fallback for demo
      if(username === "admin_user" && password === "testpass1") {
          setIsLoggedIn(true);
      } else {
          setError("Invalid credentials. Try: admin_user / testpass1");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
  };

  // 1. IF LOGGED IN -> SHOW DASHBOARD (No Extra Navbar)
  if (isLoggedIn) {
    return (
      <Router>
          <Routes>
            <Route path="/" element={<Dashboard onLogout={handleLogout} />} />
            {/* Redirect any unknown URL back to Dashboard */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
      </Router>
    );
  }

  // 2. IF NOT LOGGED IN -> SHOW LOGIN SCREEN
  return (
    <div style={loginStyles.container}>
      <div style={loginStyles.card}>
        <div style={loginStyles.logoArea}>
          <div style={loginStyles.logoCircle}>⚓</div>
          <h1 style={loginStyles.title}>MVTPS Portal</h1>
          <p style={loginStyles.subtitle}>Maritime Vessel Tracking & Port Safety</p>
        </div>

        <form onSubmit={handleLogin} style={loginStyles.form}>
          <div style={loginStyles.inputGroup}>
            <label style={loginStyles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={loginStyles.input}
              placeholder="Enter ID"
            />
          </div>
          <div style={loginStyles.inputGroup}>
            <label style={loginStyles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={loginStyles.input}
              placeholder="••••••••"
            />
          </div>
          
          {error && <div style={loginStyles.error}>{error}</div>}

          <button type="submit" style={loginStyles.button}>SECURE LOGIN</button>
        </form>
        <div style={loginStyles.footer}>Authorized Personnel Only</div>
      </div>
    </div>
  );
}

// Styles
const loginStyles = {
  container: { height: "100vh", width: "100vw", backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url('https://images.unsplash.com/photo-1559297434-fae8a1916a79?q=80&w=2070&auto=format&fit=crop')", backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" },
  card: { background: "rgba(255, 255, 255, 0.95)", padding: "40px", borderRadius: "15px", width: "400px", textAlign: "center", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" },
  logoCircle: { width: "60px", height: "60px", background: "#0f172a", color: "white", fontSize: "30px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", margin: "0 auto 15px auto" },
  title: { margin: "0", color: "#0f172a", fontSize: "1.8rem" },
  subtitle: { margin: "5px 0 30px 0", color: "#64748b", fontSize: "0.9rem", fontWeight: "600" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { textAlign: "left" },
  label: { display: "block", fontSize: "0.8rem", fontWeight: "bold", color: "#475569", marginBottom: "5px" },
  input: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none", boxSizing: "border-box" },
  button: { width: "100%", padding: "15px", background: "#0ea5e9", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", fontWeight: "bold", cursor: "pointer", marginTop: "10px" },
  error: { color: "#ef4444", fontSize: "0.9rem", background: "#fee2e2", padding: "10px", borderRadius: "5px" },
  footer: { marginTop: "20px", fontSize: "0.75rem", color: "#94a3b8" }
};

export default App;