import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "Operator",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error on change
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!form.username) tempErrors.username = "Username is required.";
    if (!form.email) tempErrors.email = "Email is required.";
    if (!form.phone) tempErrors.phone = "Phone number is required.";
    if (!form.password) tempErrors.password = "Password is required.";
    else if (form.password.length < 8)
      tempErrors.password = "Password must be at least 8 characters long.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0; // valid if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/register/", form);
      console.log("REGISTER SUCCESS:", res.data);
      alert("Registration Successful!");
      navigate("/login");
    } catch (err) {
      console.error("REGISTER ERROR:", err.response?.data);
      const backendErrors = err.response?.data;
      if (backendErrors) setErrors(backendErrors);
      alert("Registration failed! Check the form for errors.");
    }
  };

  return (
    <div className="card">
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Full Name"
          value={form.username}
          onChange={handleChange}
        />
        {errors.username && <span className="error" style={{ color: "red" }}>{errors.username}</span>}

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        {errors.email && <span className="error" style={{ color: "red" }}>{errors.email}</span>}

        <input
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
        />
        {errors.phone && <span className="error" style={{ color: "red" }}>{errors.phone}</span>}

        {/* Password input with show/hide toggle */}
        <div style={{ position: "relative" }}>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
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
        {errors.password && <span className="error" style={{ color: "red" }}>{errors.password}</span>}

        <select name="role" value={form.role} onChange={handleChange}>
          <option value="Operator">Operator</option>
          <option value="Analyst">Analyst</option>
          <option value="Admin">Admin</option>
        </select>

        <button type="submit" style={{ marginTop: "10px" }}>Register</button>
      </form>
    </div>
  );
}
