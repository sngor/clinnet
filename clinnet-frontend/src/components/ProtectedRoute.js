import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Added allowedRoles prop for role-based access control
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
      // Optional: Show a loading indicator while auth check is running
      return <div>Checking authentication...</div>;
  }

  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if the user's role is included in the allowedRoles array
  if (allowedRoles && !allowedRoles.includes(user.role)) {
      // User is logged in but doesn't have the right role
      // Redirect to dashboard or show an "Unauthorized" page
      console.warn(`User role '${user.role}' not authorized for this route. Allowed: ${allowedRoles.join(', ')}`);
      // You might want a dedicated Unauthorized page component
      return <Navigate to="/" state={{ from: location }} replace />;
       // Or return <div>Access Denied: You do not have permission to view this page.</div>;
  }


  return children; // User is authenticated (and authorized if roles specified), render the child component
};

export default ProtectedRoute;