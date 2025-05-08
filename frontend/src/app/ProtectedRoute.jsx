// src/app/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider';
import { CircularProgress, Box } from '@mui/material';

/**
 * A wrapper component for routes that require authentication
 * and optionally specific roles
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], // Array of allowed roles, empty means any authenticated user
  redirectPath = '/login' 
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has one of the allowed roles
  if (allowedRoles.length > 0) {
    const userRole = user?.role?.toLowerCase();
    const hasAllowedRole = allowedRoles.some(
      role => role.toLowerCase() === userRole
    );

    if (!hasAllowedRole) {
      // Redirect to unauthorized page if user doesn't have required role
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and has required role, render the children
  return children;
};

export default ProtectedRoute;