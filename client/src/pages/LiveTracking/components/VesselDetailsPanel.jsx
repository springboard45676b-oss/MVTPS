// src/pages/liveTracking/components/VesselDetailsPanel.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Navigation, TrendingUp, Bell, X, Trash2, Check, Edit, Map } from 'lucide-react';

const VesselDetailsPanel = ({ vessel, track, onEnableAlerts, onOptimizeRoute, onClose, onSubscriptionUpdate, refreshTrigger }) => {
  const [subscription, setSubscription] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    if (vessel?.id) {
      checkSubscriptionStatus();
    }
  }, [vessel?.id, refreshTrigger]);

  const checkSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        setSubscription(null);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/users/subscriptions/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        setSubscription(null);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      const results = Array.isArray(data) ? data : (data.results || []);
      const foundSubscription = results.find(sub => sub.vessel === vessel.id && sub.is_active);

      // Ensure we have the latest data
      if (foundSubscription) {
        setSubscription({
          ...foundSubscription,
          weather_alerts: foundSubscription.weather_alerts === true,
          piracy_alerts: foundSubscription.piracy_alerts === true
        });
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertStatusText = () => {
    if (!subscription) return '';

    const hasWeather = subscription.weather_alerts === true;
    const hasPiracy = subscription.piracy_alerts === true;
    const hasEventType = subscription.alert_type && subscription.alert_type !== 'none' && subscription.alert_type !== '';

    // Build the status text based on what's enabled
    const enabledItems = [];

    // Add event type if selected
    if (hasEventType) {
      switch (subscription.alert_type) {
        case 'all':
          enabledItems.push('All events');
          break;
        case 'position_update':
          enabledItems.push('Position updates');
          break;
        case 'departure':
          enabledItems.push('Departures');
          break;
        case 'arrival':
          enabledItems.push('Arrivals');
          break;
        default:
          break;
      }
    }

    // Add weather if enabled
    if (hasWeather) {
      enabledItems.push('Weather');
    }

    // Add piracy if enabled
    if (hasPiracy) {
      enabledItems.push('Piracy');
    }

    // Format the text
    if (enabledItems.length === 0) {
      return 'Alerts enabled';
    }

    return enabledItems.join(', ') + ' alerts enabled';
  };

  const handleDeleteAlert = async () => {
    if (!subscription) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Not logged in', {
          position: 'top-center',
          duration: 2000
        });
        setIsDeleting(false);
        return;
      }

      // Optimistically update UI
      setSubscription(null);

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

      setShowConfirmDelete(false);

      toast.success('Alert removed', {
        position: 'top-center',
        duration: 2000,
        icon: '✓',
        style: {
          background: '#ffffff',
          color: '#059669',
          padding: '8px 14px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)',
          border: '1px solid #d1fae5',
          fontSize: '13px',
          fontWeight: '500',
        }
      });

      // Notify parent to update sidebar
      if (onSubscriptionUpdate) {
        onSubscriptionUpdate();
      }

      // Refetch after a short delay to ensure backend is updated
      setTimeout(() => {
        checkSubscriptionStatus();
      }, 500);
    } catch (error) {
      console.error('Error:', error);
      // Revert optimistic update on error
      checkSubscriptionStatus();
      toast.error('Failed to remove alert', {
        position: 'top-center',
        duration: 2000,
        style: {
          background: '#ffffff',
          color: '#dc2626',
          padding: '8px 14px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)',
          border: '1px solid #fee2e2',
          fontSize: '13px',
          fontWeight: '500',
        }
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEnableAlerts = () => {
    onEnableAlerts();
  };

  const handleOptimizeRoute = () => {
    if (onOptimizeRoute) {
      onOptimizeRoute();
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 shadow-lg max-h-96 overflow-y-auto">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Navigation size={20} className="text-blue-600" />
            {vessel.name}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition">
            <X size={18} className="text-slate-600" />
          </button>
        </div>

        {/* Vessel Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-600 uppercase">IMO</span>
            <span className="text-sm font-mono text-slate-900">{vessel.imo_number}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-600 uppercase">Type</span>
            <span className="text-sm text-slate-900">{vessel.type || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-600 uppercase">Flag</span>
            <span className="text-sm font-bold text-blue-600">{vessel.flag || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-600 uppercase">Destination</span>
            <span className="text-sm text-slate-900">{vessel.destination || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-600 uppercase">Cargo</span>
            <span className="text-sm text-slate-900">{vessel.cargo_type || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-600 uppercase">Position</span>
            <span className="text-sm font-mono text-slate-900">
              {vessel.last_position_lat?.toFixed(3) || 'N/A'}°, {vessel.last_position_lon?.toFixed(3) || 'N/A'}°
            </span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Alert Status/Button */}
          {isLoading ? (
            <div className="col-span-2 px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-slate-600">Loading...</span>
            </div>
          ) : subscription ? (
            <div className="col-span-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Alert Active</p>
                  <p className="text-xs text-blue-700">
                    {getAlertStatusText()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleEnableAlerts}
                  className="p-2 hover:bg-blue-100 rounded-lg transition disabled:opacity-50"
                  title="Edit alert"
                >
                  <Edit size={16} className="text-blue-600" />
                </button>
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="p-2 hover:bg-blue-100 rounded-lg transition disabled:opacity-50"
                  title="Remove alert"
                  disabled={isDeleting}
                >
                  <Trash2 size={16} className="text-blue-600" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleEnableAlerts}
              className="col-span-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition flex items-center justify-center gap-2"
            >
              <Bell size={16} />
              Enable Alerts
            </button>
          )}

          {/* Route Optimization Button */}
          <button
            onClick={handleOptimizeRoute}
            className="col-span-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium text-sm transition flex items-center justify-center gap-2 shadow-md"
          >
            <Map size={16} />
            Optimize Route
          </button>
        </div>

        {/* Position History */}
        {track && track.length > 0 && (
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
              <TrendingUp size={16} className="text-blue-600" /> Position History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-2 px-2 text-slate-700 font-semibold">Time</th>
                    <th className="text-left py-2 px-2 text-slate-700 font-semibold">Lat</th>
                    <th className="text-left py-2 px-2 text-slate-700 font-semibold">Lon</th>
                    <th className="text-left py-2 px-2 text-slate-700 font-semibold">Speed</th>
                    <th className="text-left py-2 px-2 text-slate-700 font-semibold">Course</th>
                  </tr>
                </thead>
                <tbody>
                  {track.slice(0, 8).map((pos, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-1 px-2 text-xs">{new Date(pos.timestamp).toLocaleTimeString()}</td>
                      <td className="py-1 px-2 font-mono text-xs">{pos.latitude?.toFixed(4) || 'N/A'}°</td>
                      <td className="py-1 px-2 font-mono text-xs">{pos.longitude?.toFixed(4) || 'N/A'}°</td>
                      <td className="py-1 px-2">
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {pos.speed?.toFixed(2) || 'N/A'} kts
                        </span>
                      </td>
                      <td className="py-1 px-2 text-xs">{pos.course?.toFixed(1) || 'N/A'}°</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-6">
              <h3 className="font-bold text-white text-lg">Remove Alert?</h3>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700 text-sm">
                Remove alert for <span className="font-semibold">{vessel.name}</span>?
              </p>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowConfirmDelete(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAlert}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Removing...
                  </>
                ) : (
                  'Remove'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VesselDetailsPanel;