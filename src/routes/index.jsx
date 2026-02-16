import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/common/Layout";
import DashboardLayout from "../components/common/DashboardLayout";
import Login from "../components/pages/auth/Login";
import InquiryForm from "../components/pages/InquiryForm";
import {
  ProtectedRoute,
  PublicRoute,
  HomeRedirect,
} from "../utils/ProtectedRoute";

// Import dashboards
import AdminDashboard from "../components/pages/admin/AdminDashboard";
import AuditLogs from "../components/pages/admin/AuditLogs";
import StaffDashboard from "../components/pages/staff/StaffDashboard";
import TrainerDashboard from "../components/pages/trainer/TrainerDashboard";
import StudentDashboard from "../components/pages/student/StudentDashboard";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes - Redirect to dashboard if logged in */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Layout>
              <InquiryForm />
            </Layout>
          </PublicRoute>
        }
      />
      <Route
        path="/inquiry"
        element={
          <PublicRoute>
            <Layout>
              <InquiryForm />
            </Layout>
          </PublicRoute>
        }
      />

      {/* Auth Routes - No Layout */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Layout>
              <Login />
            </Layout>
          </PublicRoute>
        }
      />

      {/* Protected Dashboard Routes with Dashboard Layout */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <DashboardLayout>
              <AuditLogs />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Staff"]}>
            <DashboardLayout>
              <StaffDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/trainer/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Trainer"]}>
            <DashboardLayout>
              <TrainerDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <DashboardLayout>
              <StudentDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect based on auth status */}
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
};

export default AppRoutes;
