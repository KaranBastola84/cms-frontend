import React, { useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import authService from "../services/authService";

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
        setUser(userData);
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
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    }
  };

  const studentLogin = async (email, password) => {
    const response = await authService.studentLogin(email, password);
    if (response.success) {
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    authService.updateUser(userData);
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
