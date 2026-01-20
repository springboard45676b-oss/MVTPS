import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show back button on dashboard (home page)
  if (location.pathname === '/dashboard' || location.pathname === '/') {
    return null;
  }

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to dashboard if no history
      navigate('/dashboard');
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const pageNames = {
      '/vessels': 'Vessels',
      '/ports': 'Ports',
      '/safety': 'Safety',
      '/analytics': 'Analytics',
      '/notifications': 'Notifications',
      '/subscriptions': 'Real-Time',
      '/profile': 'Profile'
    };
    
    return pageNames[path] || 'Page';
  };

  return (
    <button 
      className="back-button"
      onClick={handleBack}
      title={`Go back from ${getPageTitle()}`}
    >
      <span className="back-button-icon">←</span>
      <span className="back-button-text">Back</span>
    </button>
  );
};

export default BackButton;