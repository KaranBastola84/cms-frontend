import React, { useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import authService from "../services/authService";
import {
  getDefaultPermissionsForRole,
  normalizePermissionList,
} from "../constants/permissions";

const normalizeUserPermissions = (userData) => {
  if (!userData) return null;

  const normalizedPermissions = normalizePermissionList(userData.permissions);
  const fallbackPermissions = getDefaultPermissionsForRole(userData.role);

  return {
    ...userData,
    permissions:
      normalizedPermissions.length > 0
        ? normalizedPermissions
        : fallbackPermissions,
  };
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    const initAuth = () => {
      const userData = authService.getCurrentUser();
      const isAuthenticated = authService.isAuthenticated();

      if (isAuthenticated && userData) {
        setUser(normalizeUserPermissions(userData));
      } else if (userData) {
        // User data exists but token is expired, clear it
        authService.logout();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const response = await authService.login(username, password);
    if (response.success) {
      const normalizedUser = normalizeUserPermissions(response.data.user);
      setUser(normalizedUser);
      return { success: true, user: normalizedUser };
    }
  };

  const studentLogin = async (email, password) => {
    const response = await authService.studentLogin(email, password);
    if (response.success) {
      const normalizedUser = normalizeUserPermissions(response.data.user);
      setUser(normalizedUser);
      return { success: true, user: normalizedUser };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (userData) => {
    const normalizedUser = normalizeUserPermissions(userData);
    setUser(normalizedUser);
    authService.updateUser(normalizedUser);
  };

  const value = {
    user,
    login,
    studentLogin,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === "Admin",
    isStaff: user?.role === "Staff",
    isTrainer: user?.role === "Trainer",
    isStudent: user?.role === "Student",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <p className="text-xl text-amber-900 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
