// src/app/providers/AuthProvider.jsx
import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  getCognitoSession,
  cognitoSignOut,
  cognitoSignIn,
  cognitoSignUp,
  cognitoConfirmSignUp,
  cognitoForgotPassword,
  cognitoForgotPasswordSubmit,
  completeNewPassword,
} from "../../utils/cognito-helpers";
import { userService } from "../../services/userService";
import mockAuthService from "../../services/mockAuthService";
import config from "../../services/config";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  // Add state for profile image
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();

  // Function to update profile image in user state
  const updateProfileImage = useCallback(
    (imageUrl) => {
      setProfileImage(imageUrl);

      // Update user object with profile image
      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          profileImage: imageUrl,
          avatar: imageUrl, // Add avatar property for consistency
        };
      });
    },
    [setUser]
  );

  // Function to refresh user data from Cognito
  const refreshUserData = useCallback(async () => {
    try {
      const session = await getCognitoSession();
      if (session && session.isValid()) {
        const userInfo = await userService.getUserInfo();

        // Preserve profile image if it exists in current user data
        if (user?.profileImage && !userInfo.profileImage) {
          userInfo.profileImage = user.profileImage;
        }

        setUser(userInfo);
        return userInfo;
      }
      return null;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return null;
    }
  }, [user]);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        console.log("Checking auth state...");

        // Use mock authentication in development
        if (mockAuthService.isMockMode()) {
          console.log("Using mock authentication for local development");
          const session = await mockAuthService.getCurrentSession();
          if (session && session.isValid()) {
            const userInfo = await mockAuthService.getUserInfo();
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
            throw new Error("No valid mock session");
          }
          return;
        }

        // Use real Cognito authentication
        const session = await getCognitoSession();
        if (session && session.isValid()) {
          // Always get full user info from Cognito attributes
          const userInfo = await userService.getUserInfo();

          // Get profile image
          try {
            const imageResult = await userService.getProfileImage();
            if (imageResult.success && imageResult.hasImage) {
              userInfo.profileImage = imageResult.imageUrl;
              userInfo.avatar = imageResult.imageUrl; // Add avatar property for consistency
            }
          } catch (imageError) {
            console.warn("Could not fetch profile image:", imageError);
          }

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

    // Safety net: if auth check hangs for any reason, stop loading and go to /login
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("Auth check timed out; proceeding to /login");
        setLoading(false);
        if (window.location.pathname !== "/login") {
          navigate("/login");
        }
      }
    }, 8000);

    checkAuthState().finally(() => clearTimeout(timeoutId));
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
        const session = await getCognitoSession();
        if (session && session.isValid()) {
          const token = session.getIdToken().getJwtToken();
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

  // Login with Cognito or Mock
  const login = async (userData) => {
    try {
      setLoading(true);

      // Use mock authentication in development
      if (mockAuthService.isMockMode()) {
        console.log("Using mock authentication for login");
        const result = await mockAuthService.login(
          userData.username,
          userData.password
        );

        setAuthToken(result.token);
        setUser(result.user);

        // Redirect based on role
        const role = (result.user.role || "user").toLowerCase();
        if (role === "admin") navigate("/admin");
        else if (role === "doctor") navigate("/doctor");
        else if (role === "frontdesk") navigate("/frontdesk");
        else navigate("/");

        return { success: true };
      }

      // Use real Cognito authentication
      // Always sign out first to clear any existing session
      cognitoSignOut();
      let result;
      try {
        result = await cognitoSignIn(userData.username, userData.password);
      } catch (err) {
        // Handle first-login flow requiring password change
        if (err && err.message === "NEW_PASSWORD_REQUIRED") {
          return {
            success: false,
            requiresNewPassword: true,
            challengeUser: err.user,
            requiredAttributes: err.requiredAttributes,
            error: "A new password is required to complete first-time sign-in.",
          };
        }
        throw err;
      }
      setAuthToken(result.idToken);
      // Fetch full user info (with role, etc) after login
      const userInfo = await userService.getUserInfo();

      // Get profile image immediately after login
      try {
        const imageResult = await userService.getProfileImage();
        if (imageResult.success && imageResult.hasImage) {
          userInfo.profileImage = imageResult.imageUrl;
          userInfo.avatar = imageResult.imageUrl; // Add avatar property for consistency
        }
      } catch (imageError) {
        console.warn("Could not fetch profile image during login:", imageError);
      }

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

  // Complete new password challenge
  const finishNewPassword = async (
    challengeUser,
    newPassword,
    attributes = {}
  ) => {
    try {
      setLoading(true);
      await completeNewPassword(challengeUser, newPassword, attributes);
      // After completing, fetch session and user info
      const session = await getCognitoSession();
      if (!session || !session.isValid()) {
        throw new Error("Session invalid after password update");
      }
      setAuthToken(session.getIdToken().getJwtToken());
      const userInfo = await userService.getUserInfo();
      setUser(userInfo);
      // Redirect by role
      const role = (userInfo.role || "user").toLowerCase();
      if (role === "admin") navigate("/admin");
      else if (role === "doctor") navigate("/doctor");
      else if (role === "frontdesk") navigate("/frontdesk");
      else navigate("/");
      return { success: true };
    } catch (error) {
      console.error("Error completing new password challenge:", error);
      return {
        success: false,
        error: error.message || "Failed to set new password",
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout with Cognito or Mock
  const logout = async () => {
    try {
      setLoading(true);

      // Use mock authentication in development
      if (mockAuthService.isMockMode()) {
        await mockAuthService.logout();
      } else {
        cognitoSignOut();
      }

      setUser(null);
      setAuthToken(null);
      // Clear profile image data
      setProfileImage(null);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  // Register with Cognito
  const register = async (username, password, email, attributes) => {
    try {
      setLoading(true);
      const result = await cognitoSignUp(username, password, email, attributes);
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Error registering:", error);
      return { success: false, error: error.message || "Failed to register" };
    } finally {
      setLoading(false);
    }
  };

  // Confirm registration with Cognito
  const confirmRegistration = async (username, code) => {
    try {
      setLoading(true);
      await cognitoConfirmSignUp(username, code);
      return { success: true };
    } catch (error) {
      console.error("Error confirming registration:", error);
      return {
        success: false,
        error: error.message || "Failed to confirm registration",
      };
    } finally {
      setLoading(false);
    }
  };

  // Reset password with Cognito
  const resetPassword = async (username) => {
    try {
      setLoading(true);
      await cognitoForgotPassword(username);
      return { success: true };
    } catch (error) {
      console.error("Error resetting password:", error);
      return {
        success: false,
        error: error.message || "Failed to reset password",
      };
    } finally {
      setLoading(false);
    }
  };

  // Confirm reset password with Cognito
  const confirmResetPassword = async (username, code, newPassword) => {
    try {
      setLoading(true);
      await cognitoForgotPasswordSubmit(username, code, newPassword);
      return { success: true };
    } catch (error) {
      console.error("Error confirming reset password:", error);
      return {
        success: false,
        error: error.message || "Failed to confirm reset password",
      };
    } finally {
      setLoading(false);
    }
  };

  // Check if user has required role
  const hasRole = (requiredRole) => {
    if (!user || !user.role) return false;
    return user.role.toLowerCase() === requiredRole.toLowerCase();
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
      register,
      confirmRegistration,
      resetPassword,
      confirmResetPassword,
      hasRole,
      updateProfileImage,
      refreshUserData, // Add the new method to the context
      finishNewPassword, // Expose new-password completion
    }),
    [user, authToken, loading, updateProfileImage, refreshUserData]
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
