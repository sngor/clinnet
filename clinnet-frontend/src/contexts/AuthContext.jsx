import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../services/authService'; // Assuming authService exports login, logout, checkAuthStatus

const AuthContext = createContext(defaultContextValue);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state for initial auth check

  // Check auth status on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      setLoading(true);
      try {
        const currentUser = await authService.checkAuthStatus();
        setUser(currentUser); // Set user if token is valid
      } catch (error) {
        // console.error("Auth check failed:", error); // Keep this commented out or handle appropriately
        setUser(null); // Ensure user is null if check fails
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  const login = async (username, password) => {
    try {
      const loggedInUser = await authService.login(username, password);
      if (loggedInUser) {
        setUser(loggedInUser); // Set user state upon successful login
        return true; // Indicate success
      }
      // If login service doesn't throw but returns falsy for failure
      throw new Error('Login failed: Invalid credentials or server error.');
    } catch (error) {
      // console.error("Login error in context:", error); // Keep commented out or handle
      setUser(null); // Ensure user is null on login failure
      // Re-throw the error so the LoginPage can catch it and display a message
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // console.error("Logout error:", error); // Optional: log logout errors
    } finally {
      setUser(null); // Clear user state regardless of API call success
    }
  };

  // Provide loading state along with user and auth functions
  const value = { user, login, logout, loading };

  // Don't render children until initial auth check is complete
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;