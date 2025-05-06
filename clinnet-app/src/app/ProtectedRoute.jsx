// src/app/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./providers/AuthProvider";

/**
 * Protected route component
 * Redirects to login if user is not authenticated or not authorized
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} [props.allowedRoles] - Roles allowed to access this route
 * @returns {React.ReactNode} The protected component or a redirect
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page, saving the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if the user's role is allowed for this route
  // If allowedRoles is not provided or empty, just check for authentication
  const isAuthorized =
    !allowedRoles ||
    allowedRoles.length === 0 ||
    (user && allowedRoles.includes(user.role));

  if (!isAuthorized) {
    // Redirect to an unauthorized page or a default dashboard
    console.warn(
      `User role '${
        user?.role
      }' not authorized for route requiring roles: ${allowedRoles.join(", ")}`
    );
    // Redirect to login
    return <Navigate to="/login" replace />;
  }

  // If authenticated and authorized, render the child component
  return children;
};