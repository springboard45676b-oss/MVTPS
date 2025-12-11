import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Profile = () => {
  const [user, setUser] = useState({
    username: '',
    email: '',
    role: ''
  });
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

  const userInitial = user.username ? user.username.charAt(0).toUpperCase() : 'U';

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'analyst':
        return 'bg-blue-100 text-blue-800';
      case 'operator':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">User Profile</h1>
        <button
          onClick={() => navigate('/profile/edit')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Edit Profile
        </button>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4">
            <span className="text-5xl font-bold text-white">
              {userInitial}
            </span>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-800">
              {user.username}
            </h2>
            <p className="text-slate-600 text-sm mb-3">{user.email}</p>
            <span className={`inline-block px-4 py-2 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
        </div>

        <div className="lg:w-2/3">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={user.username || ''}
                disabled
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Role
              </label>
              <input
                type="text"
                value={user.role.charAt(0).toUpperCase() + user.role.slice(1) || ''}
                disabled
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;