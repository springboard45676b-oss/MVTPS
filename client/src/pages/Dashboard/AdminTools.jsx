// ============================================
// COMPLETE ADMIN TOOLS - With Full User Management
// Replace your client/src/pages/AdminTools.jsx with this
// ============================================

import React, { useState, useEffect } from 'react';
import { Download, Users, Database, Settings, Eye, Activity, AlertCircle, BarChart3, Edit2, Trash2, UserPlus, Lock, Unlock, Shield } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/api';

const AdminTools = () => {
  const [activeTab, setActiveTab] = useState('user-management');
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [userActions, setUserActions] = useState([]);
  const [actionStats, setActionStats] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (activeTab === 'user-management') {
      fetchUsers();
    } else if (activeTab === 'activity-logs') {
      fetchUserActions();
      fetchActionStats();
    } else if (activeTab === 'system-info') {
      fetchSystemInfo();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_URL}/admin/users/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      console.log('Users Response:', data);
      
      setUsers(data.results || []);
      setUserStats(data.stats || null);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Make sure you have admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_URL}/admin/user-actions/recent/?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch user actions');
      const data = await response.json();
      setUserActions(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching user actions:', err);
      setError('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchActionStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_URL}/admin/user-actions/stats/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setActionStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_URL}/admin/system-info/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch system info');
      const data = await response.json();
      console.log('System Info:', data);
      setSystemInfo(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching system info:', err);
      setError('Failed to load system information');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_URL}/admin/users/${userId}/change_role/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change role');
      }

      const data = await response.json();
      alert(data.message);
      fetchUsers(); // Refresh user list
    } catch (err) {
      console.error('Error changing role:', err);
      alert(err.message);
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_URL}/admin/users/${userId}/activate/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to activate user');
      
      const data = await response.json();
      alert(data.message);
      fetchUsers();
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to activate user');
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_URL}/admin/users/${userId}/deactivate/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to deactivate user');
      }
      
      const data = await response.json();
      alert(data.message);
      fetchUsers();
    } catch (err) {
      console.error('Error:', err);
      alert(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_URL}/admin/users/${userId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete user');
      
      alert('User deleted successfully');
      fetchUsers();
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to delete user');
    }
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/admin/export/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data_export_${Date.now()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      alert('Data exported successfully!');
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed');
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getActionColor = (action) => {
    if (action.includes('login')) return 'text-green-600 bg-green-50';
    if (action.includes('delete')) return 'text-red-600 bg-red-50';
    if (action.includes('create')) return 'text-blue-600 bg-blue-50';
    if (action.includes('edit') || action.includes('update')) return 'text-amber-600 bg-amber-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getStatusColor = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600 bg-green-50';
    if (statusCode >= 400 && statusCode < 500) return 'text-amber-600 bg-amber-50';
    if (statusCode >= 500) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('user-management')}
          className={`px-4 py-3 text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'user-management'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users size={16} className="inline mr-2" />
          User Management
        </button>
        <button
          onClick={() => setActiveTab('activity-logs')}
          className={`px-4 py-3 text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'activity-logs'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Activity size={16} className="inline mr-2" />
          Activity Logs
        </button>
        <button
          onClick={() => setActiveTab('system-info')}
          className={`px-4 py-3 text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'system-info'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings size={16} className="inline mr-2" />
          System Info
        </button>
      </div>

      {/* User Management Tab */}
      {activeTab === 'user-management' && (
        <div className="space-y-4">
          {/* User Stats Cards */}
          {userStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{userStats.total_users || 0}</p>
                  </div>
                  <Users className="w-10 h-10 text-blue-100 bg-blue-50 p-2 rounded-lg" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Admins</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{userStats.by_role?.admin || 0}</p>
                  </div>
                  <Shield className="w-10 h-10 text-red-100 bg-red-50 p-2 rounded-lg" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Analysts</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{userStats.by_role?.analyst || 0}</p>
                  </div>
                  <BarChart3 className="w-10 h-10 text-blue-100 bg-blue-50 p-2 rounded-lg" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Operators</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{userStats.by_role?.operator || 0}</p>
                  </div>
                  <Activity className="w-10 h-10 text-green-100 bg-green-50 p-2 rounded-lg" />
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-900">All Users ({users.length})</h3>
            </div>

            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading users...</p>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Username</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Role</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Created At</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">{user.username}</td>
                        <td className="px-4 py-3 text-gray-600">{user.email}</td>
                        <td className="px-4 py-3">
                          <select
                            value={user.role}
                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold capitalize border-0 ${
                              user.role === 'admin' ? 'bg-red-100 text-red-800' :
                              user.role === 'analyst' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}
                          >
                            <option value="operator">Operator</option>
                            <option value="analyst">Analyst</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {formatTimestamp(user.created_at)}
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          <button 
                            onClick={() => handleActivateUser(user.id)}
                            className="p-1.5 hover:bg-green-100 rounded transition"
                            title="Activate User"
                          >
                            <Unlock size={14} className="text-green-600" />
                          </button>
                          <button 
                            onClick={() => handleDeactivateUser(user.id)}
                            className="p-1.5 hover:bg-amber-100 rounded transition"
                            title="Deactivate User"
                          >
                            <Lock size={14} className="text-amber-600" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1.5 hover:bg-red-100 rounded transition"
                            title="Delete User"
                          >
                            <Trash2 size={14} className="text-red-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity Logs Tab */}
      {activeTab === 'activity-logs' && (
        <div className="space-y-4">
          {/* Stats Cards */}
          {actionStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Total Actions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{actionStats.total_actions || 0}</p>
                  </div>
                  <Activity className="w-10 h-10 text-blue-100 bg-blue-50 p-2 rounded-lg" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Successful</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{actionStats.successful_actions || 0}</p>
                  </div>
                  <BarChart3 className="w-10 h-10 text-green-100 bg-green-50 p-2 rounded-lg" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{actionStats.failed_actions || 0}</p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-red-100 bg-red-50 p-2 rounded-lg" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Last 24h</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{actionStats.last_24h || 0}</p>
                  </div>
                  <Database className="w-10 h-10 text-amber-100 bg-amber-50 p-2 rounded-lg" />
                </div>
              </div>
            </div>
          )}

          {/* Recent Actions Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent User Actions</h3>

            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading activity logs...</p>
            ) : userActions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No activity logs available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">User</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Action</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Endpoint</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Method</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userActions.map((action, idx) => (
                      <tr key={action.id || idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {action.username || 'Anonymous'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getActionColor(action.action)}`}>
                            {action.action_display || action.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">
                          {action.endpoint}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            action.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                            action.method === 'POST' ? 'bg-green-100 text-green-800' :
                            action.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {action.method}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(action.status_code)}`}>
                            {action.status_code}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {formatTimestamp(action.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Info Tab */}
      {activeTab === 'system-info' && (
        <div className="space-y-4">
          {systemInfo && (
            <>
              {/* System Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Total Vessels</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{systemInfo.database?.vessels || 0}</p>
                    </div>
                    <Database className="w-10 h-10 text-blue-100 bg-blue-50 p-2 rounded-lg" />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Total Ports</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{systemInfo.database?.ports || 0}</p>
                    </div>
                    <Settings className="w-10 h-10 text-green-100 bg-green-50 p-2 rounded-lg" />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Total Voyages</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{systemInfo.database?.voyages || 0}</p>
                    </div>
                    <Activity className="w-10 h-10 text-amber-100 bg-amber-50 p-2 rounded-lg" />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Risk Zones</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{systemInfo.safety?.total_risk_zones || 0}</p>
                    </div>
                    <AlertCircle className="w-10 h-10 text-red-100 bg-red-50 p-2 rounded-lg" />
                  </div>
                </div>
              </div>

              {/* System Info Details */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Version</span>
                      <span className="text-sm font-semibold text-gray-900">{systemInfo.system?.version}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Database</span>
                      <span className="text-sm font-semibold text-gray-900">{systemInfo.system?.database_type}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">API Version</span>
                      <span className="text-sm font-semibold text-gray-900">{systemInfo.system?.api_version}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Total Actions</span>
                      <span className="text-sm font-semibold text-gray-900">{systemInfo.activity?.total_actions}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Actions (24h)</span>
                      <span className="text-sm font-semibold text-gray-900">{systemInfo.activity?.actions_24h}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="text-sm font-semibold text-green-600">{systemInfo.system?.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Export */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Data Management</h3>
                <button
                  onClick={handleExportData}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Export All System Data (JSON)
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminTools;