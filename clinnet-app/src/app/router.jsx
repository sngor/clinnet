// src/app/router.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import AdminDashboard from "../pages/AdminDashboard";
import DoctorDashboard from "../pages/DoctorDashboard";
import FrontDeskDashboard from "../pages/FrontDeskDashboard";
import PatientManagementPage from "../pages/PatientManagementPage";
import AppointmentManagementPage from "../pages/AppointmentManagementPage";
import NotFoundPage from "../pages/NotFoundPage";
import UserManagementPage from "../pages/UserManagementPage";
import AccountSettingsPage from "../pages/AccountSettingsPage";
import AppLayout from "../components/Layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";

function AppRouter() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes within AppLayout */}
      {/* This outer ProtectedRoute ensures user is logged in for any route within AppLayout */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin", "doctor", "frontdesk"]}>
            <AppLayout /> {/* AppLayout should contain an <Outlet /> */}
          </ProtectedRoute>
        }
      >
        {/* Specific role-based routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        {/* Add route for User Management */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        {/* Admin Appointments */}
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AppointmentManagementPage />
            </ProtectedRoute>
          }
        />
        {/* Patient Management for Doctor */}
        <Route
          path="/doctor/patients"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <PatientManagementPage />
            </ProtectedRoute>
          }
        />
        {/* Doctor Appointments */}
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <AppointmentManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/frontdesk"
          element={
            <ProtectedRoute allowedRoles={["frontdesk"]}>
              <FrontDeskDashboard />
            </ProtectedRoute>
          }
        />
        {/* Front Desk Appointments */}
        <Route
          path="/frontdesk/appointments"
          element={
            <ProtectedRoute allowedRoles={["frontdesk"]}>
              <AppointmentManagementPage />
            </ProtectedRoute>
          }
        />
        {/* Patient Management for Front Desk */}
        <Route
          path="/frontdesk/patients"
          element={
            <ProtectedRoute allowedRoles={["frontdesk"]}>
              <PatientManagementPage />
            </ProtectedRoute>
          }
        />
        {/* Add route for Account Settings */}
        <Route
          path="/account-settings"
          element={
            <ProtectedRoute allowedRoles={["admin", "doctor", "frontdesk"]}>
              <AccountSettingsPage />
            </ProtectedRoute>
          }
        />
        {/* Example: Redirect root path to login or a default dashboard */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Route>

      {/* Catch-all for Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;