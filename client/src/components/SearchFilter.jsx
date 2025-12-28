import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';

// Ports Search Filter Component
export const PortsSearchFilter = ({ ports, onFiltersChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [congestionLevel, setCongestionLevel] = useState('all');
  const [country, setCountry] = useState('all');

  const uniqueCountries = [...new Set(ports.map(p => p.country))].filter(Boolean).sort();

  const getCongestionLevel = (score) => {
    if (score < 3) return 'low';
    if (score < 6) return 'moderate';
    if (score < 8) return 'high';
    return 'critical';
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, congestionLevel, country]);

  const applyFilters = () => {
    let filtered = ports;

    if (searchQuery) {
      filtered = filtered.filter(port =>
        port.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        port.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        port.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (congestionLevel !== 'all') {
      filtered = filtered.filter(port => {
        const level = getCongestionLevel(port.congestion_score);
        return level === congestionLevel;
      });
    }

    if (country !== 'all') {
      filtered = filtered.filter(port => port.country === country);
    }

    onFiltersChange(filtered);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleApply = () => {
    applyFilters();
    setIsOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by port name, location, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Filter Ports</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Congestion Level
                </label>
                <select
                  value={congestionLevel}
                  onChange={(e) => setCongestionLevel(e.target.value)}
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
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Countries</option>
                  {uniqueCountries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Voyages Search Filter Component
export const VoyagesSearchFilter = ({ voyages, vessels, onFiltersChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [vesselId, setVesselId] = useState('all');

  useEffect(() => {
    applyFilters();
  }, [searchQuery, status, vesselId]);

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

    if (status !== 'all') {
      filtered = filtered.filter(voyage => voyage.status === status);
    }

    if (vesselId !== 'all') {
      filtered = filtered.filter(voyage => voyage.vessel === parseInt(vesselId));
    }

    onFiltersChange(filtered);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleApply = () => {
    applyFilters();
    setIsOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by vessel, IMO, or ports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Filter Voyages</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
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
                  value={vesselId}
                  onChange={(e) => setVesselId(e.target.value)}
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
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Toast Notification Component (matches the design in the image)
export const Toast = ({ message, type = 'success', onClose }) => {
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