import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/common/Layout";
import DashboardLayout from "../components/common/DashboardLayout";
import Login from "../components/pages/auth/Login";
import StaffVerification from "../components/pages/auth/StaffVerification";
import TrainerVerification from "../components/pages/auth/TrainerVerification";
import InquiryForm from "../components/pages/InquiryForm";
import Products from "../components/pages/Products";
import {
  ProtectedRoute,
  PublicRoute,
  HomeRedirect,
} from "../utils/ProtectedRoute";

// Import dashboards
import AdminDashboard from "../components/pages/admin/AdminDashboard";
import AuditLogs from "../components/pages/admin/AuditLogs";
import AllUsers from "../components/pages/admin/AllUsers";
import Inquiries from "../components/pages/admin/Inquiries";
import StaffManagement from "../components/pages/admin/StaffManagement";
import TrainerManagement from "../components/pages/admin/TrainerManagement";
import StaffDashboard from "../components/pages/staff/StaffDashboard";
import TrainerDashboard from "../components/pages/trainer/TrainerDashboard";
import StudentDashboard from "../components/pages/student/StudentDashboard";
import Settings from "../components/pages/Settings";

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

      <Route
        path="/products"
        element={
          <PublicRoute>
            <Layout>
              <Products />
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

      <Route
        path="/staff-verification"
        element={
          <PublicRoute>
            <Layout>
              <StaffVerification />
            </Layout>
          </PublicRoute>
        }
      />

      <Route
        path="/trainer-verification"
        element={
          <PublicRoute>
            <Layout>
              <TrainerVerification />
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
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <DashboardLayout>
              <AllUsers />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/inquiries"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
            <DashboardLayout>
              <Inquiries />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/staff-management"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <DashboardLayout>
              <StaffManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/trainer-management"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <DashboardLayout>
              <TrainerManagement />
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

      {/* Settings Route - Accessible to all authenticated users */}
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute
            allowedRoles={["Admin", "Staff", "Trainer", "Student"]}
          >
            <DashboardLayout>
              <Settings />
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
