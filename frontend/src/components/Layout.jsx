import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Ship } from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Vessels', path: '/vessels' },
    { name: 'Ports', path: '/ports' },
    { name: 'Voyages', path: '/voyages' },
    { name: 'Events', path: '/events' },
    { name: 'Notifications', path: '/notifications' },
    { name: 'Live Tracking', path: '/live-tracking' },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Ship className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">MVIPS Platform</span>
          </div>
          
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  location.pathname === item.path
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-300 text-sm">Signed in</span>
            <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition text-sm">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="w-full h-[calc(100vh-64px)] overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;