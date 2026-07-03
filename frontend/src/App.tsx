import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute, GuestRoute } from './hooks/useProtectedRoute';

// Lazy-loaded pages
const HomePage = lazy(() => import('./pages/Home').then((m) => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('./pages/auth/Login').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/Register').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPassword').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPassword').then((m) => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmail').then((m) => ({ default: m.VerifyEmailPage })));

const CourseListingPage = lazy(() => import('./pages/courses/CourseListing').then((m) => ({ default: m.CourseListingPage })));
const CourseDetailPage = lazy(() => import('./pages/courses/CourseDetail').then((m) => ({ default: m.CourseDetailPage })));
const LearnPage = lazy(() => import('./pages/learn/LearnPage').then((m) => ({ default: m.LearnPage })));

const StudentDashboard = lazy(() => import('./pages/dashboard/StudentDashboard').then((m) => ({ default: m.StudentDashboard })));
const MyCoursesPage = lazy(() => import('./pages/dashboard/MyCourses').then((m) => ({ default: m.MyCoursesPage })));
const SettingsPage = lazy(() => import('./pages/dashboard/Settings').then((m) => ({ default: m.SettingsPage })));
const PaymentHistoryPage = lazy(() => import('./pages/dashboard/PaymentHistory').then((m) => ({ default: m.PaymentHistoryPage })));
const WishlistPage = lazy(() => import('./pages/dashboard/Wishlist').then((m) => ({ default: m.WishlistPage })));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const AdminCoursesPage = lazy(() => import('./pages/admin/AdminCourses').then((m) => ({ default: m.AdminCoursesPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsers').then((m) => ({ default: m.AdminUsersPage })));
const AdminPaymentsPage = lazy(() => import('./pages/admin/AdminPayments').then((m) => ({ default: m.AdminPaymentsPage })));
const AdminActivityPage = lazy(() => import('./pages/admin/AdminActivity').then((m) => ({ default: m.AdminActivityPage })));

const NotFoundPage = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFoundPage })));

const App: React.FC = () => {
  return (
    <Routes>
      {/* Auth routes (guest only) */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

      {/* Learn page (protected, no navbar) */}
      <Route
        path="/learn/:courseId"
        element={
          <ProtectedRoute>
            <LearnPage />
          </ProtectedRoute>
        }
      />

      {/* Student Dashboard — admins are redirected to /admin automatically */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute studentOnly>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="courses" element={<MyCoursesPage />} />
        <Route path="payments" element={<PaymentHistoryPage />} />
      </Route>

      {/* Settings (under dashboard layout) */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SettingsPage />} />
      </Route>

      {/* Wishlist */}
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<WishlistPage />} />
      </Route>

      {/* Admin Panel */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="courses" element={<AdminCoursesPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="activity" element={<AdminActivityPage />} />
      </Route>

      {/* Main public routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CourseListingPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
