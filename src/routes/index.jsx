import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../components/common/Layout";
import DashboardLayout from "../components/common/DashboardLayout";
import Login from "../components/pages/auth/Login";
import StudentLogin from "../components/pages/auth/StudentLogin";
import StaffVerification from "../components/pages/auth/StaffVerification";
import TrainerVerification from "../components/pages/auth/TrainerVerification";
import InquiryForm from "../components/pages/InquiryForm";
import LandingPage from "../components/pages/LandingPage";
import Home from "../components/pages/Home";
import Products from "../components/pages/Products";
import ProductDetail from "../components/pages/ProductDetail";
import ProductReview from "../components/pages/ProductReview";
import Checkout from "../components/pages/Checkout";
import OrderConfirmation from "../components/pages/OrderConfirmation";
import CertificateVerification from "../components/pages/CertificateVerification";
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
import ProductManagement from "../components/pages/admin/ProductManagement";
import ProductEdit from "../components/pages/admin/ProductEdit";
import OrderManagement from "../components/pages/admin/OrderManagement";
import StaffDashboard from "../components/pages/staff/StaffDashboard";
import TrainerDashboard from "../components/pages/trainer/TrainerDashboard";
import StudentDashboard from "../components/pages/student/StudentDashboard";
import StudentCertificates from "../components/pages/student/StudentCertificates";
import CertificateRecords from "../components/pages/staff/CertificateRecords";
import Settings from "../components/pages/Settings";
import ProductReviewModeration from "../components/pages/admin/ProductReviewModeration";
import CertificateManagement from "../components/pages/admin/CertificateManagement";
import CertificateRecommendations from "../components/pages/trainer/CertificateRecommendations";

// Import Payment & Finance pages
import FinancialDashboard from "../components/pages/admin/FinancialDashboard";
import OutstandingPayments from "../components/pages/admin/OutstandingPayments";
import PaymentPlans from "../components/pages/admin/PaymentPlans";
import FeeManagement from "../components/pages/admin/FeeManagement";
import RevenueReports from "../components/pages/admin/RevenueReports";
import CourseManagement from "../components/pages/admin/CourseManagement";
import BatchManagement from "../components/pages/admin/BatchManagement";
import AttendanceManagement from "../components/pages/admin/AttendanceManagement";
import StudentAdmission from "../components/pages/admin/StudentAdmission";
import StudentManagement from "../components/pages/admin/StudentManagement";
import PermissionManagement from "../components/pages/admin/PermissionManagement";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes - Redirect to dashboard if logged in */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
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

      {/* E-commerce Routes - Accessible to everyone */}
      <Route
        path="/products"
        element={
          <Layout>
            <Products />
          </Layout>
        }
      />
      <Route
        path="/products/:id"
        element={
          <Layout>
            <ProductDetail />
          </Layout>
        }
      />

      <Route
        path="/checkout"
        element={
          <Layout>
            <Checkout />
          </Layout>
        }
      />

      <Route
        path="/order-confirmation/:orderId"
        element={
          <Layout>
            <OrderConfirmation />
          </Layout>
        }
      />

      <Route
        path="/certificate/verify"
        element={
          <Layout>
            <CertificateVerification />
          </Layout>
        }
      />

      <Route
        path="/certificate/verify/:certificateNumber"
        element={
          <Layout>
            <CertificateVerification />
          </Layout>
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
        path="/student-login"
        element={
          <PublicRoute>
            <Layout>
              <StudentLogin />
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
        path="/admin/permissions"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <DashboardLayout>
              <PermissionManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/inquiries"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Staff", "Trainer"]}>
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
        path="/admin/course-management"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Staff", "Trainer"]}>
            <DashboardLayout>
              <CourseManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/batch-schedule"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Staff", "Trainer"]}>
            <DashboardLayout>
              <BatchManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/student-registration"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Staff", "Trainer"]}>
            <DashboardLayout>
              <StudentAdmission />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/student-management"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <DashboardLayout>
              <StudentManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/attendance"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Staff", "Trainer"]}>
            <DashboardLayout>
              <AttendanceManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/certificates"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <DashboardLayout>
              <CertificateManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/products"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <DashboardLayout>
              <ProductManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products/new"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <DashboardLayout>
              <ProductEdit />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <DashboardLayout>
              <ProductEdit />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <DashboardLayout>
              <OrderManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Payment & Finance Routes */}
      <Route
        path="/admin/finance/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Staff", "Trainer"]}>
            <DashboardLayout>
              <FinancialDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/finance/outstanding-payments"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Staff", "Trainer"]}>
            <DashboardLayout>
              <OutstandingPayments />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/finance/payment-plans"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Staff", "Trainer"]}>
            <DashboardLayout>
              <PaymentPlans />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/finance/fee-management"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <DashboardLayout>
              <FeeManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/finance/revenue-reports"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Staff", "Trainer"]}>
            <DashboardLayout>
              <RevenueReports />
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
        path="/staff/courses"
        element={
          <ProtectedRoute allowedRoles={["Staff"]}>
            <DashboardLayout>
              <CourseManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/batches"
        element={
          <ProtectedRoute allowedRoles={["Staff"]}>
            <DashboardLayout>
              <BatchManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/attendance"
        element={
          <ProtectedRoute allowedRoles={["Staff"]}>
            <DashboardLayout>
              <AttendanceManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/students"
        element={
          <ProtectedRoute allowedRoles={["Staff", "Admin", "Trainer"]}>
            <DashboardLayout>
              <StudentAdmission />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/certificates"
        element={
          <ProtectedRoute allowedRoles={["Staff", "Admin", "Trainer"]}>
            <DashboardLayout>
              <CertificateRecords />
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
        path="/trainer/certificates"
        element={
          <ProtectedRoute allowedRoles={["Trainer"]}>
            <DashboardLayout>
              <CertificateRecommendations />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Student", "EnrolledStudent"]}>
            <DashboardLayout>
              <StudentDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/certificates"
        element={
          <ProtectedRoute allowedRoles={["Student", "EnrolledStudent"]}>
            <DashboardLayout>
              <StudentCertificates />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Settings Route - Accessible to all authenticated users */}
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute
            allowedRoles={[
              "Admin",
              "Staff",
              "Trainer",
              "Student",
              "EnrolledStudent",
            ]}
          >
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Product Review Moderation */}
      <Route
        path="/admin/product-reviews"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProductReviewModeration />
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
