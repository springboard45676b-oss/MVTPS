import React, { useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard.js"; 
import { FaUser, FaLock, FaEnvelope, FaIdCard } from "react-icons/fa"; 
import "./App.css";

function App() {
  // Check local storage for the access token to keep user logged in
  const [token, setToken] = useState(localStorage.getItem("token"));
  
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    first_name: "",
    last_name: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/token/", {
        username: formData.username,
        password: formData.password
      });
      
      // --- CRITICAL CHANGE: SAVE BOTH TOKENS ---
      // 1. Save Access Token (The short-lived passport)
      localStorage.setItem("token", res.data.access);         
      
      // 2. Save Refresh Token (The long-lived ID for renewal)
      localStorage.setItem("refresh_token", res.data.refresh); 
      // ------------------------------------------

      setToken(res.data.access);
      setMessage("✅ Login Successful!");
      setMessageType("success");

    } catch (error) {
      console.error(error);
      setMessage("❌ Invalid Username or Password");
      setMessageType("error");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/register/", formData);
      setMessage("✅ Registration Successful! Please Login.");
      setMessageType("success");
      setIsLogin(true);
      // Clear form after success
      setFormData({ username: "", password: "", email: "", first_name: "", last_name: "" });
    } catch (error) {
      console.error(error);
      setMessage("❌ Registration Failed. Username might be taken.");
      setMessageType("error");
    }
  };

  const handleLogout = () => {
    // --- CRITICAL CHANGE: REMOVE BOTH TOKENS ON LOGOUT ---
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token"); 
    // -----------------------------------------------------
    setToken(null);
  };

  // If we have a token, show the Dashboard
  if (token) return <Dashboard onLogout={handleLogout} />;

  // Otherwise, show the Login/Register Form
  return (
    <div className="app-container">
      <div className="card">
        <div className="header-text">
          <h1>{isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p>{isLogin ? "Login to access your dashboard" : "Join us to get started"}</p>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {/* Username Field */}
          <div className="input-group">
            <FaUser className="icon" />
            <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
          </div>

          {/* New Fields - Only show for Register */}
          {!isLogin && (
            <>
              <div className="input-group">
                <FaEnvelope className="icon" />
                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="row">
                <div className="input-group half">
                  <FaIdCard className="icon" />
                  <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} />
                </div>
                <div className="input-group half">
                  <FaIdCard className="icon" />
                  <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} />
                </div>
              </div>
            </>
          )}

          {/* Password Field */}
          <div className="input-group">
            <FaLock className="icon" />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="primary-btn">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        {message && <p className={`message ${messageType}`}>{message}</p>}

        <p className="toggle-text">
          {isLogin ? "New here? " : "Already have an account? "}
          <span onClick={() => { setIsLogin(!isLogin); setMessage(""); }} className="link">
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default App;