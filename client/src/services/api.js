import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ==============================
// REQUEST INTERCEPTOR
// ==============================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let axios handle FormData headers
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==============================
// RESPONSE INTERCEPTOR (TOKEN REFRESH)
// ==============================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          logoutAndRedirect();
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"}/auth/refresh/`,
          { refresh: refreshToken }
        );

        const { access, refresh } = response.data;

        localStorage.setItem("access_token", access);
        if (refresh) {
          localStorage.setItem("refresh_token", refresh);
        }

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (err) {
        logoutAndRedirect();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// ==============================
// HELPER
// ==============================
const logoutAndRedirect = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

// ==============================
// AUTH API
// ==============================
export const authAPI = {
  // LOGIN (JWT ONLY)
  login: async ({ username, password, email }) => {
    try {
      console.log("Login attempt with:", { username });

      const response = await api.post("/auth/login/", {
        username: username || email,
        password,
      });

      console.log("Login response:", response.data);

      const { access, refresh } = response.data;

      if (!access || !refresh) {
        throw new Error("Login failed: No tokens received");
      }

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      return { token: access };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // REGISTER
  register: async (userData) => {
    try {
      await api.post("/auth/register/", {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        password2: userData.password2,
        role: userData.role,
      });

      // Auto-login after registration
      return authAPI.login({
        username: userData.username,
        password: userData.password,
      });
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  },

  // LOGOUT
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    console.log("User logged out");
  },

  // CHECK AUTH
  isAuthenticated: () => {
    return !!localStorage.getItem("access_token");
  },

  // FETCH CURRENT USER (AFTER LOGIN)
  fetchCurrentUser: async () => {
    try {
      const response = await api.get("/auth/profile/");
      if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
        return response.data;
      }
    } catch (error) {
      console.error("Fetch user error:", error);
    }
    return null;
  },

  // GET USER FROM STORAGE
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // EDIT PROFILE
  editProfile: async (formData) => {
    try {
      const response = await api.put("/auth/profile/edit/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error("Edit profile error:", error);
      throw error;
    }
  },
};

export default api;
