import React, { useState, useEffect } from 'react';
import { Ship, Calendar, MapPin, Clock, RefreshCw, TrendingUp } from 'lucide-react';

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

const Voyages = () => {
  const [voyages, setVoyages] = useState([]);
  const [filteredVoyages, setFilteredVoyages] = useState([]);
  const [selectedVoyage, setSelectedVoyage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vessels, setVessels] = useState([]);
  const [vesselFilter, setVesselFilter] = useState('all');
  const [statistics, setStatistics] = useState(null);
  const [toast, setToast] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    await loadVoyages();
    showToast('Voyages data refreshed successfully');
  };

  useEffect(() => {
    loadVoyages();
    loadVessels();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, vesselFilter, voyages]);

  const loadVoyages = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        showToast('You must be logged in', 'error');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/voyages/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to load voyages');

      const data = await response.json();
      setVoyages(data.results || data || []);
      setStatistics(data.statistics);
      setLoading(false);

      // Only show toast on manual refresh, not initial load
    } catch (error) {
      console.error('Error loading voyages:', error);
      showToast('Failed to load voyages', 'error');
      setLoading(false);
    }
  };

  const loadVessels = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/vessels/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVessels(Array.isArray(data) ? data : (data.results || []));
      }
    } catch (error) {
      console.error('Error loading vessels:', error);
    }
  };



  const applyFilters = () => {
    let filtered = voyages;

    if (searchQuery) {
      filtered = filtered.filter(voyage =>
        voyage.vessel_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voyage.vessel_imo?.includes(searchQuery) ||
        voyage.port_from_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voyage.port_to_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(voyage => voyage.status === statusFilter);
    }

    if (vesselFilter !== 'all') {
      filtered = filtered.filter(voyage => voyage.vessel === parseInt(vesselFilter));
    }

    setFilteredVoyages(filtered);
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateProgress = (voyage) => {
    if (voyage.status !== 'in_progress') return null;
    
    const now = new Date();
    const departure = new Date(voyage.departure_time);
    const arrival = new Date(voyage.arrival_time);
    
    const totalDuration = arrival - departure;
    const elapsed = now - departure;
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading voyages...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Voyage Management</h1>
          <p className="mt-2 text-gray-600">Track and monitor vessel voyages across routes</p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.by_status.scheduled}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.by_status.in_progress}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Ship className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.by_status.completed}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.by_status.cancelled}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-red-600" />
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
                  placeholder="Search by vessel, IMO, or ports..."
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
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Filter Voyages</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Statuses</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vessel
                    </label>
                    <select
                      value={vesselFilter}
                      onChange={(e) => setVesselFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Vessels</option>
                      {vessels.map(vessel => (
                        <option key={vessel.id} value={vessel.id}>{vessel.name}</option>
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
          {/* Voyages List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">
                  Voyages ({filteredVoyages.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredVoyages.map(voyage => {
                  const progress = calculateProgress(voyage);
                  return (
                    <div
                      key={voyage.id}
                      className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                        selectedVoyage?.id === voyage.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedVoyage(voyage)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{voyage.vessel_name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(voyage.status)}`}>
                              {voyage.status_display}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 font-mono">{voyage.vessel_imo}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Departure</p>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{voyage.port_from_name}</p>
                              <p className="text-xs text-gray-500">{formatDate(voyage.departure_time)}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">Arrival</p>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{voyage.port_to_name}</p>
                              <p className="text-xs text-gray-500">{formatDate(voyage.arrival_time)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{voyage.duration_days} days</span>
                        </div>

                        {progress !== null && (
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-amber-500 h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 font-medium">{progress.toFixed(0)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredVoyages.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Ship className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No voyages found matching your filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Voyage Details Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Voyage Details</h2>
              </div>

              <div className="p-6">
                {!selectedVoyage ? (
                  <div className="text-center py-12 text-gray-500">
                    <Ship className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Select a voyage to view details</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedVoyage.status)}`}>
                        {selectedVoyage.status_display}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 mt-3">{selectedVoyage.vessel_name}</h3>
                      <p className="text-sm text-gray-500 font-mono mt-1">{selectedVoyage.vessel_imo}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <h4 className="font-semibold text-gray-900">Route Information</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs font-medium">DEPARTURE</span>
                          </div>
                          <div className="ml-6">
                            <p className="font-semibold text-gray-900">{selectedVoyage.port_from_name}</p>
                            <p className="text-sm text-gray-600">{selectedVoyage.port_from_country}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(selectedVoyage.departure_time)}</p>
                          </div>
                        </div>

                        <div className="ml-6 pl-4 border-l-2 border-dashed border-gray-300 py-2">
                          <p className="text-sm text-gray-600">
                            Duration: <span className="font-semibold text-gray-900">{selectedVoyage.duration_days} days</span>
                          </p>
                          {calculateProgress(selectedVoyage) !== null && (
                            <div className="mt-3">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-amber-500 h-2.5 rounded-full transition-all"
                                  style={{ width: `${calculateProgress(selectedVoyage)}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                {calculateProgress(selectedVoyage).toFixed(1)}% complete
                              </p>
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs font-medium">ARRIVAL</span>
                          </div>
                          <div className="ml-6">
                            <p className="font-semibold text-gray-900">{selectedVoyage.port_to_name}</p>
                            <p className="text-sm text-gray-600">{selectedVoyage.port_to_country}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(selectedVoyage.arrival_time)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Vessel Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium text-gray-900">{selectedVoyage.vessel_type || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">IMO Number:</span>
                          <span className="font-mono font-medium text-gray-900">{selectedVoyage.vessel_imo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Voyages;