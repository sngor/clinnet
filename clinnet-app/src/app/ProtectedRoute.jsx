// src/app/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider'; // Adjust path as needed

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page, saving the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if the user's role is allowed for this route
  // If allowedRoles is not provided or empty, just check for authentication
  const isAuthorized =!allowedRoles || allowedRoles.length === 0 || (user && allowedRoles.includes(user.role));
  
        if (!isAuthorized) {
          // Redirect to an unauthorized page or a default dashboard
          // For MVP, maybe redirect to a simple "Unauthorized" page or back to login/home
          console.warn(`User role '${user?.role}' not authorized for route requiring roles: ${allowedRoles.join(', ')}`);
          // Option 1: Redirect to a dedicated unauthorized page (create this page)
          // return <Navigate to="/unauthorized" replace />;
          // Option 2: Redirect to login (or home/default dashboard)
          return <Navigate to="/login" replace />; // Or '/' or role-specific default
        }
  
        // If authenticated and authorized, render the child component
        return children;
      };
