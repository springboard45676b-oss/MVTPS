import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import '../LoginForm.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    phone: '',
    company: '',
    password: '',
    password_confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    const result = await register(formData);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(typeof result.error === 'object' ? 
        Object.values(result.error).flat().join(', ') : 
        result.error
      );
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="container">
        <form onSubmit={handleSubmit}>
          <h2>Register</h2>
          
          {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
          
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            value={formData.first_name}
            onChange={handleChange}
          />
          
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            value={formData.last_name}
            onChange={handleChange}
          />
          
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            <option value="operator">Operator</option>
            <option value="analyst">Analyst</option>
            <option value="admin">Admin</option>
          </select>
          
          <input
            type="text"
            name="phone"
            placeholder="Phone (optional)"
            value={formData.phone}
            onChange={handleChange}
          />
          
          <input
            type="text"
            name="company"
            placeholder="Company (optional)"
            value={formData.company}
            onChange={handleChange}
          />
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          <input
            type="password"
            name="password_confirm"
            placeholder="Confirm Password"
            value={formData.password_confirm}
            onChange={handleChange}
            required
          />
          
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>

          <p>
            Already have an account?
            <Link to="/login"> Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;