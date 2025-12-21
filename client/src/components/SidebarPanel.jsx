// src/components/SidebarPanel.jsx
import React, { useState } from 'react';
import { Search, Filter, RefreshCw, Anchor, AlertCircle } from 'lucide-react';

const SidebarPanel = ({
  vessels,
  filteredVessels,
  selectedVessel,
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  refreshInterval,
  setRefreshInterval,
  onUpdatePositions,
  updating,
  onSelectVessel,
  message
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const vesselCategories = [
    { id: 'cargo', name: 'Cargo' },
    { id: 'tanker', name: 'Tanker' },
    { id: 'container', name: 'Container' },
    { id: 'fishing', name: 'Fishing' },
    { id: 'passenger', name: 'Passenger' },
    { id: 'tug', name: 'Tug' },
    { id: 'other', name: 'Other' }
  ];

  const uniqueFlags = [...new Set(vessels.map(v => v.flag).filter(Boolean))].sort();

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

  return (
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
          onClick={onUpdatePositions}
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
            className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition text-white font-semibold text-sm shadow-md"
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
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">
                  Vessel Category
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {vesselCategories.map(category => (
                    <label key={category.id} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.types.includes(category.id)}
                        onChange={() => toggleFilter('types', category.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 group-hover:text-slate-900">{category.name}</span>
                      <span className="text-xs text-slate-500 ml-auto">
                        ({vessels.filter(v => v.type && v.type.toLowerCase().includes(category.id)).length})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

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
                className="w-full mt-2 px-3 py-2 text-sm text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg font-medium shadow-md transition-colors"
              >
                Clear all filters
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
                  onClick={() => onSelectVessel(vessel)}
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
                    {vessel.speed && <div>Speed: {vessel.speed.toFixed(1)} km</div>}
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
  );
};

export default SidebarPanel;