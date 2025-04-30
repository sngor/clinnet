// src/app/router.jsx (Example structure)
import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import AdminDashboard from "../pages/AdminDashboard";
import DoctorDashboard from "../pages/DoctorDashboard";
import FrontDeskDashboard from "../pages/FrontDeskDashboard";
import NotFoundPage from "../pages/NotFoundPage";
import AppLayout from "../components/Layout/AppLayout"; // Assuming layout component exists
import { ProtectedRoute } from "./ProtectedRoute"; // Import the protector component

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <ProtectedRoute allowedRoles={["admin", "doctor", "frontdesk"]}>
        <Route element={<AppLayout />}>
          {" "}
          {/* Wrap protected routes in layout */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
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
          {/* Add more specific routes like /patients, /appointments here, also protected */}
        </Route>
      </ProtectedRoute>
      {/* Catch-all for Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;

// Then, render <AppRouter /> within App.jsxs
