// src/pages/liveTracking/components/SidebarPanel.jsx
import { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Anchor, AlertCircle, Trash2, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const SidebarPanel = ({
  vessels,
  filteredVessels,
  selectedVessel,
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  onUpdatePositions,
  updating,
  onSelectVessel,
  onSubscriptionUpdate,
  onAlertsRemoved
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [subscribedVessels, setSubscribedVessels] = useState(new Set());
  const [selectedAlerts, setSelectedAlerts] = useState(new Set());
  const [showAlertManagement, setShowAlertManagement] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    fetchSubscribedVessels();
  }, [onSubscriptionUpdate, refreshTrigger]);

  const fetchSubscribedVessels = async () => {
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

      // Get all active subscriptions with proper boolean values
      const subscribedIds = new Set(
        results
          .filter(sub => sub.is_active === true)
          .map(sub => sub.vessel)
      );

      setSubscribedVessels(subscribedIds);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const handleRemoveAllAlerts = async () => {
    if (subscribedVessels.size === 0) {
      toast.error('No active alerts to remove', {
        position: 'top-center',
        duration: 3000,
        icon: '⚠️',
        style: {
          background: '#ffffff',
          color: '#dc2626',
          padding: '8px 14px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)',
          border: '1px solid #fee2e2',
          fontSize: '13px',
          fontWeight: '500',
        }
      });
      return;
    }

    setConfirmAction({
      type: 'all',
      count: subscribedVessels.size,
      onConfirm: async () => {
        await executeRemoveAlerts(Array.from(subscribedVessels));
      }
    });
    setShowConfirmModal(true);
  };

  const handleRemoveSelectedAlerts = async () => {
    if (selectedAlerts.size === 0) return;

    setConfirmAction({
      type: 'selected',
      count: selectedAlerts.size,
      onConfirm: async () => {
        await executeRemoveAlerts(Array.from(selectedAlerts));
      }
    });
    setShowConfirmModal(true);
  };

  const executeRemoveAlerts = async (vesselIds) => {
    setIsRemoving(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Not logged in', {
          position: 'top-center',
          duration: 2000
        });
        setIsRemoving(false);
        return;
      }

      // Optimistically update UI
      const newSubscribed = new Set(subscribedVessels);
      vesselIds.forEach(id => newSubscribed.delete(id));
      setSubscribedVessels(newSubscribed);
      setSelectedAlerts(new Set());

      // Remove all alerts in parallel
      await Promise.all(
        vesselIds.map(vesselId =>
          fetch(`${API_URL}/users/subscriptions/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              vessel: vesselId,
              is_active: false,
              alert_type: 'none',
              weather_alerts: false,
              piracy_alerts: false
            })
          })
        )
      );

      const alertCount = vesselIds.length;
      const message = alertCount === subscribedVessels.size
        ? 'All alerts removed'
        : `${alertCount} alert${alertCount > 1 ? 's' : ''} removed`;

      toast.success(message, {
        position: 'top-center',
        duration: 3000,
        icon: '✓',
        style: {
          background: '#ffffff',
          color: '#059669',
          padding: '8px 14px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)',
          border: '1px solid #d1fae5',
          fontSize: '13px',
          fontWeight: '500',
        }
      });

      setShowConfirmModal(false);

      // Trigger parent update to refresh VesselDetailsPanel
      if (onAlertsRemoved) {
        onAlertsRemoved();
      }

      // Refetch after delay to ensure backend is synced
      setTimeout(() => {
        fetchSubscribedVessels();
      }, 500);
    } catch (error) {
      console.error('Error removing alerts:', error);
      // Revert optimistic update on error
      fetchSubscribedVessels();
      toast.error('Failed to remove alerts', {
        position: 'top-center',
        duration: 2000,
        icon: '✗',
        style: {
          background: '#ffffff',
          color: '#dc2626',
          padding: '8px 14px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)',
          border: '1px solid #fee2e2',
          fontSize: '13px',
          fontWeight: '500',
        }
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const toggleAlertSelection = (vesselId) => {
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(vesselId)) {
      newSelected.delete(vesselId);
    } else {
      newSelected.add(vesselId);
    }
    setSelectedAlerts(newSelected);
  };

  const vesselTypes = ['Cargo', 'Tanker', 'Container', 'Fishing', 'Passenger', 'Tug', 'Bulk'];
  const continents = ['Asia', 'Europe', 'Africa', 'Americas', 'Oceania'];

  const toggleFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const clearFilters = () => {
    setFilters({ types: [], continents: [], speedRange: [0, 30] });
    setSearchQuery('');
  };

  return (
    <div className="w-96 bg-white shadow-lg flex flex-col border-r border-slate-200 overflow-hidden">
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>

      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-700">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Anchor size={28} />
          MaritimeTrack
        </h1>
        <p className="text-blue-100 text-sm mt-1">Live Vessel Tracking</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search vessel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Refresh Button */}
        <button
          onClick={onUpdatePositions}
          disabled={updating}
          className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 flex items-center justify-center gap-2 transition font-medium text-sm shadow-md"
        >
          <RefreshCw size={16} className={updating ? 'animate-spin' : ''} />
          {updating ? 'Refreshing...' : 'Refresh Fleet'}
        </button>

        {/* Alert Management */}
        {subscribedVessels.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <button
              onClick={() => setShowAlertManagement(!showAlertManagement)}
              className="w-full flex items-center justify-between text-sm font-semibold text-blue-900"
            >
              <span className="flex items-center gap-2">
                <Bell size={14} />
                Active Alerts ({subscribedVessels.size})
              </span>
              <span className={`transition ${showAlertManagement ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {showAlertManagement && (
              <div className="mt-3 space-y-2">
                <button
                  onClick={handleRemoveAllAlerts}
                  disabled={isRemoving}
                  className="w-full px-3 py-2 text-xs text-white bg-red-500 hover:bg-red-600 disabled:bg-slate-400 rounded-lg font-medium transition flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={12} />
                  {isRemoving ? 'Removing...' : 'Remove All'}
                </button>

                {selectedAlerts.size > 0 && (
                  <button
                    onClick={handleRemoveSelectedAlerts}
                    disabled={isRemoving}
                    className="w-full px-3 py-2 text-xs text-white bg-red-600 hover:bg-red-700 disabled:bg-slate-400 rounded-lg font-medium transition flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={12} />
                    {isRemoving ? 'Removing...' : `Remove Selected (${selectedAlerts.size})`}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition text-slate-900 font-medium text-sm"
          >
            <span className="flex items-center gap-2">
              <Filter size={16} />
              Filters
            </span>
            <span className={`transition ${showFilters ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showFilters && (
            <div className="mt-3 space-y-4 p-4 bg-slate-50 rounded-lg">
              {/* Vessel Type */}
              <div>
                <p className="text-xs font-bold text-slate-900 mb-2">Type</p>
                <div className="flex flex-wrap gap-2">
                  {vesselTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => toggleFilter('types', type.toLowerCase())}
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                        filters.types.includes(type.toLowerCase())
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-700 border border-slate-300 hover:border-blue-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Continent Filter */}
              <div>
                <p className="text-xs font-bold text-slate-900 mb-2">Region</p>
                <div className="flex flex-wrap gap-2">
                  {continents.map(continent => (
                    <button
                      key={continent}
                      onClick={() => toggleFilter('continents', continent)}
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                        filters.continents?.includes(continent)
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-slate-700 border border-slate-300 hover:border-purple-400'
                      }`}
                    >
                      {continent}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed Range */}
              <div>
                <p className="text-xs font-bold text-slate-900 mb-2">Speed (knots)</p>
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
                    className="w-20 px-2 py-1.5 border border-slate-300 rounded text-xs"
                  />
                  <span className="text-slate-600 text-xs">to</span>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={filters.speedRange[1]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      speedRange: [prev.speedRange[0], Number(e.target.value)]
                    }))}
                    className="w-20 px-2 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full px-3 py-2 text-xs text-red-600 bg-white border border-red-300 hover:bg-red-50 rounded-lg font-medium transition"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Vessels List */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-2">
            Fleet ({filteredVessels.length})
          </h3>
          {filteredVessels.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No vessels found</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
              {filteredVessels.map(vessel => {
                const hasAlert = subscribedVessels.has(vessel.id);
                const isSelected = selectedVessel?.id === vessel.id;
                const isAlertSelected = selectedAlerts.has(vessel.id);

                return (
                  <div
                    key={vessel.id}
                    className={`rounded-lg cursor-pointer transition relative ${
                      isSelected
                        ? 'bg-blue-500 text-white shadow-md'
                        : hasAlert
                        ? 'bg-blue-50 hover:bg-blue-100 text-slate-900 border-l-4 border-blue-400'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-900'
                    }`}
                  >
                    <div
                      className="p-3"
                      onClick={() => onSelectVessel(vessel)}
                    >
                      {hasAlert && (
                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                          {showAlertManagement && (
                            <input
                              type="checkbox"
                              checked={isAlertSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleAlertSelection(vessel.id);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-3.5 h-3.5 rounded border-blue-400 text-blue-600"
                            />
                          )}
                          <Bell size={12} className={isSelected ? 'text-white' : 'text-blue-600'} />
                        </div>
                      )}

                      <div className="font-semibold text-sm pr-6">{vessel.name}</div>
                      <div className={`text-xs ${isSelected ? 'opacity-90' : 'opacity-75'} mt-1.5 space-y-0.5`}>
                        <div>IMO: {vessel.imo_number}</div>
                        <div>{vessel.type || 'N/A'}</div>
                        {vessel.speed && <div>Speed: {vessel.speed.toFixed(1)} kts</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
            <div className="px-5 py-3 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                Confirm Removal
              </h3>
            </div>

            <div className="px-5 py-4 text-center">
              <p className="text-slate-800 text-base font-medium">
                Remove{' '}
                <span className="font-bold text-red-600">
                  {confirmAction.type === 'all' ? `all ${confirmAction.count}` : confirmAction.count}{' '}
                  alert{confirmAction.count > 1 ? 's' : ''}
                </span>
                ?
              </p>
              <p className="text-xs text-slate-500 mt-2">
                You can re-enable alerts anytime from vessel details.
              </p>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                disabled={isRemoving}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction.onConfirm}
                disabled={isRemoving}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-1.5 text-sm disabled:opacity-50"
              >
                {isRemoving ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarPanel;