import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem("access_token", access);
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Dashboard API endpoints
export const dashboardAPI = {
  // Company Dashboard
  getCompanyDashboard: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.dateRange && filters.dateRange !== 'all') {
        params.append('date_range', filters.dateRange);
      }
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }

      const response = await api.get(`/dashboard/company/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company dashboard:', error);
      throw error;
    }
  },

  // Port Dashboard
  getPortDashboard: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.portId && filters.portId !== 'all') {
        params.append('port_id', filters.portId);
      }
      if (filters.timeRange && filters.timeRange !== 'today') {
        params.append('time_range', filters.timeRange);
      }

      const response = await api.get(`/dashboard/port/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching port dashboard:', error);
      throw error;
    }
  },

  // Insurer Dashboard
  getInsurerDashboard: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.riskLevel && filters.riskLevel !== 'all') {
        params.append('risk_level', filters.riskLevel);
      }
      if (filters.dateRange && filters.dateRange !== 'month') {
        params.append('date_range', filters.dateRange);
      }

      const response = await api.get(`/dashboard/insurer/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching insurer dashboard:', error);
      throw error;
    }
  },

  // Get ports list
  getPorts: async () => {
    try {
      const response = await api.get('/ports/');
      return response.data;
    } catch (error) {
      console.error('Error fetching ports:', error);
      return [];
    }
  },
};

// Admin API endpoints
export const adminAPI = {
  // Get all users
  getUsers: async () => {
    try {
      const response = await api.get('/admin/users/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get system info
  getSystemInfo: async () => {
    try {
      const response = await api.get('/admin/system-info/');
      return response.data;
    } catch (error) {
      console.error('Error fetching system info:', error);
      return null;
    }
  },

  // Export data
  exportData: async () => {
    try {
      const response = await api.get('/admin/export/', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  },

  // Start database backup
  startBackup: async () => {
    try {
      const response = await api.post('/admin/backup/');
      return response.data;
    } catch (error) {
      console.error('Error starting backup:', error);
      throw error;
    }
  },

  // Update user status (activate/deactivate)
  updateUserStatus: async (userId, action) => {
    try {
      const response = await api.post(`/admin/users/${userId}/${action}/`);
      return response.data;
    } catch (error) {
      console.error(`Error performing ${action} on user:`, error);
      throw error;
    }
  },

  // Purge old data
  purgeOldData: async () => {
    try {
      const response = await api.post('/admin/data/purge/');
      return response.data;
    } catch (error) {
      console.error('Error purging data:', error);
      throw error;
    }
  },

  // Import data from file
  importData: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/admin/import/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  },

  // Update system configuration
  updateSystemConfig: async (config) => {
    try {
      const response = await api.put('/admin/system-config/', config);
      return response.data;
    } catch (error) {
      console.error('Error updating system config:', error);
      throw error;
    }
  },
};

export default api;