import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const login = async (credentials) => {
    try {
      const data = await loginUser(credentials);
      setUser(data.user);
      setToken(data.access);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const register = async (payload) => {
    try {
      const data = await registerUser(payload);
      return {
        success: true,
        user: data.user,
        role: data.user.role,
      };
    } catch (error) {
      throw error;
    }
  };

  // Remove navigate from here - let components handle navigation
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    // Don't navigate here - let the calling component handle it
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  const value = { 
    user, 
    token, 
    login, 
    register, 
    logout, 
    updateUser,
    isAuthenticated: Boolean(token) 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};