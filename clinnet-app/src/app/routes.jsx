// src/app/routes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import LoginPage from '../pages/LoginPage';
import AdminDashboard from '../pages/AdminDashboard';
import UserManagementPage from '../pages/UserManagementPage';
import DoctorDashboard from '../pages/DoctorDashboard';
import FrontdeskDashboard from '../pages/FrontdeskDashboard';
import NotFoundPage from '../pages/NotFoundPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import { useAuth } from './providers/AuthProvider';

// Simple route guard component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      {/* Protected routes with AppLayout */}
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        {/* Admin routes */}
        <Route path="admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagementPage />
          </ProtectedRoute>
        } />
        
        {/* Doctor routes */}
        <Route path="doctor" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        } />
        
        {/* Front Desk routes */}
        <Route path="frontdesk" element={
          <ProtectedRoute allowedRoles={['frontdesk']}>
            <FrontdeskDashboard />
          </ProtectedRoute>
        } />
        
        {/* Default redirect for authenticated users */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        {/* Catch-all route for authenticated users */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      
      {/* Catch-all route for unauthenticated users */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}