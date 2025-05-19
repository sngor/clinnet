// src/app/providers/AuthProvider.jsx
import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  getCognitoSession,
  cognitoSignOut,
  cognitoSignIn,
} from "../../utils/cognito-helpers";
import { userService } from "../../services/userService";

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
        const session = await getCognitoSession();
        if (session && session.isValid()) {
          // Always get full user info from Cognito attributes
          const userInfo = await userService.getUserInfo();
          setAuthToken(session.getIdToken().getJwtToken());
          setUser(userInfo);
          // Redirect if at login page
          if (window.location.pathname === "/login") {
            const role = (userInfo.role || "user").toLowerCase();
            if (role === "admin") navigate("/admin");
            else if (role === "doctor") navigate("/doctor");
            else if (role === "frontdesk") navigate("/frontdesk");
            else navigate("/");
          }
        } else {
          throw new Error("No valid session");
        }
      } catch (error) {
        console.log("No authenticated user found", error);
        setUser(null);
        setAuthToken(null);
        if (window.location.pathname !== "/login") {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, [navigate]);

  // On mount or after login, sync user info from Cognito
  useEffect(() => {
    const syncUser = async () => {
      try {
        const session = await getCognitoSession();
        if (session && session.isValid()) {
          const userInfo = await userService.getUserInfo();
          setUser(userInfo);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    };
    syncUser();
  }, []);

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
      // Always sign out first to clear any existing session
      cognitoSignOut();
      const result = await cognitoSignIn(userData.username, userData.password);
      setAuthToken(result.idToken);
      // Fetch full user info (with role, etc) after login
      const userInfo = await userService.getUserInfo();
      setUser(userInfo);
      // Redirect as before, but now with correct role
      const role = (userInfo.role || "user").toLowerCase();
      if (role === "admin") navigate("/admin");
      else if (role === "doctor") navigate("/doctor");
      else if (role === "frontdesk") navigate("/frontdesk");
      else navigate("/");
      return { success: true };
    } catch (error) {
      console.error("Error signing in:", error);
      return { success: false, error: error.message || "Failed to sign in" };
    } finally {
      setLoading(false);
    }
  };

  // Logout with Cognito
  const logout = async () => {
    try {
      setLoading(true);
      cognitoSignOut();
      setUser(null);
      setAuthToken(null);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      user,
      authToken,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      setUser, // <-- add this
      updateProfileImage: async (imageUrl) => {
        // Fetch latest user info, but always overwrite profileImage
        let latestUser = user;
        try {
          const backendUser = await userService.getUserInfo();
          latestUser = { ...backendUser };
        } catch (e) {
          // fallback to current user if backend fails
        }
        setUser({ ...latestUser, profileImage: imageUrl });
      }, // <-- add this
    }),
    [user, authToken, loading]
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
