import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const token = window.localStorage.getItem("access");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/auth/me/");
        setUser(res.data);
      } catch (err) {
        window.localStorage.removeItem("access");
        window.localStorage.removeItem("refresh");
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (username, password) => {
    const res = await api.post("/auth/token/", { username, password });
    window.localStorage.setItem("access", res.data.access);
    window.localStorage.setItem("refresh", res.data.refresh);
    const me = await api.get("/auth/me/");
    setUser(me.data);
    return me.data;
  };

  const register = async ({ username, email, password, role }) => {
    const payload = role ? { username, email, password, role } : { username, email, password };
    return api.post("/auth/register/", payload);
  };

  const logout = (redirectTo = "/login") => {
    window.localStorage.removeItem("access");
    window.localStorage.removeItem("refresh");
    setUser(null);
    navigate(redirectTo);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
