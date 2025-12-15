import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/auth.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/token/", {
        username,
        password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      navigate("/dashboard");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-info">
        <h1>Maritime Vessel Tracking Platform</h1>
        <p>
          Secure login to monitor vessels, ports, voyages, and safety events.
        </p>
      </div>

      <div className="auth-card">
        <h2>Login</h2>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>

        <p className="jwt-note">
          🔐 This system uses JWT authentication for secure access.
        </p>

        <div className="auth-links">
          <Link to="/forgot-password">Forgot password?</Link>
          <span>
            New user? <Link to="/register">Register</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
