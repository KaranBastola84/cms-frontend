import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/common/Layout";
import Login from "../components/pages/auth/Login";
import InquiryForm from "../components/pages/InquiryForm";
import { ProtectedRoute, PublicRoute } from "../utils/ProtectedRoute";

// Import dashboards
import AdminDashboard from "../components/pages/admin/AdminDashboard";
import StaffDashboard from "../components/pages/staff/StaffDashboard";
import TrainerDashboard from "../components/pages/trainer/TrainerDashboard";
import StudentDashboard from "../components/pages/student/StudentDashboard";

const AppRoutes = () => {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<InquiryForm />} />
        <Route path="/inquiry" element={<InquiryForm />} />

        {/* Auth Routes - Redirect to dashboard if already logged in */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Role-Based Dashboard Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Staff"]}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trainer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Trainer"]}>
              <TrainerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;
