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

        // Try to refresh the token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/auth/token/refresh/`,
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
    try {
      console.log('Login attempt with:', { username: credentials.username });
      
      const response = await api.post('/auth/login/', {
        username: credentials.username || credentials.email,
        password: credentials.password,
        // Don't send selected_role - let backend determine it from the database
      });
      
      console.log('Login response:', response.data);
      
      // Store tokens and user data
      const { access, refresh, user } = response.data;
      
      if (!access || !refresh || !user) {
        console.error('Missing required data in response:', response.data);
        throw new Error('Login failed: Invalid response from server');
      }
      
      // Save to localStorage - IMPORTANT: user must be a valid object
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user)); // Stringify the user object
      
      console.log('Tokens and user data saved to localStorage');
      console.log('User role:', user.role);
      
      return { token: access, user };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register/', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        password2: userData.password2,
        role: userData.role
      });
      
      // Store tokens and user data from registration response
      const { access, refresh, user } = response.data;
      if (access && refresh && user) {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user', JSON.stringify(user));
        return { token: access, user };
      }
      
      // Fallback to auto-login if tokens not in response
      return authAPI.login({
        username: userData.username,
        password: userData.password,
      });
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    console.log('User logged out');
  },
  
  // Get current user from localStorage - SAFE VERSION
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      
      // If no user in storage, return null instead of trying to parse undefined
      if (!user) {
        console.warn('No user data found in localStorage');
        return null;
      }
      
      // Parse and return the user object
      const parsedUser = JSON.parse(user);
      return parsedUser;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      // If parsing fails, clear the corrupted data
      localStorage.removeItem('user');
      return null;
    }
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
    try {
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
    } catch (error) {
      console.error('Edit profile error:', error);
      throw error;
    }
  }
};

export default api;