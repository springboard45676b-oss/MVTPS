// client/src/components/VesselSearchFilter.jsx
import React, { useState, useMemo } from 'react';
import { Search, X, ChevronDown, Filter } from 'lucide-react';

const VesselSearchFilter = ({ vessels, onFiltersChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    flag: '',
    cargoType: '',
    operator: '',
  });

  // Extract unique values for filter dropdowns
  const uniqueValues = useMemo(() => {
    return {
      types: [...new Set(vessels.map(v => v.type).filter(Boolean))].sort(),
      flags: [...new Set(vessels.map(v => v.flag).filter(Boolean))].sort(),
      cargoTypes: [...new Set(vessels.map(v => v.cargo_type).filter(Boolean))].sort(),
      operators: [...new Set(vessels.map(v => v.operator).filter(Boolean))].sort(),
    };
  }, [vessels]);

  // Apply filters and search
  const filteredVessels = useMemo(() => {
    return vessels.filter(vessel => {
      // Search term filter (search in name, IMO, operator)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        vessel.name.toLowerCase().includes(searchLower) ||
        vessel.imo_number.includes(searchTerm) ||
        vessel.operator.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Type filter
      if (filters.type && vessel.type !== filters.type) return false;

      // Flag filter
      if (filters.flag && vessel.flag !== filters.flag) return false;

      // Cargo type filter
      if (filters.cargoType && vessel.cargo_type !== filters.cargoType) return false;

      // Operator filter
      if (filters.operator && vessel.operator !== filters.operator) return false;

      return true;
    });
  }, [vessels, searchTerm, filters]);

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    onFiltersChange(filteredVessels);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({
      type: '',
      flag: '',
      cargoType: '',
      operator: '',
    });
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="space-y-4">
      {/* Search Bar and Filter Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by vessel name, IMO, or operator..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onFiltersChange(filteredVessels);
            }}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                onFiltersChange(vessels);
              }}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
            isFilterOpen
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
      </div>

      {/* Expandable Filter Panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isFilterOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-6 space-y-4">
          {/* Filter Header */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              Filter Vessels
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

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Vessel Type Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Vessel Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="">All Types</option>
                {uniqueValues.types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Flag Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Flag
              </label>
              <select
                value={filters.flag}
                onChange={(e) => handleFilterChange('flag', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="">All Flags</option>
                {uniqueValues.flags.map(flag => (
                  <option key={flag} value={flag}>{flag}</option>
                ))}
              </select>
            </div>

            {/* Cargo Type Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cargo Type
              </label>
              <select
                value={filters.cargoType}
                onChange={(e) => handleFilterChange('cargoType', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="">All Cargo Types</option>
                {uniqueValues.cargoTypes.map(cargo => (
                  <option key={cargo} value={cargo}>{cargo}</option>
                ))}
              </select>
            </div>

            {/* Operator Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Operator
              </label>
              <select
                value={filters.operator}
                onChange={(e) => handleFilterChange('operator', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="">All Operators</option>
                {uniqueValues.operators.map(operator => (
                  <option key={operator} value={operator}>{operator}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              onClick={() => setIsFilterOpen(false)}
              className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition"
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

      {/* Results Summary */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="text-sm text-blue-900">
          Showing <span className="font-semibold">{filteredVessels.length}</span> of{' '}
          <span className="font-semibold">{vessels.length}</span> vessels
        </div>
        {filteredVessels.length === 0 && vessels.length > 0 && (
          <div className="text-sm text-blue-700">
            No vessels match your filters
          </div>
        )}
      </div>
    </div>
  );
};

export default VesselSearchFilter;