// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const token = localStorage.getItem("token"); // simple check

  // If not logged in, go to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token exists — allow rendering protected page
  return children;
};

export default ProtectedRoute;
