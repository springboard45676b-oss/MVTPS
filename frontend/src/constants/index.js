// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// User Roles
export const USER_ROLES = {
  OPERATOR: 'operator',
  ANALYST: 'analyst',
  ADMIN: 'admin'
};

// Route Paths
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/',
  PROFILE: '/profile'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data'
};

// API Endpoints
export const API_ENDPOINTS = {
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  PROFILE: '/auth/profile/',
  TOKEN_REFRESH: '/auth/token/refresh/'
};