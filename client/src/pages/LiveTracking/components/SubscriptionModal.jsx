// src/pages/liveTracking/components/SubscriptionModal.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Bell, X, Trash2, Cloud, Shield, AlertTriangle, Edit, CheckCircle } from 'lucide-react';

const SubscriptionModal = ({ vessel, onClose, onSubscriptionChange }) => {
  const [subscription, setSubscription] = useState(null);
  const [alertType, setAlertType] = useState('');
  const [weatherAlertsEnabled, setWeatherAlertsEnabled] = useState(false);
  const [piracyAlertsEnabled, setPiracyAlertsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    checkSubscriptionStatus();
  }, [vessel?.id]);

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
      const foundSubscription = results.find(sub => sub.vessel === vessel.id && sub.is_active);

      if (foundSubscription) {
        setSubscription(foundSubscription);
        setAlertType(foundSubscription.alert_type || '');
        setWeatherAlertsEnabled(foundSubscription.weather_alerts === true);
        setPiracyAlertsEnabled(foundSubscription.piracy_alerts === true);
        setIsEditMode(false);
      } else {
        resetAlertState();
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setInitializing(false);
    }
  };

  const resetAlertState = () => {
    setSubscription(null);
    setAlertType('');
    setWeatherAlertsEnabled(false);
    setPiracyAlertsEnabled(false);
    setIsEditMode(false);
  };

  const handleAlertTypeChange = (e) => {
    const value = e.target.value;
    setAlertType(value);

    if (value === 'all') {
      setWeatherAlertsEnabled(true);
      setPiracyAlertsEnabled(true);
    } else if (value === 'position_update' || value === 'departure' || value === 'arrival') {
      setWeatherAlertsEnabled(false);
      setPiracyAlertsEnabled(false);
    }
  };

  const getAlertTypeLabel = (type) => {
    switch (type) {
      case 'all':
        return 'All events';
      case 'position_update':
        return 'Position updates';
      case 'departure':
        return 'Departures';
      case 'arrival':
        return 'Arrivals';
      default:
        return '';
    }
  };

  const toastStyle = {
    background: '#ffffff',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    minHeight: 'auto',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const showToast = (type, message, color) => {
    toast.dismiss();
    toast[type](message, {
      position: 'top-center',
      duration: 2000,
      icon: type === 'success' ? '✓' : undefined,
      style: {
        ...toastStyle,
        color: color,
        boxShadow: `0 4px 12px ${color}20`,
        border: `1px solid ${color}30`,
      }
    });
  };

  const saveAlert = async () => {
    if (isSubmitting) return;

    const hasEventType = alertType && alertType !== '';
    const hasDangerZone = weatherAlertsEnabled || piracyAlertsEnabled;

    if (!hasEventType && !hasDangerZone) {
      showToast('error', 'You must select at least one alert to enable', '#dc2626');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        showToast('error', 'You must be logged in', '#dc2626');
        setLoading(false);
        setIsSubmitting(false);
        return;
      }

      const isNewAlert = subscription === null;

      const alertData = {
        vessel: vessel.id,
        alert_type: alertType || 'none',
        is_active: true,
        weather_alerts: weatherAlertsEnabled,
        piracy_alerts: piracyAlertsEnabled
      };

      const response = await fetch(`${API_URL}/users/subscriptions/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alertData)
      });

      if (!response.ok) {
        throw new Error('Failed to save alert');
      }

      const newSubscription = await response.json();

      setSubscription(newSubscription);
      setAlertType(newSubscription.alert_type || '');
      setWeatherAlertsEnabled(newSubscription.weather_alerts === true);
      setPiracyAlertsEnabled(newSubscription.piracy_alerts === true);
      setIsEditMode(false);

      let toastMessage = '';

      if (isNewAlert) {
        const enabledItems = [];

        if (alertData.alert_type && alertData.alert_type !== 'none') {
          enabledItems.push(getAlertTypeLabel(alertData.alert_type));
        }

        if (alertData.weather_alerts === true) {
          enabledItems.push('Weather');
        }

        if (alertData.piracy_alerts === true) {
          enabledItems.push('Piracy');
        }

        if (enabledItems.length === 0) {
          toastMessage = `Alerts enabled for ${vessel.name}`;
        } else {
          toastMessage = `${enabledItems.join(', ')} alerts enabled for ${vessel.name}`;
        }
      } else {
        toastMessage = `Alerts updated for ${vessel.name}`;
      }

      showToast('success', toastMessage, '#059669');

      if (onSubscriptionChange) {
        onSubscriptionChange();
      }

      setTimeout(() => onClose(), 1000);
    } catch (error) {
      console.error('Error:', error);
      checkSubscriptionStatus();
      showToast('error', 'Failed to update alerts', '#dc2626');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const removeAlert = async () => {
    if (!subscription || isSubmitting) return;

    setIsSubmitting(true);
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        showToast('error', 'You must be logged in', '#dc2626');
        setLoading(false);
        setIsSubmitting(false);
        return;
      }

      resetAlertState();

      const response = await fetch(`${API_URL}/users/subscriptions/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vessel: vessel.id,
          is_active: false,
          alert_type: 'none',
          weather_alerts: false,
          piracy_alerts: false
        })
      });

      if (!response.ok) throw new Error('Failed to remove');

      showToast('success', `Alert removed for ${vessel.name}`, '#059669');

      if (onSubscriptionChange) {
        onSubscriptionChange();
      }

      setTimeout(() => onClose(), 1000);
    } catch (error) {
      console.error('Error:', error);
      checkSubscriptionStatus();
      showToast('error', 'Failed to remove alert', '#dc2626');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  if (initializing) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        [data-hot-toaster] {
          z-index: 9999 !important;
          top: 95px !important;
          left: 50% !important;
          right: auto !important;
          transform: translateX(-50%) !important;
        }
        
        [data-hot-toast] {
          z-index: 9999 !important;
        }
      `}</style>

      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={24} className="text-white" />
                <div>
                  <h3 className="font-bold text-white text-lg">Alerts</h3>
                  <p className="text-blue-100 text-sm">{vessel.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
                disabled={loading}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Status - Only when viewing active alert */}
              {subscription && !isEditMode && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-500" />
                    <div>
                      <p className="font-semibold text-blue-900">Alert Active</p>
                      <p className="text-xs text-blue-700">
                        {subscription.weather_alerts && subscription.piracy_alerts
                          ? 'Weather and Piracy alerts enabled'
                          : subscription.weather_alerts
                          ? 'Weather alerts enabled'
                          : subscription.piracy_alerts
                          ? 'Piracy alerts enabled'
                          : 'Alerts enabled'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="p-2 hover:bg-blue-100 rounded-lg transition"
                    disabled={loading}
                  >
                    <Edit size={18} className="text-blue-600" />
                  </button>
                </div>
              )}

              {/* Alert Settings - Only in create/edit mode */}
              {(isEditMode || !subscription) && (
                <>
                  {/* Event Type Dropdown */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Event Type</label>
                    <select
                      value={alertType}
                      onChange={handleAlertTypeChange}
                      disabled={loading}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white hover:border-blue-400"
                    >
                      <option value="">Select Event</option>
                      <option value="all">All Events</option>
                      <option value="position_update">Position Updates</option>
                      <option value="departure">Departures</option>
                      <option value="arrival">Arrivals</option>
                    </select>
                  </div>

                  {/* Danger Zones Section */}
                  <div className="space-y-3 border-t pt-4">
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-orange-600" />
                      Danger Zones
                    </p>

                    {/* Weather Alert */}
                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition">
                      <div className="flex items-center gap-3">
                        <Cloud size={20} className="text-blue-600" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Weather</p>
                          <p className="text-xs text-gray-600">Storms and rough seas</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setWeatherAlertsEnabled(!weatherAlertsEnabled)}
                        disabled={loading}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                          weatherAlertsEnabled ? 'bg-blue-600' : 'bg-gray-300'
                        } disabled:opacity-50`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                            weatherAlertsEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Piracy Alert */}
                    <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition">
                      <div className="flex items-center gap-3">
                        <Shield size={20} className="text-red-600" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Piracy</p>
                          <p className="text-xs text-gray-600">High-risk zones</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPiracyAlertsEnabled(!piracyAlertsEnabled)}
                        disabled={loading}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                          piracyAlertsEnabled ? 'bg-red-600' : 'bg-gray-300'
                        } disabled:opacity-50`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                            piracyAlertsEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                {!subscription ? (
                  <button
                    onClick={saveAlert}
                    disabled={loading || isSubmitting}
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
                ) : isEditMode ? (
                  <>
                    <button
                      onClick={saveAlert}
                      disabled={loading || isSubmitting}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm"
                    >
                      {loading ? (
                        <>
                          <div className="inline-flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Updating...
                          </div>
                        </>
                      ) : (
                        'Update Alerts'
                      )}
                    </button>
                    <button
                      onClick={removeAlert}
                      disabled={loading || isSubmitting}
                      className="w-full px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      Remove Alert
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditMode(true)}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <Edit size={18} />
                    Edit Alerts
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubscriptionModal;