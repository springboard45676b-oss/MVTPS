// client/src/components/RoleBasedUI.jsx
/**
 * Component to conditionally render UI based on user role
 * Usage:
 * <RoleBasedUI roles={['admin']}>
 *   <button>Delete Vessel</button>
 * </RoleBasedUI>
 */
import React from 'react';
import { authAPI } from '../services/api';

export const RoleBasedUI = ({ children, roles, fallback = null }) => {
  const user = authAPI.getCurrentUser();
  
  if (!user) {
    return fallback;
  }
  
  // Check if user's role is in allowed roles
  if (roles.includes(user.role)) {
    return children;
  }
  
  return fallback;
};

// ============================================

// client/src/utils/roleHelpers.js
/**
 * Helper functions for role-based logic
 */
export const authAPI_updated = {
  ...require('../services/api').authAPI,
  
  /**
   * Check if user has a specific role
   */
  hasRole: (role) => {
    const user = require('../services/api').authAPI.getCurrentUser();
    return user && user.role === role;
  },
  
  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole: (roles) => {
    const user = require('../services/api').authAPI.getCurrentUser();
    return user && roles.includes(user.role);
  },
  
  /**
   * Check if user can edit (admin or own profile)
   */
  canEdit: (targetUserId) => {
    const user = require('../services/api').authAPI.getCurrentUser();
    return user && (user.role === 'admin' || user.id === targetUserId);
  },
  
  /**
   * Check if user can delete (admin only)
   */
  canDelete: () => {
    const user = require('../services/api').authAPI.getCurrentUser();
    return user && user.role === 'admin';
  },
  
  /**
   * Get user role display name
   */
  getRoleDisplayName: (role) => {
    const roleMap = {
      'operator': 'Operator',
      'analyst': 'Analyst',
      'admin': 'Administrator'
    };
    return roleMap[role] || 'User';
  },
  
  /**
   * Get role badge color
   */
  getRoleColor: (role) => {
    const colorMap = {
      'operator': 'bg-blue-100 text-blue-800',
      'analyst': 'bg-emerald-100 text-emerald-800',
      'admin': 'bg-red-100 text-red-800'
    };
    return colorMap[role] || 'bg-slate-100 text-slate-800';
  }
};

export default authAPI_updated;