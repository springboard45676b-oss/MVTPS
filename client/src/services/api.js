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
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Try to refresh the token - FIXED URL
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
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  // Login user (with username or email)
  login: async (credentials) => {
    try {
      console.log('🔐 Login attempt with:', { 
        username: credentials.username, 
        selected_role: credentials.selected_role 
      });
      
      const response = await api.post('/auth/login/', {
        username: credentials.username || credentials.email,
        password: credentials.password,
        selected_role: credentials.selected_role
      });
      
      console.log('✅ Login response received:', response.data);
      
      // Store tokens and user data
      const { access, refresh, user } = response.data;
      
      if (!access || !refresh) {
        console.error('❌ No tokens in response:', response.data);
        throw new Error('Login failed: No tokens received');
      }
      
      // Save to localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('✅ Tokens saved successfully');
      console.log('User role:', user.role);
      
      return { token: access, user };
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message);
      
      // Better error handling
      if (error.response?.data) {
        const errorMessage = Object.values(error.response.data).flat().join(', ');
        throw new Error(errorMessage);
      }
      
      throw error;
    }
  },
  
  // Register new user
  register: async (userData) => {
    try {
      console.log('📝 Register attempt:', { 
        username: userData.username, 
        email: userData.email,
        role: userData.role 
      });
      
      const response = await api.post('/auth/register/', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        password2: userData.password2,
        role: userData.role
      });
      
      console.log('✅ Registration successful:', response.data);
      
      // Store tokens and user data from registration response
      const { access, refresh, user } = response.data;
      if (access && refresh) {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user', JSON.stringify(user));
        return { token: access, user };
      }
      
      // Fallback to auto-login if tokens not in response
      console.log('🔄 Auto-login after registration...');
      return authAPI.login({
        username: userData.username,
        password: userData.password,
        selected_role: userData.role
      });
    } catch (error) {
      console.error('❌ Register error:', error.response?.data || error.message);
      
      // Better error handling
      if (error.response?.data) {
        const errorMessage = Object.values(error.response.data).flat().join(', ');
        throw new Error(errorMessage);
      }
      
      throw error;
    }
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    console.log('👋 User logged out');
  },
  
  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Fetch current user data from server
  fetchCurrentUser: async () => {
    try {
      const response = await api.get('/auth/profile/');
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        console.log('✅ User profile fetched:', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      // If there's an error, return the user from localStorage if available
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  // Update user profile via /profile/edit/
  editProfile: async (formData) => {
    try {
      console.log('✏️ Updating profile...');
      
      const response = await api.put('/auth/profile/edit/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Profile updated:', response.data);
      
      // Update user data in localStorage
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Edit profile error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default api;