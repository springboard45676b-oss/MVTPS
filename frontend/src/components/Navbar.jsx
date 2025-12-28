import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Ship, Anchor, Route, Calendar, Bell, MapPin, User, LogOut } from 'lucide-react';
import { Link } from "react-router-dom";
const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/vessels', icon: Ship, label: 'Vessels' },
    { path: '/ports', icon: Anchor, label: 'Ports' },
    { path: '/voyages', icon: Route, label: 'Voyages' },
    { path: '/events', icon: Calendar, label: 'Events' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/live-tracking', icon: MapPin, label: 'Live Tracking' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="top-navbar">
      <div className="top-navbar-container">
        {/* Brand/Logo */}
        <div className="top-navbar-brand">
          <h1>Maritime Tracking</h1>
        </div>

        {/* Navigation Links */}
        <div className="top-navbar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
          
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  isActive ? 'top-navbar-link active' : 'top-navbar-link'
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Info & Logout */}
        <div className="top-navbar-user">
          {user && (
            <div className="top-navbar-user-info">
              <div className="top-navbar-avatar">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="top-navbar-user-details">
                <span className="top-navbar-username">{user.username}</span>
                <span className="top-navbar-role">{user.role || 'User'}</span>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="top-navbar-logout">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;