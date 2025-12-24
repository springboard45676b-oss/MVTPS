// src/components/SubscriptionModal.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Bell, X, AlertCircle, Trash2, CheckCircle } from 'lucide-react';

const SubscriptionModal = ({ vessel, onClose, onSubscriptionChange }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [alertType, setAlertType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    checkSubscriptionStatus();
  }, [vessel.id]);

  const checkSubscriptionStatus = async () => {
    try {
      setInitializing(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        setInitializing(false);
        return;
      }

      const response = await fetch(`${API_URL}/users/subscriptions/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        setInitializing(false);
        return;
      }

      const data = await response.json();
      const results = Array.isArray(data) ? data : (data.results || []);
      
      const subscription = results.find(sub => sub.vessel === vessel.id);
      if (subscription && subscription.is_active) {
        setIsSubscribed(true);
        setAlertType(subscription.alert_type);
      } else {
        setIsSubscribed(false);
        setAlertType('all');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setInitializing(false);
    }
  };

  const handleEnableAlert = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('You must be logged in', {
          position: 'top-center',
          duration: 3000,
        });
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
          alert_type: alertType,
          is_active: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to enable alert');
      }

      const data = await response.json();
      setIsSubscribed(true);
      
      toast.success(`Alert enabled for ${vessel.name}`, {
        position: 'top-center',
        duration: 3000,
      });
      
      if (onSubscriptionChange) {
        onSubscriptionChange();
      }

      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error enabling alert:', error);
      toast.error('Failed to enable alert', {
        position: 'top-center',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAlertType = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('You must be logged in', {
          position: 'top-center',
          duration: 3000,
        });
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
          alert_type: alertType,
          is_active: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update alert type');
      }

      toast.success('Alert type updated successfully', {
        position: 'top-center',
        duration: 3000,
      });
      
      if (onSubscriptionChange) {
        onSubscriptionChange();
      }

      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error updating alert type:', error);
      toast.error('Failed to update alert type', {
        position: 'top-center',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAlert = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('You must be logged in', {
          position: 'top-center',
          duration: 3000,
        });
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
          alert_type: alertType,
          is_active: false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to remove alert');
      }

      setIsSubscribed(false);
      
      toast.success('Alert removed successfully', {
        position: 'top-center',
        duration: 3000,
      });
      
      if (onSubscriptionChange) {
        onSubscriptionChange();
      }

      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error removing alert:', error);
      toast.error('Failed to remove alert', {
        position: 'top-center',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

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
              <CheckCircle size={20} className="text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">Active Subscription</p>
                <p className="text-xs text-emerald-700">Receiving alerts for this vessel</p>
              </div>
            </div>
          )}

          {/* Alert Type Selection - Always visible */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              {isSubscribed ? 'Update Alert Type' : 'Select Alert Type'}
            </label>
            <select
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 hover:bg-white disabled:opacity-50"
            >
              <option value="all">All Events</option>
              <option value="position_update">Position Updates Only</option>
              <option value="departure">Departures Only</option>
              <option value="arrival">Arrivals Only</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isSubscribed ? (
              <>
                <button
                  onClick={handleUpdateAlertType}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Update Alert Type
                    </>
                  )}
                </button>
                <button
                  onClick={handleRemoveAlert}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm flex items-center justify-center gap-2 border border-red-200"
                >
                  <Trash2 size={18} />
                  Remove Alert
                </button>
              </>
            ) : (
              <button
                onClick={handleEnableAlert}
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enabling...
                  </>
                ) : (
                  <>
                    <Bell size={18} />
                    Enable Alerts
                  </>
                )}
              </button>
            )}
          </div>

          {/* Info Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-700 leading-relaxed">
              <span className="font-semibold text-gray-900">💡 Tip:</span> You'll receive real-time notifications based on your selected alert type. Stay informed about important vessel updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;