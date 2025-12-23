// src/components/VesselDetailsPanel.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Navigation, TrendingUp, Bell, X, Trash2, CheckCircle } from 'lucide-react';

const VesselDetailsPanel = ({ vessel, track, onEnableAlerts, onClose }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    checkSubscriptionStatus();
  }, [vessel]);

  // Recheck subscription status when component updates
  useEffect(() => {
    const interval = setInterval(() => {
      checkSubscriptionStatus();
    }, 500);
    return () => clearInterval(interval);
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
        setAlertType('');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleDeleteAlert = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('You must be logged in');
        setIsDeleting(false);
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
      setAlertType('');
      setShowConfirmDelete(false);

      // Show success toast
      toast.custom(
        (t) => (
          <div className="bg-white rounded-sm shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 gap-4">
              <p className="text-gray-800 text-sm">
                <span className="font-bold">Alert Removed</span> from <span className="font-semibold">{vessel.name}</span>
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
    } catch (error) {
      console.error('Error removing alert:', error);
      toast.error('Failed to remove alert');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 shadow-lg max-h-96 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Navigation size={20} className="text-blue-600" />
            {vessel.name}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={18} className="text-slate-600" />
          </button>
        </div>

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
            <span className="text-xs font-semibold text-slate-600 uppercase">Cargo Type</span>
            <span className="text-sm text-slate-900">{vessel.cargo_type || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-600 uppercase">Position</span>
            <span className="text-sm font-mono text-slate-900">
              {vessel.last_position_lat.toFixed(3)}°, {vessel.last_position_lon.toFixed(3)}°
            </span>
          </div>
        </div>

        {/* Alert Status or Button */}
        {isSubscribed ? (
          <div className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-lg mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle size={18} className="text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-900">Alert Active</p>
                <p className="text-xs text-red-700">Type: {alertType.replace('_', ' ').toUpperCase()}</p>
              </div>
            </div>
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="ml-2 p-1 hover:bg-red-100 rounded transition"
              title="Remove alert"
            >
              <Trash2 size={16} className="text-red-600" />
            </button>
          </div>
        ) : (
          <button
            onClick={onEnableAlerts}
            className="w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition flex items-center justify-center gap-2 mb-4"
          >
            <Bell size={16} />
            Enable Alerts
          </button>
        )}

        {/* Position History Table */}
        {track && track.length > 0 && (
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
              <TrendingUp size={16} className="text-blue-600" /> Position History (Last 24 Hours)
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
                      <td className="py-1 px-2 font-mono text-xs">{pos.latitude.toFixed(4)}°</td>
                      <td className="py-1 px-2 font-mono text-xs">{pos.longitude.toFixed(4)}°</td>
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
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-6">
              <h3 className="font-bold text-white text-lg">Remove Alert?</h3>
              <p className="text-red-100 text-sm mt-1">This action cannot be undone</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-gray-700 text-sm">
                Are you sure you want to remove the alert for <span className="font-semibold">{vessel.name}</span>?
              </p>
              <p className="text-gray-600 text-xs bg-gray-50 p-3 rounded-lg">
                You will no longer receive notifications about this vessel.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowConfirmDelete(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAlert}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Yes, Remove
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default VesselDetailsPanel;