// src/app/router.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import AdminDashboard from "../pages/AdminDashboard";
import DoctorDashboard from "../pages/DoctorDashboard";
import FrontDeskDashboard from "../pages/FrontDeskDashboard";
import PatientManagementPage from "../pages/PatientManagementPage";
import AdminPatientsPage from "../pages/AdminPatientsPage";
import AdminServicesPage from "../pages/AdminServicesPage";
import PatientDetailPage from "../pages/PatientDetailPage";
import NewPatientPage from "../pages/NewPatientPage";
import NotFoundPage from "../pages/NotFoundPage";
import UserManagementPage from "../pages/UserManagementPage";
import AccountSettingsPage from "../pages/AccountSettingsPage";
import FrontdeskAppointmentsPage from "../pages/FrontdeskAppointmentsPage";
import DoctorAppointmentsPage from "../pages/DoctorAppointmentsPage";
import AdminAppointmentsPage from "../pages/AdminAppointmentsPage";
import StyleGuidePage from "../pages/StyleGuidePage";
import AppLayout from "../components/Layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";

function AppRouter() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Style Guide Route - accessible without login for development purposes */}
      <Route path="/style-guide" element={<StyleGuidePage />} />

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
        {/* Add route for Admin Appointments */}
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAppointmentsPage />
            </ProtectedRoute>
          }
        />
        {/* Add route for Admin Services */}
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminServicesPage />
            </ProtectedRoute>
          }
        />
        {/* Add route for Admin Patients */}
        <Route
          path="/admin/patients"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPatientsPage />
            </ProtectedRoute>
          }
        />
        {/* Admin New Patient Page */}
        <Route
          path="/admin/patients/new"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <NewPatientPage />
            </ProtectedRoute>
          }
        />
        {/* Admin Patient Detail Page */}
        <Route
          path="/admin/patients/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PatientDetailPage />
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
        {/* Doctor Patient Detail Page */}
        <Route
          path="/doctor/patients/:id"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <PatientDetailPage />
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
          path="/doctor/appointments"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorAppointmentsPage />
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
        <Route
          path="/frontdesk/appointments"
          element={
            <ProtectedRoute allowedRoles={["frontdesk"]}>
              <FrontdeskAppointmentsPage />
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
        {/* New Patient Page for Front Desk */}
        <Route
          path="/frontdesk/patients/new"
          element={
            <ProtectedRoute allowedRoles={["frontdesk"]}>
              <NewPatientPage />
            </ProtectedRoute>
          }
        />
        {/* Frontdesk Patient Detail Page */}
        <Route
          path="/frontdesk/patients/:id"
          element={
            <ProtectedRoute allowedRoles={["frontdesk"]}>
              <PatientDetailPage />
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