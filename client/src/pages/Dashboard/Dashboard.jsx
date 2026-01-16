import React, { useState, useEffect } from 'react';
import { BarChart3, Anchor, Shield, Settings, LogOut, Menu, X } from 'lucide-react';
import CompanyDashboard from './CompanyDashboard';
import PortDashboard from './PortDashboard';
import InsurerDashboard from './InsurerDashboard';
import AdminTools from './AdminTools';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const userName = user?.username || user?.name || 'User';
  const userRole = user?.role?.toLowerCase() || 'user';

  const getTabs = () => {
    const baseTabs = [
      { id: 'company', label: 'Company', icon: BarChart3 },
      { id: 'port', label: 'Port', icon: Anchor },
      { id: 'insurer', label: 'Insurer', icon: Shield }
    ];

    if (userRole === 'admin') {
      baseTabs.push({ id: 'admin', label: 'Admin Tools', icon: Settings });
    }

    return baseTabs;
  };

  const tabs = getTabs();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Z-50 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600">Welcome,</p>
              <h1 className="text-2xl font-bold text-gray-900">{userName}</h1>
              <p className="text-xs text-gray-500 mt-1">
                Role: <span className="font-semibold text-gray-700 capitalize">{userRole}</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Logout"
            >
              <LogOut size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Z-40 */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content - Z-10 */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'company' && <CompanyDashboard />}
          {activeTab === 'port' && <PortDashboard />}
          {activeTab === 'insurer' && <InsurerDashboard />}
          {activeTab === 'admin' && userRole === 'admin' && <AdminTools />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;