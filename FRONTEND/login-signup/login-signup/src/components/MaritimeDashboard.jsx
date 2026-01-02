
import { clearAuth, apiRequest } from '../utils/api';
import React, { useState } from 'react';
import { Ship, Anchor, Activity, MapPin, AlertTriangle, TrendingUp, Users, BarChart3, Menu, X, LogOut, Waves, Navigation, Bell } from 'lucide-react';
// 17/12/2025 - MaritimeDashboard.jsx
// Add to imports
// import logo from "./mvtps.svg" ;
import VesselMap from './VesselMap';
import UserProfile from './UserProfile';
import Ports from './Ports';





// // Update sidebar menu items
const menuItems = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'map', label: 'Live Map', icon: MapPin },  // NEW
  { id: 'vessels', label: 'Vessels', icon: Ship },
  { id: 'ports', label: 'Ports', icon: Anchor },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];
// Mock data for demonstration
const mockVesselData = [
  { id: 1, name: 'Pacific Star', imo: 'IMO9876543', type: 'Cargo', status: 'In Transit', location: 'Arabian Sea', lat: 18.5, lon: 72.8 },
  { id: 2, name: 'Ocean Navigator', imo: 'IMO9876544', type: 'Tanker', status: 'Docked', location: 'Mumbai Port', lat: 18.9, lon: 72.8 },
  { id: 3, name: 'Maritime Express', imo: 'IMO9876545', type: 'Container', status: 'In Transit', location: 'Indian Ocean', lat: 15.2, lon: 73.1 },
  { id: 4, name: 'Sea Fortune', imo: 'IMO9876546', type: 'Cargo', status: 'Docked', location: 'Chennai Port', lat: 13.0, lon: 80.2 },
  { id: 5, name: 'Atlantic Wave', imo: 'IMO9876547', type: 'Tanker', status: 'In Transit', location: 'Bay of Bengal', lat: 16.5, lon: 82.3 },
];



const mockEvents = [
  { id: 1, type: 'Weather Alert', vessel: 'Pacific Star', severity: 'high', time: '2 hours ago' },
  { id: 2, type: 'Port Congestion', port: 'Kandla Port', severity: 'medium', time: '5 hours ago' },
  { id: 3, type: 'Maintenance', vessel: 'Ocean Navigator', severity: 'low', time: '1 day ago' },
  { id: 4, type: 'Piracy Risk', vessel: 'Atlantic Wave', severity: 'high', time: '3 hours ago' },
  { id: 5, type: 'Arrival Delay', vessel: 'Sea Fortune', severity: 'medium', time: '6 hours ago' },
];

// Shared Components
const StatCard = ({ icon: Icon, title, value, subtitle, color, bgColor }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 transform hover:-translate-y-1" style={{ borderLeftColor: color }}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold mb-1" style={{ color }}>{value}</h3>
        <p className="text-gray-500 text-xs">{subtitle}</p>
      </div>
      <div className="rounded-full p-3" style={{ backgroundColor: bgColor }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
    </div>
  </div>
);


// Overview Tab
const TopNavbar = ({ activeTab, setActiveTab, username, userRole, onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'map', label: 'Live Map', icon: MapPin },
    { id: 'vessels', label: 'Vessels', icon: Ship },
    { id: 'ports', label: 'Ports', icon: Anchor },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: Users },
  ];

  return (
    <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* LEFT: Logo */}
        <div className="flex items-center gap-2">
          <Waves className="w-7 h-7" />
          {/* <img src={logo} alt="" /> */}
          <span className="font-bold text-lg">MaritimeTrack</span>
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition
                  ${activeTab === tab.id
                    ? 'bg-white text-blue-800'
                    : 'hover:bg-blue-600'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* RIGHT: USER + MOBILE MENU */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{username}</p>
            <p className="text-xs uppercase text-blue-200">{userRole}</p>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded hover:bg-blue-600"
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>

          {/* LOGOUT */}
          <button
            onClick={onLogout}
            className="hidden sm:flex bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg items-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {mobileOpen && (
        <div className="md:hidden bg-blue-800 border-t border-blue-600">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left
                  ${activeTab === tab.id
                    ? 'bg-white text-blue-800'
                    : 'text-white hover:bg-blue-700'
                  }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}

          {/* Mobile Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-300 hover:bg-red-600"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};


const OverviewTab = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <StatCard
        icon={Ship}
        title="Active Vessels"
        value="247"
        subtitle="+12 from yesterday"
        color="#3b82f6"
        bgColor="#dbeafe"
      />
      <StatCard
        icon={Anchor}
        title="Ports Monitored"
        value="52"
        subtitle="Across 8 countries"
        color="#10b981"
        bgColor="#d1fae5"
      />
      <StatCard
        icon={AlertTriangle}
        title="Active Alerts"
        value="8"
        subtitle="3 high priority"
        color="#f59e0b"
        bgColor="#fef3c7"
      />
      <StatCard
        icon={TrendingUp}
        title="Avg Congestion"
        value="58%"
        subtitle="-5% from last week"
        color="#8b5cf6"
        bgColor="#ede9fe"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Recent Events
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {mockEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{event.type}</p>
                <p className="text-gray-600 text-xs truncate">{event.vessel || event.port}</p>
              </div>
              <div className="text-right ml-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${event.severity === 'high' ? 'bg-red-100 text-red-700' :
                  event.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                  {event.severity}
                </span>
                <p className="text-gray-500 text-xs mt-1">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-500" />
          Live Vessel Status
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {mockVesselData.map((vessel) => (
            <div key={vessel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Ship className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{vessel.name}</p>
                  <p className="text-gray-600 text-xs truncate">{vessel.location}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${vessel.status === 'In Transit' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                {vessel.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Vessels Tab
const VesselsTab = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Ship className="w-6 sm:w-7 h-6 sm:h-7 text-blue-600" />
          Vessel Tracking
        </h2>
        <button className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Add Vessel
        </button>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Vessel Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm hidden md:table-cell">IMO Number</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm hidden lg:table-cell">Location</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockVesselData.map((vessel) => (
                <tr key={vessel.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-medium text-sm">{vessel.name}</td>
                  <td className="py-4 px-4 text-gray-600 text-sm hidden md:table-cell">{vessel.imo}</td>
                  <td className="py-4 px-4">
                    <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {vessel.type}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${vessel.status === 'In Transit' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                      {vessel.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm hidden lg:table-cell">{vessel.location}</td>
                  <td className="py-4 px-4">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

// Ports Tab
// const PortsTab = () => (
//   <div className="space-y-6">
//     <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
//           <Anchor className="w-6 sm:w-7 h-6 sm:h-7 text-blue-600" />
//           Port Analytics
//         </h2>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
//         {mockPortData.map((port) => (
//           <div key={port.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
//             <div className="flex items-start justify-between mb-4">
//               <div>
//                 <h3 className="font-bold text-lg">{port.name}</h3>
//                 <p className="text-gray-600 text-sm">{port.country}</p>
//               </div>
//               <MapPin className="w-5 h-5 text-blue-600" />
//             </div>

//             <div className="space-y-3">
//               <div>
//                 <div className="flex items-center justify-between mb-1">
//                   <span className="text-sm text-gray-600">Congestion</span>
//                   <span className={`font-bold ${port.congestion > 70 ? 'text-red-600' :
//                     port.congestion > 50 ? 'text-yellow-600' : 'text-green-600'
//                     }`}>{port.congestion}%</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div
//                     className={`h-2 rounded-full transition-all duration-300 ${port.congestion > 70 ? 'bg-red-500' :
//                       port.congestion > 50 ? 'bg-yellow-500' : 'bg-green-500'
//                       }`}
//                     style={{ width: `${port.congestion}%` }}
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
//                 <div>
//                   <p className="text-gray-600 text-xs mb-1">Vessels</p>
//                   <p className="font-bold text-lg">{port.vessels}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-600 text-xs mb-1">Avg Wait</p>
//                   <p className="font-bold text-lg">{port.avgWait}h</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>
// );

// Analytics Tab
const AnalyticsTab = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 sm:w-7 h-6 sm:h-7 text-blue-600" />
        Analytics & Reports
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
          <h3 className="font-bold mb-2">Vessel Traffic Trends</h3>
          <p className="text-gray-600 text-sm mb-4">Last 30 days analysis</p>
          <div className="h-48 flex items-end justify-around gap-2">
            {[65, 82, 78, 90, 85, 95, 88].map((height, i) => (
              <div key={i} className="flex-1 bg-blue-500 rounded-t-lg hover:bg-blue-600 transition-colors cursor-pointer" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100">
          <h3 className="font-bold mb-2">Port Efficiency</h3>
          <p className="text-gray-600 text-sm mb-4">Average turnaround time</p>
          <div className="h-48 flex items-end justify-around gap-2">
            {[45, 72, 55, 68, 62, 78, 70].map((height, i) => (
              <div key={i} className="flex-1 bg-green-500 rounded-t-lg hover:bg-green-600 transition-colors cursor-pointer" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Main Dashboard Component
export default function MaritimeDashboard() {

  const [selectedPort, setSelectedPort] = useState(null);

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const username = localStorage.getItem('username') || 'User';
  const userRole = localStorage.getItem('user_role') || 'operator';




  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        // Call logout API to blacklist token
        await apiRequest('/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data
      clearAuth();
      window.location.href = '/';
    }
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'profile':
        return <UserProfile />;

      case 'map':
        return (
          <div style={{ height: '70vh', width: '100%' }}>
            <VesselMap selectedPort={selectedPort} />
          </div>
        );

      case 'vessels':
        return <VesselsTab />;

      case 'ports':
        // return <Ports onPortSelect={setSelectedPort}/>;
        return (
          <Ports
            onPortSelect={(port) => {
              setSelectedPort(port);
              setActiveTab('map'); // ✅ switch to map
            }}
          />
        );

      case 'analytics':
        return <AnalyticsTab />;

      default:
        return <OverviewTab />;
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* <DashboardHeader
        username={username}
        userRole={userRole}
        onLogout={handleLogout}
        onMenuToggle={() => setSidebarOpen(true)}
      /> */}
      <TopNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        username={username}
        userRole={userRole}
        onLogout={handleLogout}
      />

      {/* <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={userRole}
        /> */}

      <div>


        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
// ===============================================================================================
