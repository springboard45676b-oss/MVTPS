import { useState } from 'react';

export default function UserProfile() {
  const [form, setForm] = useState({
    username: localStorage.getItem('username'),
    email: localStorage.getItem('email') || '',
    role: localStorage.getItem('user_role'),
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    alert('Profile update API will be added here (Step-2)');
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-600">Username</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Role</label>
          <input
            value={form.role}
            disabled
            className="w-full border rounded p-2 bg-gray-100"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
