// src/app/providers/AuthProvider.jsx
import React, { createContext, useState, useContext, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from 'aws-amplify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const userData = await Auth.currentAuthenticatedUser();
        // Extract role from Cognito attributes or use a default
        const role = userData.attributes['custom:role'] || 'user';
        
        setUser({
          username: userData.username,
          firstName: userData.attributes.given_name,
          lastName: userData.attributes.family_name,
          email: userData.attributes.email,
          role: role,
          sub: userData.attributes.sub
        });
        
        // Redirect based on role if at login page
        if (window.location.pathname === '/login') {
          if (role === "admin") navigate("/admin");
          else if (role === "doctor") navigate("/doctor");
          else if (role === "frontdesk") navigate("/frontdesk");
        }
      } catch (error) {
        console.log('No authenticated user found');
        setUser(null);
        // Only redirect to login if not already there
        if (window.location.pathname !== '/login') {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, [navigate]);

  // Login with Cognito
  const login = async (userData) => {
    try {
      setLoading(true);
      const cognitoUser = await Auth.signIn(userData.username, userData.password);
      
      // Get user attributes
      const userAttributes = cognitoUser.attributes || {};
      const role = userAttributes['custom:role'] || 'user';
      
      setUser({
        username: cognitoUser.username,
        firstName: userAttributes.given_name,
        lastName: userAttributes.family_name,
        email: userAttributes.email,
        role: role,
        sub: userAttributes.sub
      });
      
      // Redirect based on role
      if (role === "admin") navigate("/admin");
      else if (role === "doctor") navigate("/doctor");
      else if (role === "frontdesk") navigate("/frontdesk");
      else navigate("/"); // Fallback redirect
      
      return { success: true };
    } catch (error) {
      console.error('Error signing in:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to sign in' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout with Cognito
  const logout = async () => {
    try {
      await Auth.signOut();
      setUser(null);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Use useMemo to prevent unnecessary re-renders of context consumers
  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
      loading
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};