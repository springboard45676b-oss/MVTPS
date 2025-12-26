import { useState } from 'react';
import { apiRequest } from '../utils/api';

export default function ChangePassword() {
  const [form, setForm] = useState({
    old_password: '',
    new_password: '',
  });

  const [msg, setMsg] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await apiRequest('/change-password/', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setMsg('Password changed successfully');
    } catch {
      setMsg('Password change failed');
    }
  };

  return (
    <div className="mt-6 bg-white p-6 rounded-xl shadow">
      <h3 className="text-lg font-bold mb-4">Change Password</h3>

      {msg && <p className="text-sm mb-2">{msg}</p>}

      <input
        name="old_password"
        type="password"
        placeholder="Old Password"
        onChange={handleChange}
        className="w-full border p-2 rounded mb-3"
      />

      <input
        name="new_password"
        type="password"
        placeholder="New Password"
        onChange={handleChange}
        className="w-full border p-2 rounded mb-3"
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Update Password
      </button>
    </div>
  );
}
