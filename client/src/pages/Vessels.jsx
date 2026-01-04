import React, { useState, useEffect } from 'react';
import { Anchor, MapPin, Ship, TrendingUp, RefreshCw, AlertCircle, Calendar, Clock } from 'lucide-react';
import VesselSearchFilter from '../components/VesselSearchFilter';

const VesselsPage = () => {
  const [allVessels, setAllVessels] = useState([]);
  const [filteredVessels, setFilteredVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [vesselStats, setVesselStats] = useState(null);
  const [vesselVoyages, setVesselVoyages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [refreshing, setRefreshing] = useState(false);

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

  // Load vessel details when selected
  useEffect(() => {
    if (selectedVessel) {
      loadVesselStats(selectedVessel.id);
      loadVesselVoyages(selectedVessel.id);
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

  const loadVesselVoyages = async (vesselId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      const response = await fetch(
        `${API_URL}/voyages/?vessel=${vesselId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to load voyages');
      
      const data = await response.json();
      const voyages = data.results || data || [];
      setVesselVoyages(voyages);
    } catch (error) {
      console.error('Error loading voyages:', error);
      setMessage({ type: 'error', text: 'Failed to load voyage history' });
    }
  };

  const manualRefresh = async () => {
    if (selectedVessel) {
      setRefreshing(true);
      await loadVesselStats(selectedVessel.id);
      await loadVesselVoyages(selectedVessel.id);
      setMessage({ type: 'success', text: 'Data refreshed' });
      setRefreshing(false);
    }
  };

  const handleFilterChange = (filtered) => {
    setFilteredVessels(filtered);
    // Clear selection if current vessel is filtered out
    if (selectedVessel && !filtered.find(v => v.id === selectedVessel.id)) {
      setSelectedVessel(filtered.length > 0 ? filtered[0] : null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
      in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
            disabled={!selectedVessel || refreshing}
            className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 transition ${
              refreshing 
                ? 'bg-blue-600' 
                : 'bg-blue-500 hover:bg-blue-600 disabled:opacity-50'
            }`}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> 
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {message.text && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-5 py-2 rounded-lg flex items-center gap-2 shadow-md z-50 bg-white text-black transition-all duration-300 ease-in-out ${
          message.text ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}>
          {message.type === 'error' ? (
            <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
          ) : (
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          <span className="font-medium text-sm">{message.text}</span>
        </div>
      )}

      {/* Search and Filter */}
      <VesselSearchFilter vessels={allVessels} onFiltersChange={handleFilterChange} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vessels List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col" style={{ maxHeight: '800px' }}>
            <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50 flex-shrink-0">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Ship size={18} className="text-blue-600" /> Vessels
              </h2>
            </div>
            <div 
              className="overflow-y-auto flex-1"
              style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              <style>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
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
        </div>

        {/* Details and Track */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col" style={{ maxHeight: '800px' }}>
            {selectedVessel ? (
              <div 
                className="overflow-y-auto"
                style={{ 
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                <style>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <div className="space-y-4 p-6">
              {/* Vessel Details Card */}
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200 p-6">
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
                <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg border border-slate-200 p-6">
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

              {/* Voyage History */}
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-gray-50">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-600" /> Voyage History
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  <style>{`
                    div::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  {vesselVoyages.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <Ship className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p>No voyage history available</p>
                    </div>
                  ) : (
                    vesselVoyages.map((voyage) => (
                      <div key={voyage.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(voyage.status)}`}>
                            {voyage.status_display}
                          </span>
                          <span className="text-sm text-slate-600 flex items-center gap-1">
                            <Clock size={14} />
                            {voyage.duration_days} days
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Departure</p>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-slate-900">{voyage.port_from_name}</p>
                                <p className="text-xs text-slate-500">{voyage.port_from_country}</p>
                                <p className="text-xs text-slate-500">{formatDate(voyage.departure_time)}</p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500 mb-1">Arrival</p>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-slate-900">{voyage.port_to_name}</p>
                                <p className="text-xs text-slate-500">{voyage.port_to_country}</p>
                                <p className="text-xs text-slate-500">{formatDate(voyage.arrival_time)}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {(voyage.entry_time || voyage.berthing_time || voyage.wait_time_hours) && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="text-xs font-medium text-slate-700 mb-2">Port Activity</p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              {voyage.entry_time && (
                                <div>
                                  <p className="text-slate-500">Entry</p>
                                  <p className="font-medium text-slate-900">{formatDate(voyage.entry_time)}</p>
                                </div>
                              )}
                              {voyage.berthing_time && (
                                <div>
                                  <p className="text-slate-500">Berthing</p>
                                  <p className="font-medium text-slate-900">{formatDate(voyage.berthing_time)}</p>
                                </div>
                              )}
                              {voyage.wait_time_hours !== null && voyage.wait_time_hours !== undefined && (
                                <div>
                                  <p className="text-slate-500">Wait Time</p>
                                  <p className="font-bold text-amber-600">{voyage.wait_time_hours.toFixed(1)}h</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-600">
                Select a vessel from the list to view details and tracking information
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VesselsPage;