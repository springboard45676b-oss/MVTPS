import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Filter, RefreshCw, MapPin, Anchor, Wind, Navigation, AlertCircle, Bell, Check, X, TrendingUp } from 'lucide-react';

const LoadingAnimation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes dash {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }

        .spinner-circle {
          animation: spin 3s linear infinite;
        }

        .pulse-ring {
          animation: pulse-ring 2s infinite;
        }

        .floating {
          animation: float 2s ease-in-out infinite;
        }

        .dash-circle {
          animation: dash 2s ease-in-out infinite;
        }
      `}</style>

      <div className="flex flex-col items-center gap-8">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 rounded-full pulse-ring border-4 border-blue-400"></div>
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120" style={{ filter: 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3))' }}>
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e0e7ff" strokeWidth="3" />
            <circle cx="60" cy="60" r="54" fill="none" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round" className="dash-circle" strokeDasharray="1000" />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 spinner-circle shadow-lg"></div>
          </div>
        </div>

        <div className="floating text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Loading Fleet Data</h2>
          <p className="text-slate-600">Connecting to database...</p>
        </div>

        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-blue-500" style={{ animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite` }}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Subscription Modal Component
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
        setMessage({ type: 'error', text: 'You must be logged in' });
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
      setMessage({
        type: 'success',
        text: data.is_active 
          ? `Subscribed to ${vessel.name} alerts` 
          : `Unsubscribed from ${vessel.name}`
      });
      
      if (onSubscriptionChange) {
        onSubscriptionChange();
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      setMessage({ type: 'error', text: 'Failed to update subscription' });
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
          {/* Subscription Status */}
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

          {/* Alert Type Selection */}
          {isSubscribed && (
            <div className="space-y-3">
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
                onClick={handleToggleSubscription}
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

const LiveTracking = () => {
  const [vessels, setVessels] = useState([]);
  const [filteredVessels, setFilteredVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [track, setTrack] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    types: [],
    flags: [],
    speedRange: [0, 30]
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  // Clear message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fetch all vessels on mount and setup auto-refresh
  useEffect(() => {
    loadVessels();
    const interval = setInterval(loadVessels, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Fetch vessel track when selected
  useEffect(() => {
    if (selectedVessel) {
      loadVesselTrack(selectedVessel.id);
    }
  }, [selectedVessel]);

  // Apply filters and search
  useEffect(() => {
    let filtered = vessels;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.imo_number && v.imo_number.includes(searchQuery))
      );
    }

    // Type filter
    if (filters.types.length > 0) {
      filtered = filtered.filter(v => filters.types.includes(v.type));
    }

    // Flag filter
    if (filters.flags.length > 0) {
      filtered = filtered.filter(v => filters.flags.includes(v.flag));
    }

    // Speed range filter
    filtered = filtered.filter(v =>
      (!v.speed || (v.speed >= filters.speedRange[0] && v.speed <= filters.speedRange[1]))
    );

    setFilteredVessels(filtered);
  }, [searchQuery, filters, vessels]);

  const toggleFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const clearFilters = () => {
    setFilters({ types: [], flags: [], speedRange: [0, 30] });
    setSearchQuery('');
  };

  const loadVessels = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setMessage({ type: 'error', text: 'You must be logged in' });
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/vessels/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to load vessels');
      
      const data = await response.json();
      const vesselList = Array.isArray(data) ? data : (data.results || []);
      
      // Filter vessels that have position data
      const vesselWithPositions = vesselList.filter(
        v => v.last_position_lat && v.last_position_lon
      );
      
      setVessels(vesselWithPositions);
      setLoading(false);
    } catch (error) {
      console.error('Error loading vessels:', error);
      setMessage({ type: 'error', text: 'Failed to load vessels from database' });
      setLoading(false);
    }
  };

  const loadVesselTrack = async (vesselId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_URL}/vessels/${vesselId}/positions/?hours=24`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to load track');
      
      const data = await response.json();
      const positions = data.positions || data.results || data;
      
      // Ensure positions are sorted by timestamp (oldest first)
      const sortedPositions = Array.isArray(positions)
        ? positions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        : [];
      
      setTrack(sortedPositions);
    } catch (error) {
      console.error('Error loading vessel track:', error);
      setMessage({ type: 'error', text: 'Failed to load position history' });
    }
  };

  const handleUpdatePositions = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // Update all vessels with random positions
      for (const vessel of vessels) {
        const latitude = 20 + Math.random() * 40;
        const longitude = -180 + Math.random() * 360;
        const speed = Math.random() * 20;
        const course = Math.random() * 360;

        await fetch(`${API_URL}/vessels/${vessel.id}/update-position/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            latitude,
            longitude,
            speed,
            course,
            source: 'api'
          })
        });
      }
      
      setMessage({ type: 'success', text: 'Positions updated successfully - Alerts created!' });
      loadVessels();
    } catch (error) {
      console.error('Error updating positions:', error);
      setMessage({ type: 'error', text: 'Failed to update positions' });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateSingleVessel = async (vesselId) => {
    try {
      const token = localStorage.getItem('access_token');
      
      const latitude = 20 + Math.random() * 40;
      const longitude = -180 + Math.random() * 360;
      const speed = Math.random() * 20;
      const course = Math.random() * 360;

      const response = await fetch(`${API_URL}/vessels/${vesselId}/update-position/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          latitude,
          longitude,
          speed,
          course,
          source: 'api'
        })
      });

      if (!response.ok) throw new Error('Failed to update vessel');
      
      setMessage({ type: 'success', text: 'Vessel position updated - Alert created!' });
      loadVessels();
      if (selectedVessel?.id === vesselId) {
        loadVesselTrack(vesselId);
      }
    } catch (error) {
      console.error('Error updating vessel:', error);
      setMessage({ type: 'error', text: 'Failed to update vessel position' });
    }
  };

  // Custom ship marker icon with rotation based on course
  const VesselMarkerIcon = (course = 0, isSelected = false) => {
    const size = isSelected ? 50 : 40;
    const courseAngle = course || 0;
    return divIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${isSelected ? '#dc2626' : '#3b82f6'};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          font-size: 24px;
          transform: rotate(${courseAngle}deg);
          transition: all 0.2s;
        ">⛴️</div>
      `,
      className: '',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    });
  };

  // Calculate map center from all filtered vessels
  const mapCenter = filteredVessels.length > 0
    ? {
        lat: filteredVessels.reduce((sum, v) => sum + v.last_position_lat, 0) / filteredVessels.length,
        lng: filteredVessels.reduce((sum, v) => sum + v.last_position_lon, 0) / filteredVessels.length
      }
    : { lat: 20, lng: 0 };

  // Track route for selected vessel
  const routeCoordinates = track.length > 0
    ? track.map(pos => [pos.latitude, pos.longitude])
    : [];

  const uniqueTypes = [...new Set(vessels.map(v => v.type).filter(Boolean))].sort();
  const uniqueFlags = [...new Set(vessels.map(v => v.flag).filter(Boolean))].sort();

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="flex h-screen bg-slate-100">
      <style>{`
        .leaflet-container {
          z-index: 0 !important;
        }
        .leaflet-popup {
          z-index: 10 !important;
        }
        .leaflet-control {
          z-index: 5 !important;
        }
      `}</style>

      {/* Left Sidebar - Filter Panel */}
      <div className="w-80 bg-white shadow-lg flex flex-col border-r border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Anchor size={28} />
            MaritimeTrack
          </h1>
          <p className="text-blue-100 text-sm mt-1">Live Vessel Tracking</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Message */}
          {message.text && (
            <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
              message.type === 'error'
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}>
              <AlertCircle size={16} />
              {message.text}
            </div>
          )}

          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Search</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Vessel name or IMO..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Refresh Settings */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Auto-Refresh</label>
            <select 
              value={refreshInterval} 
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>Every 10s</option>
              <option value={30}>Every 30s</option>
              <option value={60}>Every 60s</option>
              <option value={300}>Every 5m</option>
            </select>
          </div>

          {/* Update Button */}
          <button
            onClick={handleUpdatePositions}
            disabled={updating}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 flex items-center justify-center gap-2 transition font-medium"
          >
            <RefreshCw size={16} className={updating ? 'animate-spin' : ''} />
            {updating ? 'Updating...' : 'Update All Positions'}
          </button>

          {/* Filter Section */}
          <div className="space-y-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-slate-900 font-semibold text-sm"
            >
              <span className="flex items-center gap-2">
                <Filter size={16} />
                Filters
              </span>
              <span className={`transform transition ${showFilters ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {showFilters && (
              <>
                {/* Vessel Type Filter */}
                {uniqueTypes.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">
                      Vessel Type
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {uniqueTypes.map(type => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.types.includes(type)}
                            onChange={() => toggleFilter('types', type)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 group-hover:text-slate-900">{type}</span>
                          <span className="text-xs text-slate-500 ml-auto">
                            ({vessels.filter(v => v.type === type).length})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flag Filter */}
                {uniqueFlags.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">
                      Flag State
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {uniqueFlags.map(flag => (
                        <label key={flag} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.flags.includes(flag)}
                            onChange={() => toggleFilter('flags', flag)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700">{flag}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Speed Range Filter */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">
                    Speed Range (knots)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={filters.speedRange[0]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        speedRange: [Number(e.target.value), prev.speedRange[1]]
                      }))}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-sm"
                    />
                    <span className="text-slate-600 text-sm">to</span>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={filters.speedRange[1]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        speedRange: [prev.speedRange[0], Number(e.target.value)]
                      }))}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-sm"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  className="w-full px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition"
                >
                  Clear Filters
                </button>
              </>
            )}
          </div>

          {/* Vessels List */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900 px-1">
              Fleet ({filteredVessels.length})
            </h3>
            {filteredVessels.length === 0 ? (
              <div className="text-center py-8 text-slate-600 text-sm">No vessels match your filters</div>
            ) : (
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {filteredVessels.map(vessel => (
                  <div
                    key={vessel.id}
                    onClick={() => setSelectedVessel(vessel)}
                    className={`p-3 rounded-lg cursor-pointer transition ${
                      selectedVessel?.id === vessel.id
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-900'
                    }`}
                  >
                    <div className="font-semibold text-sm">{vessel.name}</div>
                    <div className={`text-xs ${selectedVessel?.id === vessel.id ? 'opacity-90' : 'opacity-75'} mt-1 space-y-0.5`}>
                      <div>IMO: {vessel.imo_number}</div>
                      <div>Type: {vessel.type || 'N/A'}</div>
                      <div>Flag: {vessel.flag || 'N/A'}</div>
                      <div>Dest: {vessel.destination || 'N/A'}</div>
                      {vessel.speed && <div>Speed: {vessel.speed.toFixed(1)} kn</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-600 text-center">
          {filteredVessels.length} of {vessels.length} vessels shown
        </div>
      </div>

      {/* Right Side - Map and Details */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Interactive Leaflet Map */}
        <div className="flex-1 relative bg-white">
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={4}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            className="leaflet-container"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {/* All vessel markers */}
            {filteredVessels.map(vessel => (
              <React.Fragment key={vessel.id}>
                <Marker
                  position={[vessel.last_position_lat, vessel.last_position_lon]}
                  icon={VesselMarkerIcon(vessel.course, selectedVessel?.id === vessel.id)}
                  eventHandlers={{
                    click: () => setSelectedVessel(vessel)
                  }}
                >
                  <Popup>
                    <div className="w-64 text-sm">
                      <div className="font-bold text-lg mb-3 text-blue-600">{vessel.name}</div>
                      <div className="space-y-2 text-slate-700">
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-semibold">MMSI:</span>
                          <span className="font-mono">{vessel.imo_number}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-semibold">Type:</span>
                          <span>{vessel.type || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-semibold">Flag:</span>
                          <span>{vessel.flag || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-semibold">Speed:</span>
                          <span className="font-semibold text-blue-600">{vessel.speed?.toFixed(1) || 'N/A'} km</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-semibold">Course:</span>
                          <span>{vessel.course?.toFixed(0) || 'N/A'}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Destination:</span>
                          <span>{vessel.destination || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}

            {/* Route line for selected vessel */}
            {routeCoordinates.length > 1 && (
              <Polyline
                positions={routeCoordinates}
                color="#3b82f6"
                weight={2}
                opacity={0.6}
              />
            )}
          </MapContainer>
        </div>

        {/* Vessel Details Panel */}
        {selectedVessel ? (
          <div className="bg-white border-t border-slate-200 shadow-lg max-h-96 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Navigation size={20} className="text-blue-600" />
                  {selectedVessel.name}
                </h2>
                <button
                  onClick={() => setSelectedVessel(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition"
                >
                  <X size={18} className="text-slate-600" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-600 uppercase">IMO</span>
                  <span className="text-sm font-mono text-slate-900">{selectedVessel.imo_number}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Type</span>
                  <span className="text-sm text-slate-900">{selectedVessel.type || 'N/A'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Flag</span>
                  <span className="text-sm font-bold text-blue-600">{selectedVessel.flag || 'N/A'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Destination</span>
                  <span className="text-sm text-slate-900">{selectedVessel.destination || 'N/A'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Cargo Type</span>
                  <span className="text-sm text-slate-900">{selectedVessel.cargo_type || 'N/A'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Position</span>
                  <span className="text-sm font-mono text-slate-900">{selectedVessel.last_position_lat.toFixed(3)}°, {selectedVessel.last_position_lon.toFixed(3)}°</span>
                </div>
              </div>

              {/* Subscription Button */}
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition flex items-center justify-center gap-2 mb-4"
              >
                <Bell size={16} />
                Enable Alerts
              </button>

              {/* Position History Table */}
              {track.length > 0 && (
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
          </div>
        ) : (
          <div className="bg-white border-t border-slate-200 p-8 text-center text-slate-600 flex items-center justify-center">
            Select a vessel from the fleet to view details and position history
          </div>
        )}
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && selectedVessel && (
        <SubscriptionModal
          vessel={selectedVessel}
          onClose={() => setShowSubscriptionModal(false)}
          onSubscriptionChange={loadVessels}
        />
      )}
    </div>
  );
};

export default LiveTracking;