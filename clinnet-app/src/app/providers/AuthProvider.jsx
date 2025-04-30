// src/app/providers/AuthProvider.jsx
import React, { createContext, useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // user: { username: string, role: string } | null
  const navigate = useNavigate();

  // Simulate login
  const login = async (userData) => {
    // In real app, call backend API, get token and user role
    // For MVP, just set the user state
    console.log("Simulating login for:", userData);
    // Example: Hardcode roles based on username for demo
    let role = 'guest';
    if (userData.username === 'admin') role = 'admin';
    else if (userData.username === 'doctor') role = 'doctor';
    else if (userData.username === 'frontdesk') role = 'frontdesk';

    setUser({ username: userData.username, role: role });
    // Redirect based on role after login
    if (role === 'admin') navigate('/admin');
    else if (role === 'doctor') navigate('/doctor');
    else if (role === 'frontdesk') navigate('/frontdesk');
    else navigate('/'); // Fallback redirect
  };

  // Simulate logout
  const logout = () => {
    // In real app, clear token, call logout endpoint
    setUser(null);
    navigate('/login', { replace: true });
  };

  // Use useMemo to prevent unnecessary re-renders of context consumers
  const value = useMemo(() => ({
    user,
    isAuthenticated:!!user,
    login,
    logout,
  }), [user]); // Dependency array includes user

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};