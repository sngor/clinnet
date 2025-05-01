// src/app/router.jsx (Example structure)
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import AdminDashboard from "../pages/AdminDashboard";
import DoctorDashboard from "../pages/DoctorDashboard";
import FrontDeskDashboard from "../pages/FrontDeskDashboard";
import PatientListPage from "../pages/PatientListPage"; // Import the new patient page
import NotFoundPage from "../pages/NotFoundPage";
import UserManagementPage from "../pages/UserManagementPage"; // Import the new page
import AccountSettingsPage from "../pages/AccountSettingsPage"; // Import the new settings page
import AppLayout from "../components/Layout/AppLayout"; // Assuming layout component exists
import { ProtectedRoute } from "./ProtectedRoute"; // Import the protector component

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
        {/* Add route for Patient List */}
        <Route
          path="/doctor/patients"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <PatientListPage />
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
        {/* Add route for Account Settings */}
        <Route
          path="/account-settings"
          element={
            <ProtectedRoute allowedRoles={["admin", "doctor", "frontdesk"]}>
              {" "}
              {/* Or just check auth */}
              <AccountSettingsPage />
            </ProtectedRoute>
          }
        />
        {/* Add more specific routes like /patients, /appointments here */}
        {/* Example: Redirect root path to login or a default dashboard */}
        <Route path="/" element={<Navigate to="/login" replace />} />{" "}
        {/* Or redirect to a default dashboard if appropriate */}
      </Route>

      {/* Catch-all for Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;
