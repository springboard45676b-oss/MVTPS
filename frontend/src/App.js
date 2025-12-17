// src/App.js
import React, { useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard"; // ✅ dashboard import

function App() {
  const [screen, setScreen] = useState("register");
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    role: "OPERATOR",
  });

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const API_BASE = "http://127.0.0.1:8000/api/auth";

  // ✅ LOGOUT HANDLER
  const handleLogout = () => {
    // clear tokens + user from browser storage
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    // reset React state
    setCurrentUser(null);
    setScreen("login");
    setMessage("Logged out successfully");
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(`${API_BASE}/register/`, registerData);
      setMessage(res.data.message || "Registration successful");
      setScreen("login");
    } catch (error) {
      console.log("REGISTER ERROR FULL RESPONSE:", error.response?.data);
      if (error.response && error.response.data) {
        const data = error.response.data;
        const firstKey = Object.keys(data)[0];
        const firstVal = data[firstKey];
        if (Array.isArray(firstVal)) {
          setMessage(firstVal[0]);
        } else if (typeof firstVal === "string") {
          setMessage(firstVal);
        } else {
          setMessage("Error: " + JSON.stringify(data));
        }
      } else {
        setMessage("Registration failed, please try again ❌");
      }
    }
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(`${API_BASE}/login/`, loginData);

      setMessage(res.data.message || "User successfully logged in");

      // save tokens
      if (res.data.access) localStorage.setItem("access", res.data.access);
      if (res.data.refresh) localStorage.setItem("refresh", res.data.refresh);

      // save user info if backend sends it
      if (res.data.user) {
        setCurrentUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      // go to dashboard
      setScreen("dashboard");
    } catch (error) {
      console.log("LOGIN ERROR:", error.response?.data);
      if (error.response && error.response.data && error.response.data.detail) {
        setMessage(error.response.data.detail);
      } else {
        setMessage("Login failed ❌");
      }
    }
  };

  return (
    <div style={styles.page}>
      {/* ✅ DASHBOARD SCREEN */}
      {screen === "dashboard" && (
        <Dashboard user={currentUser} onLogout={handleLogout} />
      )}

      {/* AUTH (REGISTER / LOGIN) */}
      {screen !== "dashboard" && (
        <div style={styles.card}>
          <h2 style={styles.title}>
            Maritime Vessel Tracking, Port Analytics &amp; Safety Visualization Platform
          </h2>

          <div style={styles.tabs}>
            <button
              onClick={() => {
                setScreen("register");
                setMessage("");
              }}
              style={screen === "register" ? styles.activeTab : styles.tab}
            >
              Register
            </button>
            <button
              onClick={() => {
                setScreen("login");
                setMessage("");
              }}
              style={screen === "login" ? styles.activeTab : styles.tab}
            >
              Login
            </button>
          </div>

          {message && <p style={styles.message}>{message}</p>}

          {/* REGISTER FORM */}
          {screen === "register" && (
            <form onSubmit={submitRegister} style={styles.form}>
              <input
                type="text"
                placeholder="Username"
                name="username"
                required
                value={registerData.username}
                onChange={handleRegisterChange}
                style={styles.input}
              />
              <input
                type="email"
                placeholder="Email"
                name="email"
                required
                value={registerData.email}
                onChange={handleRegisterChange}
                style={styles.input}
              />
              <input
                type="password"
                placeholder="Password"
                name="password"
                required
                value={registerData.password}
                onChange={handleRegisterChange}
                style={styles.input}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                name="password2"
                required
                value={registerData.password2}
                onChange={handleRegisterChange}
                style={styles.input}
              />

              <select
                name="role"
                value={registerData.role}
                onChange={handleRegisterChange}
                style={styles.input}
              >
                <option value="OPERATOR">Operator</option>
                <option value="ANALYST">Analyst</option>
                <option value="ADMIN">Admin</option>
              </select>

              <button type="submit" style={styles.button}>
                Register
              </button>
            </form>
          )}

          {/* LOGIN FORM */}
          {screen === "login" && (
            <form onSubmit={submitLogin} style={styles.form}>
              <input
                type="text"
                placeholder="Username"
                name="username"
                required
                value={loginData.username}
                onChange={handleLoginChange}
                style={styles.input}
              />
              <input
                type="password"
                placeholder="Password"
                name="password"
                required
                value={loginData.password}
                onChange={handleLoginChange}
                style={styles.input}
              />

              <button type="submit" style={styles.button}>
                Login
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    padding: "20px",
  },
  card: {
    background: "#1e293b",
    padding: "25px",
    borderRadius: "14px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 0 20px rgba(0,0,0,0.4)",
    color: "#e6eef8",
  },
  title: {
    textAlign: "center",
    marginBottom: "15px",
    color: "white",
    fontSize: "20px",
    lineHeight: "1.1",
  },
  tabs: {
    display: "flex",
    marginBottom: "15px",
  },
  tab: {
    flex: 1,
    padding: "8px",
    background: "transparent",
    border: "1px solid #334155",
    color: "#94a3b8",
    cursor: "pointer",
  },
  activeTab: {
    flex: 1,
    padding: "8px",
    background: "#6366f1",
    border: "none",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "8px",
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "white",
  },
  button: {
    padding: "10px",
    background: "#22c55e",
    border: "none",
    borderRadius: "6px",
    color: "#0f172a",
    fontWeight: "bold",
    cursor: "pointer",
  },
  message: {
    textAlign: "center",
    marginBottom: "10px",
    color: "#38bdf8",
    fontWeight: "bold",
  },
};

export default App;
