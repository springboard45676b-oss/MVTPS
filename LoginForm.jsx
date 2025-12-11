import React, { useState } from "react";
import "./LoginForm.css";

const LoginForm = () => {
  const [page, setPage] = useState("login"); // login | register | success
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = (e) => {
    e.preventDefault();
    setPage("success");
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert("Registered Successfully! Now Login");
    setPage("login");
  };

  return (
    <div className="container">

      {/* LOGIN PAGE */}
      {page === "login" && (
        <form onSubmit={handleLogin}>
          <h1>Login</h1>
          <input type="text" placeholder="Username" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">Login</button>

          <p>
            Don't have an account?
            <a href="#" onClick={() => setPage("register")}> Register</a>
          </p>
        </form>
      )}

      {/* REGISTER PAGE */}
      {page === "register" && (
        <form onSubmit={handleRegister}>
          <h2>Register</h2>

          <input
            type="text"
            placeholder="Username"
            required
            onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email"
            required
            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
          />

          <select
            required
            onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
          >
            <option value="">Select Role</option>
            <option value="Admin">Admin</option>
            <option value="Operator">Operator</option>
            <option value="Analyst">User</option>
          </select>

          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            required
            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
          />

          <button type="submit">Register</button>

          <p>
            Already have an account?
            <a href="#" onClick={() => setPage("login")}> Login</a>
          </p>
        </form>
      )}

      {/* SUCCESS PAGE */}
      {page === "success" && (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h1>🎉 Login Successful! 🎉</h1>
          <p>Welcome to your dashboard.</p>

          <button onClick={() => setPage("login")} style={{ marginTop: "20px" }}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
