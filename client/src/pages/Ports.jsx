import React, { useState, useEffect } from 'react';
import { Anchor, MapPin, AlertCircle, TrendingUp, TrendingDown, Clock, RefreshCw, Activity, Search, X, ChevronDown, Filter } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 backdrop-blur-sm ${
        type === 'success' 
          ? 'bg-white/95 text-gray-800' 
          : 'bg-red-50/95 text-red-800'
      }`}>
        {type === 'success' && (
          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {type === 'error' && (
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        <span className="font-medium text-sm">{message}</span>
      </div>
    </div>
  );
};

const Ports = () => {
  const [ports, setPorts] = useState([]);
  const [filteredPorts, setFilteredPorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [congestionFilter, setCongestionFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [portDetails, setPortDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [toast, setToast] = useState(null);

  const API_URL = 'http://127.0.0.1:8000/api';

  const showToast = (message, type = 'success') => {
    setToast(null);
    setTimeout(() => {
      setToast({ message, type });
    }, 10);
  };

  const handleRefresh = async () => {
    setLoading(true);
    await loadPorts();
    showToast('Ports data refreshed successfully');
  };

  useEffect(() => {
    loadPorts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, congestionFilter, countryFilter, ports]);

  const loadPorts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        showToast('You must be logged in', 'error');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/ports/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to load ports');

      const data = await response.json();
      const portsList = data.results || data || [];
      
      setPorts(portsList);
      setStatistics(data.statistics);
      setLoading(false);
    } catch (error) {
      console.error('Error loading ports:', error);
      showToast('Failed to load ports', 'error');
      setLoading(false);
    }
  };

  const loadPortDetails = async (portId) => {
    setLoadingDetails(true);
    try {
      const token = localStorage.getItem('access_token');
      // FIXED: Changed from /ports/${portId}/statistics/ to /ports/${portId}/
      const response = await fetch(`${API_URL}/ports/${portId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to load port details');

      const data = await response.json();
      // FIXED: Extract statistics from response
      setPortDetails(data.statistics);
      setLoadingDetails(false);
    } catch (error) {
      console.error('Error loading port details:', error);
      showToast('Failed to load port details', 'error');
      setLoadingDetails(false);
    }
  };

  const applyFilters = () => {
    let filtered = ports;

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(port =>
        port.name.toLowerCase().includes(searchLower) ||
        port.country.toLowerCase().includes(searchLower) ||
        port.location.toLowerCase().includes(searchLower)
      );
    }

    if (congestionFilter !== 'all') {
      filtered = filtered.filter(port => {
        const level = getCongestionLevel(port.congestion_score);
        return level === congestionFilter;
      });
    }

    if (countryFilter !== 'all') {
      filtered = filtered.filter(port => port.country === countryFilter);
    }

    setFilteredPorts(filtered);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCongestionFilter('all');
    setCountryFilter('all');
  };

  const activeFilterCount = [congestionFilter !== 'all', countryFilter !== 'all'].filter(Boolean).length;

  const getCongestionLevel = (score) => {
    if (score < 3) return 'low';
    if (score < 6) return 'moderate';
    if (score < 8) return 'high';
    return 'critical';
  };

  const getCongestionColor = (score) => {
    const level = getCongestionLevel(score);
    const colors = {
      low: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      moderate: 'text-amber-700 bg-amber-50 border-amber-200',
      high: 'text-orange-700 bg-orange-50 border-orange-200',
      critical: 'text-red-700 bg-red-50 border-red-200'
    };
    return colors[level];
  };

  const getCongestionIcon = (score) => {
    const level = getCongestionLevel(score);
    const icons = {
      low: Activity,
      moderate: AlertCircle,
      high: AlertCircle,
      critical: AlertCircle
    };
    return icons[level];
  };

  const handlePortSelect = (port) => {
    setSelectedPort(port);
    loadPortDetails(port.id);
  };

  const uniqueCountries = [...new Set(ports.map(p => p.country))].sort();

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Port Management</h1>
          <p className="mt-2 text-gray-600">Monitor port congestion levels and traffic statistics</p>
        </div>

        {/* Statistics Cards - NOW WITH 5 CARDS */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Ports</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{ports.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Anchor className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Congestion</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.congestion_levels?.low || 0}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Moderate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.congestion_levels?.moderate || 0}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.congestion_levels?.high || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.congestion_levels?.critical || 0}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by port name, location, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
                isFilterOpen
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter size={18} />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-white text-blue-600 text-xs font-bold rounded-full">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                size={18}
                className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 transition ${
                loading 
                  ? 'bg-blue-600' 
                  : 'bg-blue-500 hover:bg-blue-600 disabled:opacity-50'
              }`}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isFilterOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  Filter Ports
                  {activeFilterCount > 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      {activeFilterCount} active
                    </span>
                  )}
                </h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Reset All
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Congestion Level
                  </label>
                  <select
                    value={congestionFilter}
                    onChange={(e) => setCongestionFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="all">All Levels</option>
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="all">All Countries</option>
                    {uniqueCountries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                >
                  Close
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ports List - FULL SCROLLABLE */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col" style={{ minHeight: '800px', maxHeight: '1000px' }}>
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900">Ports</h2>
              </div>

              {/* SCROLLABLE CONTAINER WITH HIDDEN SCROLLBAR */}
              <div 
                className="divide-y divide-gray-200 overflow-y-auto flex-1"
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
                
                {filteredPorts.map(port => {
                  const CongestionIcon = getCongestionIcon(port.congestion_score);
                  return (
                    <div
                      key={port.id}
                      className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                        selectedPort?.id === port.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handlePortSelect(port)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Anchor className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{port.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{port.location}, {port.country}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${getCongestionColor(port.congestion_score)}`}>
                            <CongestionIcon className="w-3.5 h-3.5" />
                            {getCongestionLevel(port.congestion_score).toUpperCase()}
                          </span>
                          <span className="text-lg font-bold text-gray-900">{port.congestion_score.toFixed(1)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-600">Wait Time</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">{port.avg_wait_time?.toFixed(1) || 0}h</p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs text-gray-600">Arrivals</span>
                          </div>
                          <p className="text-lg font-semibold text-emerald-700">{port.arrivals || 0}</p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="text-xs text-gray-600">Departures</span>
                          </div>
                          <p className="text-lg font-semibold text-blue-700">{port.departures || 0}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredPorts.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Anchor className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No ports found matching your filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Port Details Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Port Details</h2>
              </div>

              <div className="p-6">
                {!selectedPort ? (
                  <div className="text-center py-12 text-gray-500">
                    <Anchor className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Select a port to view details</p>
                  </div>
                ) : loadingDetails ? (
                  <div className="text-center py-12 text-gray-500">
                    <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p>Loading details...</p>
                  </div>
                ) : portDetails ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedPort.name}</h3>
                      <div className="flex items-center gap-2 mt-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{selectedPort.location}, {selectedPort.country}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-4">Congestion Status</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Score</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {portDetails.congestion?.score?.toFixed(1) || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Level</p>
                          <p className="text-sm font-semibold text-gray-900 capitalize">
                            {portDetails.congestion?.level || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Wait Time</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {portDetails.congestion?.avg_wait_time_hours?.toFixed(1) || 0}h
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-4">Traffic Statistics</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-gray-600 mb-2">Total Traffic</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded">
                              <p className="text-xs text-gray-600">Arrivals</p>
                              <p className="text-lg font-bold text-emerald-700">{portDetails.traffic?.total?.arrivals || 0}</p>
                            </div>
                            <div className="bg-white p-3 rounded">
                              <p className="text-xs text-gray-600">Departures</p>
                              <p className="text-lg font-bold text-blue-700">{portDetails.traffic?.total?.departures || 0}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-600 mb-2">Last 30 Days</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded">
                              <p className="text-xs text-gray-600">Arrivals</p>
                              <p className="text-lg font-bold text-emerald-700">{portDetails.traffic?.last_30_days?.arrivals || 0}</p>
                            </div>
                            <div className="bg-white p-3 rounded">
                              <p className="text-xs text-gray-600">Departures</p>
                              <p className="text-lg font-bold text-blue-700">{portDetails.traffic?.last_30_days?.departures || 0}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-600 mb-2">Current Activity</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded">
                              <p className="text-xs text-gray-600">Incoming</p>
                              <p className="text-lg font-bold text-blue-700">{portDetails.traffic?.current_activity?.incoming_vessels || 0}</p>
                            </div>
                            <div className="bg-white p-3 rounded">
                              <p className="text-xs text-gray-600">Outgoing</p>
                              <p className="text-lg font-bold text-emerald-700">{portDetails.traffic?.current_activity?.outgoing_vessels || 0}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-4">Performance Metrics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Completed Arrivals</p>
                          <p className="text-xl font-bold text-gray-900">
                            {portDetails.performance?.completed_arrivals || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Turnover Rate</p>
                          <p className="text-xl font-bold text-gray-900">
                            {portDetails.performance?.turnover_rate || 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ports;