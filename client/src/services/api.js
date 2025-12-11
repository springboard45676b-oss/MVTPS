import axios from "axios";

// Create axios instance with base URL and headers
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData - let axios handle it
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // No refresh token, redirect to login
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Try to refresh the token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/auth/refresh/`,
          { refresh: refreshToken }
        );

        const { access, refresh } = response.data;

        // Update tokens in localStorage
        localStorage.setItem("access_token", access);
        if (refresh) {
          localStorage.setItem("refresh_token", refresh);
        }

        // Update the Authorization header
        originalRequest.headers.Authorization = `Bearer ${access}`;

        // Retry the original request
        return api(originalRequest);
      } catch (error) {
        // If refresh fails, clear tokens and redirect to login
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

// Auth API methods
export const authAPI = {
  // Login user (with username or email)
  login: async (credentials) => {
    const response = await api.post('/auth/login/', {
      username: credentials.username || credentials.email,
      password: credentials.password
    });
    
    // Store tokens and user data
    const { access, refresh, user } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { token: access, user };
  },
  
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register/', {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      password2: userData.password2,
      role: userData.role
    });
    
    // Store tokens and user data from registration response
    const { access, refresh, user } = response.data;
    if (access && refresh) {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      return { token: access, user };
    }
    
    // Fallback to auto-login if tokens not in response
    return authAPI.login({
      username: userData.username,
      password: userData.password
    });
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
  
  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  // Update user profile (username, email, role, password)
  updateProfile: async (formData) => {
    // Convert FormData to JSON if needed
    let data = formData;
    if (formData instanceof FormData) {
      data = {};
      for (let [key, value] of formData.entries()) {
        if (value !== '' && value !== null) {
          data[key] = value;
        }
      }
    }

    const response = await api.put('/auth/profile/update/', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Update user data in localStorage
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  
  // Fetch current user data from server
  fetchCurrentUser: async () => {
    try {
      const response = await api.get('/auth/profile/');
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // If there's an error, return the user from localStorage if available
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  // Update user profile via /profile/edit/
  editProfile: async (formData) => {
    // Keep as FormData and send directly
    const response = await api.put('/auth/profile/edit/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Update user data in localStorage
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }
};

export default api;