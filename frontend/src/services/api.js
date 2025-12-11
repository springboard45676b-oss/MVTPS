import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS, API_ENDPOINTS } from '../constants';

const API_BASE_URL_CONST = API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL_CONST,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL_CONST}${API_ENDPOINTS.TOKEN_REFRESH}`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
          
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;