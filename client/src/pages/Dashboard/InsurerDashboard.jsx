// ============================================
// UPDATED INSURER DASHBOARD - Matching Backend Response
// Replace your client/src/pages/InsurerDashboard.jsx with this
// ============================================

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Shield, TrendingUp, AlertTriangle, Activity } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/api';

const InsurerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: 'month'
  });

  useEffect(() => {
    fetchInsurerData();
  }, [filters]);

  const fetchInsurerData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (filters.dateRange) params.append('dateRange', filters.dateRange);

      const response = await fetch(`${API_URL}/dashboard/insurer/?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch insurer data');

      const result = await response.json();
      console.log('Insurer Dashboard Response:', result); // Debug log
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching insurer data:', err);
      setError('Failed to load insurer dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading insurer data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-semibold">{error}</p>
        <button
          onClick={fetchInsurerData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Risk Zones</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.totalRiskZones || 0}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-100 bg-red-50 p-2 rounded-lg" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">High Risk Vessels</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.highRiskVessels || 0}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-amber-100 bg-amber-50 p-2 rounded-lg" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Incidents</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.totalIncidents || 0}</p>
            </div>
            <Activity className="w-10 h-10 text-blue-100 bg-blue-50 p-2 rounded-lg" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.activeAlerts || 0}</p>
            </div>
            <Shield className="w-10 h-10 text-emerald-100 bg-emerald-50 p-2 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Exposure Trend */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Risk Exposure Trend</h3>
          {data.riskExposureTrend && data.riskExposureTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.riskExposureTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }} />
                <Legend />
                <Line type="monotone" dataKey="piracyRisk" stroke="#ef4444" strokeWidth={2} name="Piracy Risk" />
                <Line type="monotone" dataKey="weatherRisk" stroke="#3b82f6" strokeWidth={2} name="Weather Risk" />
                <Line type="monotone" dataKey="totalRisk" stroke="#f59e0b" strokeWidth={2} name="Total Risk" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No risk trend data</p>
          )}
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Risk Distribution</h3>
          {data.riskDistribution && data.riskDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={data.riskDistribution} 
                  cx="50%" 
                  cy="50%" 
                  labelLine={false} 
                  label={({ name, value }) => `${name}: ${value}`} 
                  outerRadius={100} 
                  dataKey="value"
                >
                  {data.riskDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No distribution data</p>
          )}
        </div>
      </div>

      {/* Top Risk Zones & Vessel Safety Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Risk Zones */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Risk Zones</h3>
          {data.topRiskZones && data.topRiskZones.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Zone</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Risk Level</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Incidents</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topRiskZones.map((zone, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900 font-medium">{zone.zone}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          zone.riskLevel === 'Critical' || zone.riskLevel === 'Extreme' ? 'bg-red-100 text-red-800' :
                          zone.riskLevel === 'High' || zone.riskLevel === 'Severe' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {zone.riskLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{zone.incidents}</td>
                      <td className="px-4 py-3 text-gray-600">{zone.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No risk zones data</p>
          )}
        </div>

        {/* Vessel Safety Scores */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Vessel Safety Scores (Lowest 5)</h3>
          {data.vesselSafetyScores && data.vesselSafetyScores.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.vesselSafetyScores} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 100]} stroke="#6b7280" />
                <YAxis dataKey="vessel" type="category" stroke="#6b7280" width={120} />
                <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="safetyScore" radius={[0, 8, 8, 0]} name="Safety Score">
                  {data.vesselSafetyScores.map((entry, index) => (
                    <Cell key={index} fill={
                      entry.safetyScore < 50 ? '#ef4444' :
                      entry.safetyScore < 75 ? '#f59e0b' : '#10b981'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No safety scores data</p>
          )}
        </div>
      </div>

      {/* Vessels at Risk Table */}
      {data.vesselsAtRisk && data.vesselsAtRisk.length > 0 && (
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Vessels Currently at Risk</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Vessel</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Risk Zone</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Risk Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {data.vesselsAtRisk.map((vessel, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">{vessel.vessel}</td>
                    <td className="px-4 py-3 text-gray-600">{vessel.zone}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        vessel.risk_type === 'piracy' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {vessel.risk_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        vessel.risk_level === 'critical' || vessel.risk_level === 'extreme' ? 'bg-red-100 text-red-800' :
                        vessel.risk_level === 'high' || vessel.risk_level === 'severe' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {vessel.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsurerDashboard;