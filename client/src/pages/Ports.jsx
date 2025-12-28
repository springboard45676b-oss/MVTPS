import React, { useState, useEffect } from 'react';
import { Anchor, MapPin, AlertCircle, TrendingUp, TrendingDown, Clock, RefreshCw, Activity } from 'lucide-react';

// Toast Component
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300">
      <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
        type === 'success' 
          ? 'bg-white text-gray-800 border border-gray-200' 
          : 'bg-red-50 text-red-800 border border-red-200'
      }`}>
        {type === 'success' && (
          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {type === 'error' && (
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};

const Ports = () => {
  const [ports, setPorts] = useState([]);
  const [filteredPorts, setFilteredPorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState(null);
  const [loading, setLoading] = useState(true);
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
      setTimeout(() => setToast(null), 3000);
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
      
      // Only show toast if ports were actually loaded (not on initial silent load)
      if (portsList.length > 0) {
        // Don't show success toast on initial load, only on refresh
      }
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
      const response = await fetch(`${API_URL}/ports/${portId}/statistics/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to load port details');

      const data = await response.json();
      setPortDetails(data);
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
      filtered = filtered.filter(port =>
        port.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        port.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        port.location.toLowerCase().includes(searchQuery.toLowerCase())
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading ports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Port Management</h1>
          <p className="mt-2 text-gray-600">Monitor port congestion levels and traffic statistics</p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Congestion</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.congestion_levels.low}</p>
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
                  <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.congestion_levels.moderate}</p>
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
                  <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.congestion_levels.high}</p>
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
                  <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.congestion_levels.critical}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by port name, location, or country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                <svg className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {isFilterOpen && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Filter Ports</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Congestion Level
                    </label>
                    <select
                      value={congestionFilter}
                      onChange={(e) => setCongestionFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Countries</option>
                      {uniqueCountries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      applyFilters();
                      setIsFilterOpen(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ports List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">
                  Ports ({filteredPorts.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
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
                          <p className="text-lg font-semibold text-gray-900">{port.avg_wait_time.toFixed(1)}h</p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs text-gray-600">Arrivals</span>
                          </div>
                          <p className="text-lg font-semibold text-emerald-700">{port.arrivals}</p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="text-xs text-gray-600">Departures</span>
                          </div>
                          <p className="text-lg font-semibold text-blue-700">{port.departures}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredPorts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Anchor className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No ports found matching your filters</p>
                </div>
              )}
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
                            {portDetails.congestion.score.toFixed(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Level</p>
                          <p className="text-sm font-semibold text-gray-900 capitalize">
                            {portDetails.congestion.level}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Wait Time</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {portDetails.congestion.avg_wait_time_hours.toFixed(1)}h
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
                              <p className="text-lg font-bold text-emerald-700">{portDetails.traffic.total.arrivals}</p>
                            </div>
                            <div className="bg-white p-3 rounded">
                              <p className="text-xs text-gray-600">Departures</p>
                              <p className="text-lg font-bold text-blue-700">{portDetails.traffic.total.departures}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-600 mb-2">Last 30 Days</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded">
                              <p className="text-xs text-gray-600">Arrivals</p>
                              <p className="text-lg font-bold text-emerald-700">{portDetails.traffic.last_30_days.arrivals}</p>
                            </div>
                            <div className="bg-white p-3 rounded">
                              <p className="text-xs text-gray-600">Departures</p>
                              <p className="text-lg font-bold text-blue-700">{portDetails.traffic.last_30_days.departures}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-600 mb-2">Current Activity</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded">
                              <p className="text-xs text-gray-600">Incoming</p>
                              <p className="text-lg font-bold text-blue-700">{portDetails.traffic.current_activity.incoming_vessels}</p>
                            </div>
                            <div className="bg-white p-3 rounded">
                              <p className="text-xs text-gray-600">Outgoing</p>
                              <p className="text-lg font-bold text-emerald-700">{portDetails.traffic.current_activity.outgoing_vessels}</p>
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
                            {portDetails.performance.completed_arrivals}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Turnover Rate</p>
                          <p className="text-xl font-bold text-gray-900">
                            {portDetails.performance.turnover_rate}%
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