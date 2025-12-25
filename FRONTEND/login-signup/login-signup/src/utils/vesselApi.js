// src/utils/vesselApi.js

import { apiRequest } from './api';

export const vesselApi = {
  // Get all vessels
  getVessels: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await apiRequest(`/vessels/?${params}`);
    return response.json();
  },

  // Get vessel by ID
  getVessel: async (id) => {
    const response = await apiRequest(`/vessels/${id}/`);
    return response.json();
  },

  // Get vessel positions
  getVesselPositions: async (id, hours = 24) => {
    const response = await apiRequest(`/vessels/${id}/positions/?hours=${hours}`);
    return response.json();
  },

  // Get map data
  getMapData: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await apiRequest(`/vessels/map/?${params}`);
    return response.json();
  },

  // Get statistics
  getStatistics: async () => {
    const response = await apiRequest('/vessels/statistics/');
    return response.json();
  },

  // Sync vessel
  syncVessel: async (id) => {
    const response = await apiRequest(`/vessels/${id}/sync/`, {
      method: 'POST',
    });
    return response.json();
  },

  // Sync all vessels
  syncAll: async () => {
    const response = await apiRequest('/vessels/sync_all/', {
      method: 'POST',
    });
    return response.json();
  },
};

export const portApi = {
  getPorts: async () => {
    const response = await apiRequest('/ports/');
    return response.json();
  },

  getPort: async (id) => {
    const response = await apiRequest(`/ports/${id}/`);
    return response.json();
  },
};