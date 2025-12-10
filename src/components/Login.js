import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      // Login request (email as username)
      const res = await axios.post("http://127.0.0.1:8000/api/token/", {
        username: email,
        password: password,
      });

      const token = res.data.access;

      // Store token and email
      localStorage.setItem("token", token);
      localStorage.setItem("email", email);

      // Fetch user profile to get role
      const profile = await axios.get("http://127.0.0.1:8000/api/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const role = profile.data.role;

      // Redirect based on role
      if (role === "Operator") navigate("/operator");
      else if (role === "Analyst") navigate("/analyst");
      else if (role === "Admin") navigate("/admin");
      else navigate("/");

    } catch (err) {
      console.error("LOGIN ERROR:", err.response?.data);
      setError("Invalid login. Check email and password.");
    }
  };

  return (
    <div className="card">
      <h2>LOGIN</h2>

      <form onSubmit={handleLogin}>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: "gray",
              userSelect: "none",
            }}
          >
            {showPassword ? "👁️" : "🙈"}
          </span>
        </div>

        {error && (
          <span className="error" style={{ color: "red", display: "block", marginTop: "5px" }}>
            {error}
          </span>
        )}

        <button type="submit" style={{ marginTop: "10px" }}>Login</button>
      </form>
    </div>
  );
}
