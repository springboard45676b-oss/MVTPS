// src/components/SubscriptionModal.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Bell, X, AlertCircle, Trash2, CheckCircle } from 'lucide-react';

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
      } else {
        setIsSubscribed(false);
        setAlertType('all');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  // Custom success toast
  const showSuccessToast = (title, subtitle, detail) => {
    toast.custom(
      (t) => (
        <div className="bg-white rounded-sm shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 gap-4">
            <p className="text-gray-800 text-sm">
              <span className="font-bold">{title}</span> for <span className="font-semibold">{subtitle}</span>
              {detail && (
                <>
                  {' '}· <span className="text-gray-600">{detail}</span>
                </>
              )}
            </p>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close notification"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="h-1 bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{
                animation: `slideOut 8s linear forwards`,
              }}
            />
          </div>
        </div>
      ),
      {
        duration: 8000,
        position: 'top-right'
      }
    );
  };

  // Custom error toast
  const showErrorToast = (title, subtitle) => {
    toast.custom(
      (t) => (
        <div className="bg-white rounded-sm shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 gap-4">
            <p className="text-gray-800 text-sm">
              <span className="font-bold">{title}</span>
              {subtitle && (
                <>
                  {' '}· <span className="text-gray-600">{subtitle}</span>
                </>
              )}
            </p>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close notification"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="h-1 bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all"
              style={{
                animation: `slideOut 8s linear forwards`,
              }}
            />
          </div>
        </div>
      ),
      {
        duration: 8000,
        position: 'top-right'
      }
    );
  };

  const handleToggleSubscription = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        showErrorToast('Error', 'You must be logged in');
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
      
      if (data.is_active) {
        showSuccessToast(
          'Alerts Enabled',
          vessel.name,
          `Type: ${alertType.replace('_', ' ').toUpperCase()}`
        );
      } else {
        showSuccessToast(
          'Alerts Removed',
          vessel.name,
          ''
        );
      }
      
      setMessage({
        type: 'success',
        text: data.is_active 
          ? `Subscribed to ${vessel.name} alerts` 
          : `Unsubscribed from ${vessel.name}`
      });
      
      if (onSubscriptionChange) {
        onSubscriptionChange();
      }

      // Close modal after 1 second
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error updating subscription:', error);
      showErrorToast('Failed to Update', 'Could not update subscription settings');
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
        showErrorToast('Error', 'You must be logged in');
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

      showSuccessToast(
        `Alert type set to ${alertType.replace('_', ' ').toUpperCase()}`,
        vessel.name,
        ''
      );
      
      setMessage({
        type: 'success',
        text: `Alert type updated to ${alertType.replace('_', ' ')}`
      });
      
      if (onSubscriptionChange) {
        onSubscriptionChange();
      }

      // Close modal after 1 second
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error updating alert type:', error);
      showErrorToast('Failed to Update', 'Could not update alert type');
      setMessage({ type: 'error', text: 'Failed to update alert type' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-lg">
              <Bell size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Alert Settings</h3>
              <p className="text-blue-100 text-sm">{vessel.name}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Status Badge */}
          {isSubscribed && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">Active Subscription</p>
                <p className="text-xs text-emerald-700">Receiving alerts for this vessel</p>
              </div>
            </div>
          )}

          {/* Alert Type Selection */}
          {isSubscribed && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">Alert Type</label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
              >
                <option value="all">All Events</option>
                <option value="position_update">Position Updates Only</option>
                <option value="departure">Departures Only</option>
                <option value="arrival">Arrivals Only</option>
              </select>

              <button
                onClick={handleUpdateAlertType}
                disabled={loading}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
              >
                {loading ? 'Updating...' : 'Update Type'}
              </button>
            </div>
          )}

          {/* Action Button */}
          {isSubscribed ? (
            <button
              onClick={handleToggleSubscription}
              disabled={loading}
              className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm flex items-center justify-center gap-2 border border-red-200"
            >
              <Trash2 size={18} />
              Remove Alert
            </button>
          ) : (
            <button
              onClick={handleToggleSubscription}
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Bell size={18} />
              Enable Alerts
            </button>
          )}

          {/* Info Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-700 leading-relaxed">
              <span className="font-semibold text-gray-900">💡 Tip:</span> You'll receive real-time notifications based on your selected alert type. Stay informed about important vessel updates.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideOut {
          0% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default SubscriptionModal;