import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const isStudentRole = (role) =>
  role === "Student" || role === "EnrolledStudent";

// Protect routes that require authentication
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === "Admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === "Staff") {
      return <Navigate to="/staff/dashboard" replace />;
    } else if (user?.role === "Trainer") {
      return <Navigate to="/trainer/dashboard" replace />;
    } else if (isStudentRole(user?.role)) {
      return <Navigate to="/student/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

// Redirect authenticated users away from auth pages
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    // Redirect to appropriate dashboard
    if (user?.role === "Admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === "Staff") {
      return <Navigate to="/staff/dashboard" replace />;
    } else if (user?.role === "Trainer") {
      return <Navigate to="/trainer/dashboard" replace />;
    } else if (isStudentRole(user?.role)) {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return children;
};

// Redirect to home or dashboard based on auth status
export const HomeRedirect = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    // Redirect to appropriate dashboard
    if (user?.role === "Admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === "Staff") {
      return <Navigate to="/staff/dashboard" replace />;
    } else if (user?.role === "Trainer") {
      return <Navigate to="/trainer/dashboard" replace />;
    } else if (isStudentRole(user?.role)) {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return <Navigate to="/" replace />;
};
