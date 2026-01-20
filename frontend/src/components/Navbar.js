import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-authenticated">
      <div className="container">
        <div className="navbar-content">
          <Link to="/dashboard" className="navbar-brand">
            <span className="logo-icon">⚓</span>
            <span className="logo-text">MaritimeTracker</span>
          </Link>
          
          <ul className="navbar-nav">
            <li>
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                <span className="nav-icon">📊</span>
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/vessels" 
                className={`nav-link ${isActive('/vessels') ? 'active' : ''}`}
              >
                <span className="nav-icon">🚢</span>
                Vessels
              </Link>
            </li>
            <li>
              <Link 
                to="/voyage-replay" 
                className={`nav-link ${isActive('/voyage-replay') ? 'active' : ''}`}
              >
                <span className="nav-icon">🎞️</span>
                Replay
              </Link>
            </li>
            <li>
              <Link 
                to="/ports" 
                className={`nav-link ${isActive('/ports') ? 'active' : ''}`}
              >
                <span className="nav-icon">🏗️</span>
                Ports
              </Link>
            </li>
            <li>
              <Link 
                to="/safety" 
                className={`nav-link ${isActive('/safety') ? 'active' : ''}`}
              >
                <span className="nav-icon">⚠️</span>
                Safety
              </Link>
            </li>
            <li>
              <Link 
                to="/analytics" 
                className={`nav-link ${isActive('/analytics') ? 'active' : ''}`}
              >
                <span className="nav-icon">📈</span>
                Analytics
              </Link>
            </li>
            <li>
              <Link 
                to="/subscriptions" 
                className={`nav-link ${isActive('/subscriptions') ? 'active' : ''}`}
              >
                <span className="nav-icon">📡</span>
                Real-Time
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;