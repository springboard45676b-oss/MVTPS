import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Ship, 
  Anchor, 
  Route, 
  Calendar, 
  Bell, 
  MapPin, 
  User, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
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
    <aside className="sidebar">
      {/* Header with User Info */}
      <div className="sidebar-header">
        <h2 className="sidebar-title">Maritime Tracking</h2>
        {user && (
          <div className="user-info">
            <div className="user-avatar">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <p className="user-name">{user.username}</p>
              <p className="user-role">{user.role || 'User'}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                isActive ? 'sidebar-link active' : 'sidebar-link'
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      {/* Logout Button */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;