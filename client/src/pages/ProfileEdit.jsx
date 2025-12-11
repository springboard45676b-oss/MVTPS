import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';

const ProfileEdit = () => {
  const [user, setUser] = useState({
    username: '',
    email: '',
    role: ''
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const currentUser = await authAPI.fetchCurrentUser() || authAPI.getCurrentUser();
        if (currentUser) {
          setUser({
            username: currentUser.username || '',
            email: currentUser.email || '',
            role: currentUser.role || 'operator'
          });
        } else {
          setMessage({ type: 'error', text: 'Failed to load user profile.' });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        setMessage({ type: 'error', text: 'Failed to load profile. Please try again.' });
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (!user.username || !user.email) {
      setMessage({ type: 'error', text: 'Username and email are required' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('username', user.username);
      formData.append('email', user.email);
      formData.append('role', user.role);
      
      // Only append password if it's being changed
      if (password) {
        formData.append('password', password);
      }

      console.log('Submitting FormData:', {
        username: user.username,
        email: user.email,
        role: user.role,
        password: password ? '***' : 'not provided'
      });

      const response = await authAPI.editProfile(formData);
      
      // Update local state with the updated user data
      const updatedUser = response.user || response;
      setUser(prev => ({
        ...prev,
        username: updatedUser.username || prev.username,
        email: updatedUser.email || prev.email,
        role: updatedUser.role || prev.role
      }));
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear password fields after successful update
      setPassword('');
      setConfirmPassword('');
      
      // Navigate back to profile page after 1.5 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
      
    } catch (error) {
      console.error('Profile update error:', error);
      
      // Handle specific error messages
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (error.response?.data) {
        const data = error.response.data;
        if (data.username) {
          errorMessage = Array.isArray(data.username) ? data.username[0] : data.username;
        } else if (data.email) {
          errorMessage = Array.isArray(data.email) ? data.email[0] : data.email;
        } else if (data.password) {
          errorMessage = Array.isArray(data.password) ? data.password[0] : data.password;
        } else if (data.role) {
          errorMessage = Array.isArray(data.role) ? data.role[0] : data.role;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.detail) {
          errorMessage = data.detail;
        }
      }
      
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm">
        <div className="p-6 text-center text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user.username) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm">
        <div className="p-6 text-center text-red-600">Unable to load profile</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Edit Profile</h1>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={user.username || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={user.email || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={user.role || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="operator">Operator</option>
              <option value="analyst">Analyst</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-md font-medium text-slate-800 mb-3">
              Change Password (leave blank to keep current password)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                navigate('/profile');
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;