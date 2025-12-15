// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
