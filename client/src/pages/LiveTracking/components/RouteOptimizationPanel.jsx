// src/pages/liveTracking/components/RouteOptimizationPanel.jsx
import React from 'react';
import { X, Navigation, Clock, Shield, Cloud, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const RouteOptimizationPanel = ({ vessel, route, onClose }) => {
  const { recommended, alternatives, dangerZones } = route;

  const getSafetyColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getSafetyBadge = (score) => {
    if (score >= 80) return { text: 'Safe', icon: CheckCircle, color: 'text-green-600' };
    if (score >= 60) return { text: 'Moderate', icon: AlertTriangle, color: 'text-yellow-600' };
    if (score >= 40) return { text: 'Risky', icon: AlertTriangle, color: 'text-orange-600' };
    return { text: 'Dangerous', icon: AlertTriangle, color: 'text-red-600' };
  };

  return (
    <>
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      <div className="fixed inset-0 top-[73px] bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[calc(100vh-150px)] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <Navigation size={22} className="text-white" />
              <div>
                <h3 className="font-bold text-white text-base">Route Optimization</h3>
                <p className="text-blue-100 text-xs">{vessel.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={22} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto hide-scrollbar p-5 space-y-5">
          {/* Danger Zone Summary */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2 text-sm">
              <AlertTriangle size={16} className="text-orange-600" />
              Active Danger Zones
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-2.5 bg-red-50 rounded-lg border border-red-200">
                <Shield size={18} className="text-red-600" />
                <div>
                  <p className="text-xs text-red-700 font-medium">Piracy Zones</p>
                  <p className="text-lg font-bold text-red-900">{dangerZones.piracy}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                <Cloud size={18} className="text-blue-600" />
                <div>
                  <p className="text-xs text-blue-700 font-medium">Weather Zones</p>
                  <p className="text-lg font-bold text-blue-900">{dangerZones.weather}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Route */}
          <div className="border-2 border-green-500 rounded-lg overflow-hidden">
            <div className="bg-green-50 px-4 py-2.5 border-b border-green-200">
              <h4 className="font-bold text-green-900 flex items-center gap-2 text-sm">
                <TrendingUp size={16} />
                Recommended Route
              </h4>
            </div>
            <div className="p-3 space-y-3">
              {/* Safety Score */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">Safety Score</span>
                <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border ${getSafetyColor(recommended.safetyScore)}`}>
                  {React.createElement(getSafetyBadge(recommended.safetyScore).icon, { 
                    size: 14, 
                    className: getSafetyBadge(recommended.safetyScore).color 
                  })}
                  <span className="font-bold text-sm">{recommended.safetyScore}/100</span>
                  <span className="text-xs">({getSafetyBadge(recommended.safetyScore).text})</span>
                </div>
              </div>

              {/* Route Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-xs text-slate-600 font-medium mb-0.5">Distance</p>
                  <p className="text-base font-bold text-slate-900">{recommended.distance} km</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-xs text-slate-600 font-medium mb-0.5">Duration</p>
                  <p className="text-base font-bold text-slate-900">
                    {recommended.duration.days}d {recommended.duration.hours}h
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-xs text-slate-600 font-medium mb-0.5">Waypoints</p>
                  <p className="text-base font-bold text-slate-900">{recommended.waypoints.length}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-xs text-slate-600 font-medium mb-0.5">ETA</p>
                  <p className="text-xs font-bold text-slate-900">
                    {new Date(Date.now() + recommended.duration.totalHours * 3600000).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Safety Features */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-700 uppercase">Safety Features</p>
                <div className="flex flex-wrap gap-1.5">
                  {recommended.avoidsPiracy && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-lg">
                      <Shield size={12} className="text-green-600" />
                      <span className="text-xs font-medium text-green-700">Avoids Piracy</span>
                    </div>
                  )}
                  {recommended.avoidsWeather && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                      <Cloud size={12} className="text-blue-600" />
                      <span className="text-xs font-medium text-blue-700">Avoids Bad Weather</span>
                    </div>
                  )}
                  {!recommended.avoidsPiracy && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle size={12} className="text-red-600" />
                      <span className="text-xs font-medium text-red-700">Crosses Piracy Zone</span>
                    </div>
                  )}
                  {!recommended.avoidsWeather && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 border border-orange-200 rounded-lg">
                      <Cloud size={12} className="text-orange-600" />
                      <span className="text-xs font-medium text-orange-700">Weather Risk</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Waypoints List */}
              <div>
                <p className="text-xs font-semibold text-slate-700 uppercase mb-1.5">Route Waypoints</p>
                <div className="bg-slate-50 rounded-lg p-2 max-h-24 overflow-y-auto hide-scrollbar">
                  {recommended.waypoints.map((waypoint, index) => (
                    <div key={index} className="flex items-center justify-between py-0.5 text-xs">
                      <span className="text-slate-600 font-medium">
                        {index === 0 ? '🚢 Start' : index === recommended.waypoints.length - 1 ? '🎯 Destination' : `⚓ Waypoint ${index}`}
                      </span>
                      <span className="font-mono text-slate-900 text-xs">
                        {waypoint.latitude.toFixed(4)}°, {waypoint.longitude.toFixed(4)}°
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Alternative Routes */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2 text-sm">
              <Navigation size={16} className="text-slate-600" />
              Alternative Routes
            </h4>
            <div className="space-y-2">
              {alternatives.map((alt, index) => {
                const badge = getSafetyBadge(alt.safetyScore);
                return (
                  <div key={index} className="border border-slate-200 rounded-lg overflow-hidden hover:border-blue-300 transition">
                    <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-xs">{alt.name}</span>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getSafetyColor(alt.safetyScore)}`}>
                        {React.createElement(badge.icon, { size: 12, className: badge.color })}
                        <span>{alt.safetyScore}/100</span>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-slate-600 mb-1.5">{alt.description}</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">Distance:</span>
                          <span className="font-semibold text-slate-900 ml-1">{alt.distance} km</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Waypoints:</span>
                          <span className="font-semibold text-slate-900 ml-1">{alt.waypoints.length}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Safety:</span>
                          <span className={`font-semibold ml-1 ${badge.color}`}>{badge.text}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-5 py-3 bg-slate-50 flex justify-end gap-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition text-sm"
          >
            Close
          </button>
          <button
            onClick={() => {
              // TODO: Implement route application
              alert('Route application coming soon!');
            }}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm flex items-center gap-1.5"
          >
            <CheckCircle size={14} />
            Apply Route
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default RouteOptimizationPanel;