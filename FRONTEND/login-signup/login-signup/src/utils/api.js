// src/utils/api.js

const API_BASE_URL = 'http://localhost:8000/api';

// Get tokens from localStorage
export const getTokens = () => {
  return {
    access: localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token'),
  };
};

// Save tokens to localStorage
export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

// Clear all auth data
export const clearAuth = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('jwt'); // legacy
  localStorage.removeItem('user_role');
  localStorage.removeItem('username');
};

// Refresh access token
export const refreshAccessToken = async () => {
  const { refresh } = getTokens();
  
  if (!refresh) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    
    return data.access;
  } catch (error) {
    clearAuth();
    throw error;
  }
};

// API request with automatic token refresh
export const apiRequest = async (endpoint, options = {}) => {
  const { access } = getTokens();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(access && { Authorization: `Bearer ${access}` }),
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    let response = await fetch(`${API_BASE_URL}${endpoint}`, mergedOptions);

    // If token expired, try to refresh
    if (response.status === 401) {
      const newAccessToken = await refreshAccessToken();
      
      // Retry request with new token
      mergedOptions.headers.Authorization = `Bearer ${newAccessToken}`;
      response = await fetch(`${API_BASE_URL}${endpoint}`, mergedOptions);
    }

    return response;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};