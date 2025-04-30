import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Optional: Show a loading spinner while checking auth status
    return <div>Loading...</div>;
  }

  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they
    // log in, which is a nicer user experience than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if the route requires specific roles and if the user has one of them
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to a 'not authorized' page or back to dashboard/home
    return <Navigate to="/" replace />; // Or show an 'Unauthorized' component
  }

  return children; // User is authenticated and authorized, render the component
};

export default ProtectedRoute;