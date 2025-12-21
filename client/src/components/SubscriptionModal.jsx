// src/components/SubscriptionModal.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Bell, X, AlertCircle } from 'lucide-react';

const SubscriptionModal = ({ vessel, onClose, onSubscriptionChange }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [alertType, setAlertType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    checkSubscriptionStatus();
  }, [vessel]);

  const checkSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${API_URL}/users/subscriptions/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) return;

      const data = await response.json();
      const results = Array.isArray(data) ? data : (data.results || []);
      
      const subscription = results.find(sub => sub.vessel === vessel.id);
      if (subscription) {
        setIsSubscribed(subscription.is_active);
        setAlertType(subscription.alert_type);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleToggleSubscription = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('You must be logged in');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/users/subscriptions/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vessel: vessel.id,
          alert_type: alertType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      const data = await response.json();
      setIsSubscribed(data.is_active);
      
      // 🔥 SHOW TOAST IMMEDIATELY WHEN ALERT IS ENABLED
      if (data.is_active) {
        toast.success(
          (t) => (
            <div className="flex flex-col gap-2">
              <span className="font-bold text-lg">🔔 Alerts Enabled!</span>
              <span className="text-sm">{vessel.name}</span>
              <span className="text-xs opacity-90">Type: {alertType.replace('_', ' ').toUpperCase()}</span>
            </div>
          ),
          {
            duration: 5000,
            position: 'top-right',
            style: {
              borderRadius: '12px',
              background: '#10b981',
              color: '#fff',
              padding: '16px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            }
          }
        );
      } else {
        toast(
          (t) => (
            <div className="flex flex-col gap-2">
              <span className="font-bold text-lg">🔕 Alerts Disabled</span>
              <span className="text-sm">{vessel.name}</span>
            </div>
          ),
          {
            duration: 4000,
            position: 'top-right',
            icon: '🔕',
            style: {
              borderRadius: '12px',
              background: '#6b7280',
              color: '#fff',
              padding: '16px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            }
          }
        );
      }
      
      setMessage({
        type: 'success',
        text: data.is_active 
          ? `✅ Subscribed to ${vessel.name} alerts` 
          : `🔕 Unsubscribed from ${vessel.name}`
      });
      
      if (onSubscriptionChange) {
        onSubscriptionChange();
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('❌ Failed to update subscription', {
        duration: 3000,
        position: 'top-right',
      });
      setMessage({ type: 'error', text: 'Failed to update subscription' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAlertType = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('You must be logged in');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/users/subscriptions/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vessel: vessel.id,
          alert_type: alertType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update alert type');
      }

      toast.success(
        (t) => (
          <div className="flex flex-col gap-2">
            <span className="font-bold">✅ Alert Type Updated</span>
            <span className="text-sm">{alertType.replace('_', ' ').toUpperCase()}</span>
            <span className="text-xs opacity-90">for {vessel.name}</span>
          </div>
        ),
        {
          duration: 4000,
          position: 'top-right',
          style: {
            borderRadius: '12px',
            background: '#3b82f6',
            color: '#fff',
            padding: '16px',
          }
        }
      );
      
      setMessage({
        type: 'success',
        text: `✅ Alert type updated to ${alertType.replace('_', ' ')}`
      });
      
      if (onSubscriptionChange) {
        onSubscriptionChange();
      }
    } catch (error) {
      console.error('Error updating alert type:', error);
      toast.error('Failed to update alert type');
      setMessage({ type: 'error', text: 'Failed to update alert type' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Bell size={18} className="text-blue-600" /> Alert Settings
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {message.text && (
          <div className={`p-3 rounded-lg mb-4 flex items-center gap-2 text-sm ${
            message.type === 'error'
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}>
            <AlertCircle size={16} />
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          {/* Subscription Status Message */}
          <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
            isSubscribed
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            <AlertCircle size={16} />
            {isSubscribed 
              ? `Subscribed to ${vessel.name} alerts`
              : `Unsubscribed from ${vessel.name}`
            }
          </div>

          {/* Subscription Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <p className="font-medium text-slate-900">Enable Alerts for {vessel.name}</p>
              <p className="text-sm text-slate-600">Receive notifications about this vessel</p>
            </div>
            <button
              onClick={handleToggleSubscription}
              disabled={loading}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                isSubscribed
                  ? 'bg-green-600'
                  : 'bg-slate-300'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                  isSubscribed ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Alert Type Selection - Only show if subscribed */}
          {isSubscribed && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-slate-900">Alert Type</label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Events</option>
                <option value="position_update">Position Updates Only</option>
                <option value="departure">Departures Only</option>
                <option value="arrival">Arrivals Only</option>
              </select>

              <button
                onClick={handleUpdateAlertType}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
              >
                {loading ? 'Updating...' : 'Update Alert Type'}
              </button>
            </div>
          )}

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> You'll receive notifications based on your selected alert type.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;