// src/components/VesselDetailsPanel.jsx
import React from 'react';
import { Navigation, TrendingUp, Bell, X } from 'lucide-react';

const VesselDetailsPanel = ({ vessel, track, onEnableAlerts, onClose }) => {
  return (
    <div className="bg-white border-t border-slate-200 shadow-lg max-h-96 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Navigation size={20} className="text-blue-600" />
            {vessel.name}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={18} className="text-slate-600" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-600 uppercase">IMO</span>
            <span className="text-sm font-mono text-slate-900">{vessel.imo_number}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-600 uppercase">Type</span>
            <span className="text-sm text-slate-900">{vessel.type || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-600 uppercase">Flag</span>
            <span className="text-sm font-bold text-blue-600">{vessel.flag || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-600 uppercase">Destination</span>
            <span className="text-sm text-slate-900">{vessel.destination || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-600 uppercase">Cargo Type</span>
            <span className="text-sm text-slate-900">{vessel.cargo_type || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-600 uppercase">Position</span>
            <span className="text-sm font-mono text-slate-900">
              {vessel.last_position_lat.toFixed(3)}°, {vessel.last_position_lon.toFixed(3)}°
            </span>
          </div>
        </div>

        {/* Enable Alerts Button */}
        <button
          onClick={onEnableAlerts}
          className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition flex items-center justify-center gap-2 mb-4"
        >
          <Bell size={16} />
          Enable Alerts
        </button>

        {/* Position History Table */}
        {track && track.length > 0 && (
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
              <TrendingUp size={16} className="text-blue-600" /> Position History (Last 24 Hours)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-2 px-2 text-slate-700 font-semibold">Time</th>
                    <th className="text-left py-2 px-2 text-slate-700 font-semibold">Lat</th>
                    <th className="text-left py-2 px-2 text-slate-700 font-semibold">Lon</th>
                    <th className="text-left py-2 px-2 text-slate-700 font-semibold">Speed</th>
                    <th className="text-left py-2 px-2 text-slate-700 font-semibold">Course</th>
                  </tr>
                </thead>
                <tbody>
                  {track.slice(0, 8).map((pos, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-1 px-2 text-xs">{new Date(pos.timestamp).toLocaleTimeString()}</td>
                      <td className="py-1 px-2 font-mono text-xs">{pos.latitude.toFixed(4)}°</td>
                      <td className="py-1 px-2 font-mono text-xs">{pos.longitude.toFixed(4)}°</td>
                      <td className="py-1 px-2">
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {pos.speed?.toFixed(2) || 'N/A'} kts
                        </span>
                      </td>
                      <td className="py-1 px-2 text-xs">{pos.course?.toFixed(1) || 'N/A'}°</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VesselDetailsPanel;