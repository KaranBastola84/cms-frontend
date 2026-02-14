import React, { useState, useEffect } from "react";
import apiInstance from "../config/api";
import { AuthContext } from "../contexts/AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("userData");

      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiInstance.post("/api/Auth/login", {
        email,
        password,
      });

      const { token, user: userData } = response.data;

      // Store token and user data
      localStorage.setItem("authToken", token);
      localStorage.setItem("userData", JSON.stringify(userData));

      setUser(userData);

      return userData;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setUser(null);
    window.location.href = "/";
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isStaff: user?.role === "staff",
    isTrainer: user?.role === "trainer",
    isStudent: user?.role === "student",
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
