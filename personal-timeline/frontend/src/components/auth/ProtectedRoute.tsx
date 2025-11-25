import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
export default ProtectedRoute;
