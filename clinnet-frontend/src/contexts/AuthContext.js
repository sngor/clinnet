import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, checkAuthStatus } from '../services/authService'; // Placeholder service

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null: checking, false: not logged in, object: logged in
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth status when the app loads (e.g., check for a token)
    const verifyAuth = async () => {
        setLoading(true);
        try {
            // In a real app, you'd check a token validity with the backend
            const currentUser = await checkAuthStatus(); // Simulates API call
            if (currentUser) {
                setUser(currentUser); // User object { username, role, id, etc. }
            } else {
                setUser(false); // Explicitly set to false if not authenticated
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            setUser(false); // Set to false on error
        } finally {
            setLoading(false);
        }
    };
    verifyAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const userData = await apiLogin(username, password); // Call the API service
      setUser(userData); // Store user data { username, role }
      return true; // Indicate success
    } catch (error) {
      console.error("Login failed:", error);
      setUser(false); // Ensure user is marked as not logged in on failure
      throw error; // Re-throw error to be handled in LoginPage
    }
  };

  const logout = async () => {
    try {
        await apiLogout(); // Call backend if needed (e.g., invalidate token)
    } catch(error) {
        console.error("Logout failed:", error);
        // Decide if you still want to clear frontend state even if backend fails
    } finally {
        setUser(false); // Clear user state on frontend
        // Optionally redirect using useNavigate in the component calling logout
    }
  };

  // Don't render children until initial auth check is complete
  if (loading) {
      return <div>Loading authentication status...</div>; // Or a proper spinner
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};