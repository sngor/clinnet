// src/app/providers/AuthProvider.jsx
import React, { createContext, useState, useContext, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signOut, getCurrentUser, fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';
import userService from "../../services/userService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        console.log("Checking auth state...");
        const userData = await getCurrentUser();
        console.log("Current user:", userData);
        
        const attributes = await fetchUserAttributes();
        console.log("User attributes:", attributes);
        
        // Get auth session for token
        const session = await fetchAuthSession();
        if (session && session.tokens && session.tokens.idToken) {
          const token = session.tokens.idToken.toString();
          setAuthToken(token);
          console.log("Auth token obtained successfully");
        } else {
          console.warn("No valid auth token found in session");
        }
        
        // Extract role from Cognito attributes or use a default
        const role = attributes['custom:role'] || 'user';
        
        // Create the user object
        const userObj = {
          username: userData.username,
          firstName: attributes.given_name || '',
          lastName: attributes.family_name || '',
          email: attributes.email || '',
          phone: attributes.phone_number || '',
          role: role.toLowerCase(), // Ensure role is lowercase for consistency
          sub: attributes.sub
        };
        
        // Fetch profile image if available
        try {
          const profileImageResult = await userService.getProfileImage();
          if (profileImageResult.success && profileImageResult.hasImage) {
            userObj.profileImage = profileImageResult.imageUrl;
          }
        } catch (imageError) {
          console.error('Error fetching profile image:', imageError);
        }
        
        setUser(userObj);
        
        // Redirect based on role if at login page
        if (window.location.pathname === '/login') {
          if (role.toLowerCase() === "admin") navigate("/admin");
          else if (role.toLowerCase() === "doctor") navigate("/doctor");
          else if (role.toLowerCase() === "frontdesk") navigate("/frontdesk");
        }
      } catch (error) {
        console.log('No authenticated user found', error);
        setUser(null);
        setAuthToken(null);
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

  // Refresh auth token periodically
  useEffect(() => {
    if (!user) return;
    
    const refreshToken = async () => {
      try {
        const session = await fetchAuthSession();
        if (session && session.tokens && session.tokens.idToken) {
          const token = session.tokens.idToken.toString();
          setAuthToken(token);
          console.log("Auth token refreshed successfully");
        }
      } catch (error) {
        console.error("Error refreshing auth token:", error);
      }
    };
    
    // Refresh token every 45 minutes (token typically expires after 1 hour)
    const tokenRefreshInterval = setInterval(refreshToken, 45 * 60 * 1000);
    
    return () => clearInterval(tokenRefreshInterval);
  }, [user]);

  // Login with Cognito
  const login = async (userData) => {
    try {
      setLoading(true);
      console.log('Attempting to sign in with:', userData.username);
      
      // Direct call to Amplify Auth with v6 format
      const signInResult = await signIn({
        username: userData.username,
        password: userData.password
      });
      
      console.log('Sign in result:', signInResult);
      
      if (signInResult.isSignedIn) {
        // Get user attributes
        const currentUser = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        const role = attributes['custom:role'] || 'user';
        
        // Get auth session for token
        const session = await fetchAuthSession();
        if (session && session.tokens && session.tokens.idToken) {
          const token = session.tokens.idToken.toString();
          setAuthToken(token);
          console.log("Auth token obtained after login");
        }
        
        console.log('User authenticated successfully:', { 
          username: currentUser.username,
          role: role
        });
        
        // Create the user object
        const userObj = {
          username: currentUser.username,
          firstName: attributes.given_name || '',
          lastName: attributes.family_name || '',
          email: attributes.email || '',
          phone: attributes.phone_number || '',
          role: role.toLowerCase(), // Ensure role is lowercase for consistency
          sub: attributes.sub
        };
        
        // Fetch profile image if available
        try {
          const profileImageResult = await userService.getProfileImage();
          if (profileImageResult.success && profileImageResult.hasImage) {
            userObj.profileImage = profileImageResult.imageUrl;
          }
        } catch (imageError) {
          console.error('Error fetching profile image:', imageError);
        }
        
        setUser(userObj);
        
        // Redirect based on role
        if (role.toLowerCase() === "admin") navigate("/admin");
        else if (role.toLowerCase() === "doctor") navigate("/doctor");
        else if (role.toLowerCase() === "frontdesk") navigate("/frontdesk");
        else navigate("/"); // Fallback redirect
        
        return { success: true };
      } else if (signInResult.nextStep && signInResult.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        // Handle new password required scenario
        return { 
          success: false, 
          error: 'You need to change your password. Please contact your administrator.' 
        };
      } else {
        return { 
          success: false, 
          error: 'Failed to sign in' 
        };
      }
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
      setLoading(true);
      await signOut();
      setUser(null);
      setAuthToken(null);
      navigate("/login");
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    authToken,
    loading,
    isAuthenticated: !!user,
    login,
    logout
  }), [user, authToken, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};