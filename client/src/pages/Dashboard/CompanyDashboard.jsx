import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, Anchor, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { dashboardAPI } from '../../services/dashboardAPI';

const CompanyDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    status: 'all'
  });

  useEffect(() => {
    fetchCompanyData();
  }, [filters]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await dashboardAPI.getCompanyDashboard({
        dateRange: filters.dateRange,
        status: filters.status
      });

      console.log('Company Dashboard Data:', result);
      setData(result);
    } catch (err) {
      console.error('Error fetching company data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load company dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '$0';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 font-semibold">Error Loading Dashboard</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button
              onClick={fetchCompanyData}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 font-semibold">No data available</p>
        <p className="text-yellow-700 text-sm mt-1">Please check your API connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 relative z-20">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Voyages</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data?.totalVoyages ?? data?.total_voyages ?? 0}
              </p>
            </div>
            <BarChart3 className="w-10 h-10 text-blue-100 bg-blue-50 p-2 rounded-lg" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Active Fleet</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data?.activeFleet ?? data?.active_fleet ?? 0}
              </p>
            </div>
            <Anchor className="w-10 h-10 text-emerald-100 bg-emerald-50 p-2 rounded-lg" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(data?.totalRevenue ?? data?.total_revenue ?? 0)}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-amber-100 bg-amber-50 p-2 rounded-lg" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data?.successRate ?? data?.success_rate ?? 0}%
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-100 bg-purple-50 p-2 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
          {data?.monthlyRevenue && Array.isArray(data.monthlyRevenue) && data.monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={{ fill: '#3b82f6', r: 4 }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg">
              <p className="text-gray-500">No monthly revenue data available</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Voyage Status Distribution</h3>
          {data?.voyageStatus && Array.isArray(data.voyageStatus) && data.voyageStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={data.voyageStatus} 
                  cx="50%" 
                  cy="50%" 
                  labelLine={false} 
                  label={({ name, value }) => `${name} ${value}`} 
                  outerRadius={80} 
                  dataKey="value"
                >
                  {data.voyageStatus.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill || ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'][index % 4]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg">
              <p className="text-gray-500">No voyage status data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Vessel Performance Table */}
      <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Performing Vessels</h3>
        {data?.vesselPerformance && Array.isArray(data.vesselPerformance) && data.vesselPerformance.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.vesselPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="vessel" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }} />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="trips" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg">
            <p className="text-gray-500">No vessel performance data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;