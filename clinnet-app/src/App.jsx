// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./app/providers/AuthProvider";
import DateAdapter from "./app/providers/DateAdapter";
import { theme } from "./app/theme";

// Layout components
import MainLayout from "./app/layouts/MainLayout";
import AuthLayout from "./app/layouts/AuthLayout";

// Auth pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminPatientsPage from "./pages/AdminPatientsPage";
import AdminDoctorsPage from "./pages/AdminDoctorsPage";
import AdminAppointmentsPage from "./pages/AdminAppointmentsPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminServicesPage from "./pages/AdminServicesPage";

// Doctor pages
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorPatientsPage from "./pages/DoctorPatientsPage";
import DoctorAppointmentsPage from "./pages/DoctorAppointmentsPage";
import DoctorSettingsPage from "./pages/DoctorSettingsPage";

// Frontdesk pages
import FrontDeskDashboard from "./pages/FrontDeskDashboard";
import FrontdeskPatientsPage from "./pages/FrontdeskPatientsPage";
import FrontdeskAppointmentsPage from "./pages/FrontdeskAppointmentsPage";
import FrontdeskCheckoutPage from "./pages/FrontdeskCheckoutPage";

// Protected route component
import ProtectedRoute from "./app/components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DateAdapter>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Auth routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Route>

              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <MainLayout userRole="admin" />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="patients" element={<AdminPatientsPage />} />
                <Route path="doctors" element={<AdminDoctorsPage />} />
                <Route path="appointments" element={<AdminAppointmentsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="services" element={<AdminServicesPage />} />
              </Route>

              {/* Doctor routes */}
              <Route
                path="/doctor"
                element={
                  <ProtectedRoute requiredRole="doctor">
                    <MainLayout userRole="doctor" />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DoctorDashboard />} />
                <Route path="patients" element={<DoctorPatientsPage />} />
                <Route path="appointments" element={<DoctorAppointmentsPage />} />
                <Route path="settings" element={<DoctorSettingsPage />} />
              </Route>

              {/* Frontdesk routes */}
              <Route
                path="/frontdesk"
                element={
                  <ProtectedRoute requiredRole="frontdesk">
                    <MainLayout userRole="frontdesk" />
                  </ProtectedRoute>
                }
              >
                <Route index element={<FrontDeskDashboard />} />
                <Route path="patients" element={<FrontdeskPatientsPage />} />
                <Route path="appointments" element={<FrontdeskAppointmentsPage />} />
                <Route path="checkout/:appointmentId" element={<FrontdeskCheckoutPage />} />
              </Route>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </DateAdapter>
    </ThemeProvider>
  );
}

export default App;