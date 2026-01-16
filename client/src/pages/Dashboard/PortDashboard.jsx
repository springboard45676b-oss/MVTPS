// ============================================
// UPDATED PORT DASHBOARD - Matching Backend Response
// Replace your client/src/pages/PortDashboard.jsx with this
// ============================================

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Anchor, TrendingUp, Clock, AlertCircle } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/api';

const PortDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: 'month'
  });

  useEffect(() => {
    fetchPortData();
  }, [filters]);

  const fetchPortData = async () => {
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

      const response = await fetch(`${API_URL}/dashboard/port/?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch port data');

      const result = await response.json();
      console.log('Port Dashboard Response:', result); // Debug log
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching port data:', err);
      setError('Failed to load port dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading port data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-semibold">{error}</p>
        <button
          onClick={fetchPortData}
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
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Ports</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.totalPorts || 0}</p>
            </div>
            <Anchor className="w-10 h-10 text-blue-100 bg-blue-50 p-2 rounded-lg" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Avg Congestion</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.avgCongestion || 0}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-amber-100 bg-amber-50 p-2 rounded-lg" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Vessels in Ports</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.vesselsInPorts || 0}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-emerald-100 bg-emerald-50 p-2 rounded-lg" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Avg Wait Time</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.avgWaitTime || 0}h</p>
            </div>
            <Clock className="w-10 h-10 text-red-100 bg-red-50 p-2 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Congestion Trends */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Congestion Trends</h3>
          {data.congestionTrends && data.congestionTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.congestionTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }} />
                <Legend />
                <Line type="monotone" dataKey="congestion" stroke="#ef4444" strokeWidth={2} name="Congestion" />
                <Line type="monotone" dataKey="waitTime" stroke="#f59e0b" strokeWidth={2} name="Wait Time (h)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No congestion trend data</p>
          )}
        </div>

        {/* Congestion Distribution */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Congestion Distribution</h3>
          {data.congestionDistribution && data.congestionDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={data.congestionDistribution} 
                  cx="50%" 
                  cy="50%" 
                  labelLine={false} 
                  label={({ name, value }) => `${name}: ${value}`} 
                  outerRadius={100} 
                  dataKey="value"
                >
                  {data.congestionDistribution.map((entry, index) => (
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

      {/* Top Congested Ports & Port Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Congested Ports */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Congested Ports</h3>
          {data.topCongestedPorts && data.topCongestedPorts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topCongestedPorts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="port" type="category" stroke="#6b7280" width={150} />
                <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="congestion" fill="#ef4444" radius={[0, 8, 8, 0]} name="Congestion Score" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No congested ports data</p>
          )}
        </div>

        {/* Port Traffic */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Port Traffic</h3>
          {data.portTraffic && data.portTraffic.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.portTraffic}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="port" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }} />
                <Legend />
                <Bar dataKey="arrivals" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="departures" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No traffic data</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortDashboard;