// client/src/pages/Vessels.jsx - Updated with destination field
import React, { useState, useEffect, useRef } from 'react';
import { Anchor, MapPin, Ship, TrendingUp, RefreshCw, Zap, AlertCircle } from 'lucide-react';
import VesselSearchFilter from '../components/VesselSearchFilter';

// Beautiful Loading Animation Component
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
        {/* Main circular loader */}
        <div className="relative w-32 h-32">
          {/* Outer pulsing ring */}
          <div className="absolute inset-0 rounded-full pulse-ring border-4 border-blue-400"></div>

          {/* SVG circular progress */}
          <svg
            className="w-32 h-32 -rotate-90"
            viewBox="0 0 120 120"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3))' }}
          >
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#e0e7ff"
              strokeWidth="3"
            />
            {/* Animated circle */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              className="dash-circle"
              strokeDasharray="1000"
            />
            <defs>
              <linearGradient
                id="gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Inner spinning dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 spinner-circle shadow-lg"></div>
          </div>
        </div>

        {/* Text content */}
        <div className="floating text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Loading Fleet Data
          </h2>
          <p className="text-slate-600">Connecting to database...</p>
        </div>

        {/* Animated dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-500"
              style={{
                animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const VesselsPage = () => {
  const [allVessels, setAllVessels] = useState([]);
  const [filteredVessels, setFilteredVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [track, setTrack] = useState([]);
  const [vesselStats, setVesselStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [generating, setGenerating] = useState(false);
  const refreshIntervalRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  // Clear message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Load vessels on mount
  useEffect(() => {
    loadVessels();
  }, []);

  // Auto-refresh selected vessel data
  useEffect(() => {
    if (!autoRefresh || !selectedVessel) return;

    refreshIntervalRef.current = setInterval(() => {
      loadVesselTrack(selectedVessel.id);
      loadVesselStats(selectedVessel.id);
    }, 10000); // Refresh every 10 seconds

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, selectedVessel]);

  // Load vessel details when selected
  useEffect(() => {
    if (selectedVessel) {
      loadVesselTrack(selectedVessel.id);
      loadVesselStats(selectedVessel.id);
    }
  }, [selectedVessel?.id]);

  const loadVessels = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setMessage({ type: 'error', text: 'You must be logged in to view vessels' });
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${API_URL}/vessels/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      const vesselList = Array.isArray(data) ? data : (data.results || []);
      setAllVessels(vesselList);
      setFilteredVessels(vesselList);
      
      // Auto-select first vessel
      if (vesselList.length > 0 && !selectedVessel) {
        setSelectedVessel(vesselList[0]);
      }
    } catch (error) {
      console.error('Error loading vessels:', error);
      setMessage({ type: 'error', text: 'Failed to load vessels' });
    } finally {
      setLoading(false);
    }
  };

  const loadVesselTrack = async (vesselId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      const hours = 24;
      const response = await fetch(
        `${API_URL}/vessels/${vesselId}/positions/?hours=${hours}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to load positions');
      
      const data = await response.json();
      
      // Handle both paginated and direct response
      const positions = data.positions || data.results || data;
      setTrack(Array.isArray(positions) ? positions : []);
    } catch (error) {
      console.error('Error loading track:', error);
      setMessage({ type: 'error', text: 'Failed to load position history' });
    }
  };

  const loadVesselStats = async (vesselId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      const response = await fetch(
        `${API_URL}/vessels/${vesselId}/stats/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to load stats');
      
      const data = await response.json();
      setVesselStats(data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const generateMockData = async () => {
    try {
      setGenerating(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setMessage({ type: 'error', text: 'You must be logged in' });
        setGenerating(false);
        return;
      }
      
      const response = await fetch(`${API_URL}/generate-realistic-mock-data/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ num_vessels: 5 })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate mock data');
      }
      
      const data = await response.json();
      setMessage({ 
        type: 'success', 
        text: `Generated ${data.vessels.length} vessels with realistic routes` 
      });
      
      await loadVessels();
    } catch (error) {
      console.error('Error generating mock data:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to generate mock data' });
    } finally {
      setGenerating(false);
    }
  };

  const manualRefresh = async () => {
    if (selectedVessel) {
      await loadVesselTrack(selectedVessel.id);
      await loadVesselStats(selectedVessel.id);
      setMessage({ type: 'success', text: 'Data refreshed' });
    }
  };

  const handleFilterChange = (filtered) => {
    setFilteredVessels(filtered);
    // Clear selection if current vessel is filtered out
    if (selectedVessel && !filtered.find(v => v.id === selectedVessel.id)) {
      setSelectedVessel(filtered.length > 0 ? filtered[0] : null);
    }
  };

  // Use beautiful loading animation
  if (loading && allVessels.length === 0) {
    return <LoadingAnimation />;
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Fleet Management</h1>
          <p className="text-slate-600 mt-1">Search, filter, and monitor your vessel fleet in real-time</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={manualRefresh}
            disabled={!selectedVessel}
            className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 flex items-center gap-2 transition"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            onClick={generateMockData}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition"
          >
            <Zap size={16} /> {generating ? 'Generating...' : 'Generate Data'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center gap-2 transition ${
          message.type === 'error' 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          <AlertCircle size={18} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Auto-Refresh Toggle */}
      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <input
          type="checkbox"
          id="autoRefresh"
          checked={autoRefresh}
          onChange={(e) => setAutoRefresh(e.target.checked)}
          className="w-4 h-4 cursor-pointer"
        />
        <label htmlFor="autoRefresh" className="text-sm text-slate-700 cursor-pointer">
          Auto-refresh every 10 seconds {autoRefresh && <span className="ml-2 text-green-600">●</span>}
        </label>
      </div>

      {/* Search and Filter */}
      <VesselSearchFilter vessels={allVessels} onFiltersChange={handleFilterChange} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vessels List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Ship size={18} className="text-blue-600" /> Results ({filteredVessels.length})
            </h2>
          </div>
          <div className="overflow-y-auto max-h-96">
            {filteredVessels.length === 0 ? (
              <div className="p-4 text-slate-600 text-sm text-center py-8">
                <p>No vessels found</p>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              filteredVessels.map((vessel) => (
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
                  <div className="text-xs text-slate-600">Flag: {vessel.flag}</div>
                  <div className="text-xs text-blue-600 font-medium">Dest: {vessel.destination || 'N/A'}</div>
                  {vessel.last_position_lat && vessel.last_position_lon && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                      <MapPin size={12} />
                      {vessel.last_position_lat.toFixed(3)}°, {vessel.last_position_lon.toFixed(3)}°
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Details and Track */}
        <div className="lg:col-span-2 space-y-4">
          {selectedVessel ? (
            <>
              {/* Vessel Details Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Anchor size={18} className="text-blue-600" /> Vessel Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-600">Name</div>
                    <div className="font-medium text-slate-900">{selectedVessel.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">IMO Number</div>
                    <div className="font-medium text-slate-900">{selectedVessel.imo_number}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Type</div>
                    <div className="font-medium text-slate-900">{selectedVessel.type}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Flag</div>
                    <div className="font-medium text-slate-900">{selectedVessel.flag}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Cargo Type</div>
                    <div className="font-medium text-slate-900">{selectedVessel.cargo_type}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Operator</div>
                    <div className="font-medium text-slate-900">{selectedVessel.operator}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Destination</div>
                    <div className="font-medium text-blue-600">{selectedVessel.destination || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Current Position</div>
                    <div className="font-medium text-slate-900">
                      {selectedVessel.last_position_lat?.toFixed(4)}°N, {selectedVessel.last_position_lon?.toFixed(4)}°E
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-slate-600">Last Updated</div>
                    <div className="font-medium text-slate-900">
                      {new Date(selectedVessel.last_update).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Card */}
              {vesselStats && (
                <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-blue-600" /> Movement Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <div className="text-xs text-slate-600">Average Speed</div>
                      <div className="text-xl font-bold text-slate-900">{vesselStats.avg_speed} kts</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <div className="text-xs text-slate-600">Max Speed</div>
                      <div className="text-xl font-bold text-green-600">{vesselStats.max_speed} kts</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <div className="text-xs text-slate-600">Min Speed</div>
                      <div className="text-xl font-bold text-orange-600">{vesselStats.min_speed} kts</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <div className="text-xs text-slate-600">Position Points</div>
                      <div className="text-xl font-bold text-slate-900">{vesselStats.total_positions}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Position Track */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-blue-600" /> Position History (Last 24 Hours)
                </h3>
                {track.length === 0 ? (
                  <div className="text-slate-600 text-sm text-center py-8">No position data available</div>
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
                        {track.slice(0, 12).map((pos, idx) => (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                            <td className="py-2 px-2 text-xs font-mono text-slate-600">
                              {new Date(pos.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="py-2 px-2 font-mono text-slate-900">{pos.latitude.toFixed(4)}°</td>
                            <td className="py-2 px-2 font-mono text-slate-900">{pos.longitude.toFixed(4)}°</td>
                            <td className="py-2 px-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                {pos.speed?.toFixed(2) || 'N/A'} kts
                              </span>
                            </td>
                            <td className="py-2 px-2 text-slate-900">{pos.course?.toFixed(1) || 'N/A'}°</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {track.length > 12 && (
                      <div className="text-center py-2 text-xs text-slate-500">
                        Showing 12 of {track.length} records
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-600">
              Select a vessel from the results to view details and tracking information
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VesselsPage;