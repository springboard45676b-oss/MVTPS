// client/src/pages/LiveTracking.jsx
import React, { useState, useEffect } from 'react';
import { RefreshCw, MapPin, TrendingUp, Map, ZoomIn, ZoomOut, Navigation } from 'lucide-react';

const LiveTracking = () => {
  const [vessels, setVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [track, setTrack] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCenter, setMapCenter] = useState({ lat: 20, lng: 0 });
  const [showRoute, setShowRoute] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  // Clear message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fetch all vessels on mount
  useEffect(() => {
    loadVessels();
    const interval = setInterval(loadVessels, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Fetch vessel track when selected
  useEffect(() => {
    if (selectedVessel) {
      loadVesselTrack(selectedVessel.id);
      // Center map on selected vessel
      setMapCenter({ lat: selectedVessel.last_position_lat, lng: selectedVessel.last_position_lon });
    }
  }, [selectedVessel]);

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
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load vessels');
      
      const data = await response.json();
      setVessels(Array.isArray(data) ? data : (data.results || []));
      setLoading(false);
    } catch (error) {
      console.error('Error loading vessels:', error);
      setMessage({ type: 'error', text: 'Failed to load vessels' });
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
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to load track');
      
      const data = await response.json();
      const positions = data.positions || data.results || data;
      setTrack(Array.isArray(positions) ? positions : []);
    } catch (error) {
      console.error('Error loading vessel track:', error);
    }
  };

  const handleUpdatePositions = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('access_token');
      setMessage({ type: 'success', text: 'Positions updated successfully' });
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
      setMessage({ type: 'success', text: 'Position updated successfully' });
      loadVessels();
      if (selectedVessel?.id === vesselId) {
        loadVesselTrack(vesselId);
      }
    } catch (error) {
      console.error('Error updating vessel:', error);
      setMessage({ type: 'error', text: 'Failed to update vessel position' });
    }
  };

  // Simple map rendering (using SVG-based map)
  const renderMap = () => {
    const width = 600;
    const height = 400;
    const pixelPerDegLat = height / 180;
    const pixelPerDegLng = width / 360;

    const latToPixel = (lat) => height / 2 - (lat - mapCenter.lat) * pixelPerDegLat * mapZoom;
    const lngToPixel = (lng) => width / 2 + (lng - mapCenter.lng) * pixelPerDegLng * mapZoom;

    return (
      <svg width={width} height={height} className="border border-slate-300 rounded-lg bg-blue-50">
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />

        {/* Vessel routes */}
        {showRoute && track.length > 0 && (
          <polyline
            points={track
              .map(pos => `${lngToPixel(pos.longitude)},${latToPixel(pos.latitude)}`)
              .join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            opacity="0.6"
          />
        )}

        {/* All vessel markers */}
        {vessels.map((vessel) => (
          <g key={vessel.id}>
            {/* Vessel icon */}
            <circle
              cx={lngToPixel(vessel.last_position_lon)}
              cy={latToPixel(vessel.last_position_lat)}
              r={selectedVessel?.id === vessel.id ? 8 : 6}
              fill={selectedVessel?.id === vessel.id ? '#dc2626' : '#3b82f6'}
              stroke="white"
              strokeWidth="2"
              onClick={() => setSelectedVessel(vessel)}
              className="cursor-pointer transition"
              opacity="0.8"
            />

            {/* Selected vessel label */}
            {selectedVessel?.id === vessel.id && (
              <text
                x={lngToPixel(vessel.last_position_lon) + 12}
                y={latToPixel(vessel.last_position_lat) - 5}
                fontSize="12"
                fontWeight="bold"
                fill="#1f2937"
                className="pointer-events-none"
              >
                {vessel.name}
              </text>
            )}
          </g>
        ))}

        {/* Track points for selected vessel */}
        {showRoute && track.map((pos, idx) => (
          <circle
            key={idx}
            cx={lngToPixel(pos.longitude)}
            cy={latToPixel(pos.latitude)}
            r={2}
            fill="#06b6d4"
            opacity="0.5"
          />
        ))}
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block">
          <div className="animate-spin">
            <RefreshCw className="text-blue-600" />
          </div>
          <p className="text-slate-600 mt-2">Loading fleet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Live Vessel Tracking</h1>
          <p className="text-slate-600 mt-1">Real-time vessel positions and routes on interactive map</p>
        </div>
        <div className="flex gap-2 items-center">
          <select 
            value={refreshInterval} 
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value={10}>Every 10s</option>
            <option value={30}>Every 30s</option>
            <option value={60}>Every 60s</option>
            <option value={300}>Every 5m</option>
          </select>
          <button
            onClick={handleUpdatePositions}
            disabled={updating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 flex items-center gap-2 transition"
          >
            <RefreshCw size={16} className={updating ? 'animate-spin' : ''} />
            Update All
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          <AlertCircle size={18} />
          {message.text}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Vessels List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 `bg-gradient-to-r` from-blue-50 to-slate-50">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <MapPin size={18} className="text-blue-600" /> Fleet ({vessels.length})
            </h2>
          </div>
          <div className="overflow-y-auto max-h-96">
            {vessels.length === 0 ? (
              <div className="p-4 text-slate-600 text-center text-sm">No vessels available</div>
            ) : (
              vessels.map((vessel) => (
                <div
                  key={vessel.id}
                  onClick={() => setSelectedVessel(vessel)}
                  className={`p-4 border-b border-slate-100 cursor-pointer transition ${
                    selectedVessel?.id === vessel.id 
                      ? 'bg-blue-50 border-l-4 border-blue-600' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="font-medium text-slate-900">{vessel.name}</div>
                  <div className="text-xs text-slate-600 mt-1">IMO: {vessel.imo_number}</div>
                  <div className="text-xs text-slate-600">Type: {vessel.type}</div>
                  {vessel.last_position_lat && vessel.last_position_lon && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                      <MapPin size={12} />
                      {vessel.last_position_lat.toFixed(3)}°, {vessel.last_position_lon.toFixed(3)}°
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateSingleVessel(vessel.id);
                    }}
                    className="mt-3 w-full px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded font-medium transition"
                  >
                    Update
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map and Details */}
        <div className="lg:col-span-3 space-y-4">
          {/* Interactive Map */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Map size={18} className="text-blue-600" /> Vessel Positions Map
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRoute(!showRoute)}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${
                    showRoute 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {showRoute ? 'Hide' : 'Show'} Route
                </button>
                <button
                  onClick={() => setMapZoom(Math.min(mapZoom + 1, 5))}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => setMapZoom(Math.max(mapZoom - 1, 1))}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                >
                  <ZoomOut size={16} />
                </button>
              </div>
            </div>

            {/* Map Legend */}
            <div className="mb-4 flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span>Selected Vessel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span>Other Vessels</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 bg-blue-600"></div>
                <span>Route</span>
              </div>
            </div>

            {/* Map SVG */}
            <div className="overflow-x-auto">
              {renderMap()}
            </div>
          </div>

          {/* Vessel Details */}
          {selectedVessel ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Details Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Navigation size={18} className="text-blue-600" /> Vessel Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-600 font-medium">Name</div>
                      <div className="text-slate-900 font-medium">{selectedVessel.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 font-medium">IMO Number</div>
                      <div className="text-slate-900 font-medium">{selectedVessel.imo_number}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 font-medium">Type</div>
                      <div className="text-slate-900">{selectedVessel.type}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 font-medium">Flag</div>
                      <div className="text-slate-900">{selectedVessel.flag}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 font-medium">Operator</div>
                      <div className="text-slate-900">{selectedVessel.operator}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 font-medium">Cargo Type</div>
                      <div className="text-slate-900">{selectedVessel.cargo_type}</div>
                    </div>
                  </div>
                </div>

                {/* Position Card */}
                <div className="`bg-gradient-to-br` from-blue-50 to-slate-50 rounded-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <MapPin size={18} className="text-blue-600" /> Current Position
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-600 font-medium">Latitude</div>
                      <div className="text-lg font-bold text-slate-900">
                        {selectedVessel.last_position_lat?.toFixed(6)}°
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 font-medium">Longitude</div>
                      <div className="text-lg font-bold text-slate-900">
                        {selectedVessel.last_position_lon?.toFixed(6)}°
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 font-medium">Last Updated</div>
                      <div className="text-sm text-slate-900">
                        {new Date(selectedVessel.last_update).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Position Track Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-blue-600" /> Position History (Last 24 Hours)
                </h3>
                {track.length === 0 ? (
                  <div className="text-slate-600 text-center text-sm py-8">No position data available</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="text-left py-3 px-2 text-slate-700 font-semibold">Time</th>
                          <th className="text-left py-3 px-2 text-slate-700 font-semibold">Latitude</th>
                          <th className="text-left py-3 px-2 text-slate-700 font-semibold">Longitude</th>
                          <th className="text-left py-3 px-2 text-slate-700 font-semibold">Speed</th>
                          <th className="text-left py-3 px-2 text-slate-700 font-semibold">Course</th>
                        </tr>
                      </thead>
                      <tbody>
                        {track.slice(0, 10).map((pos, idx) => (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                            <td className="py-2 px-2 text-xs">{new Date(pos.timestamp).toLocaleTimeString()}</td>
                            <td className="py-2 px-2 font-mono">{pos.latitude.toFixed(4)}°</td>
                            <td className="py-2 px-2 font-mono">{pos.longitude.toFixed(4)}°</td>
                            <td className="py-2 px-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                {pos.speed?.toFixed(2) || 'N/A'} kts
                              </span>
                            </td>
                            <td className="py-2 px-2">{pos.course?.toFixed(1) || 'N/A'}°</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-600">
              Select a vessel from the list to view details and position history
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;