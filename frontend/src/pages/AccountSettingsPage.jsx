// src/pages/AccountSettingsPage.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  // Container, // Removed Container
  Avatar,
  IconButton,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Snackbar,
  FormHelperText,
  Badge,
  Tooltip,
} from "@mui/material";
import { useAuth } from "../app/providers/AuthProvider";
import userService from "../services/userService";
import { getAuthToken } from "../utils/cognito-helpers";
import { fileToDataUri } from "../utils/fileUtils";
import {
  SettingsPageLayout,
  UnifiedFormField,
  UnifiedButton,
  UnifiedCard,
} from "../components/ui";
import PersonIcon from "@mui/icons-material/Person";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LockIcon from "@mui/icons-material/Lock";
import SaveIcon from "@mui/icons-material/Save";
import PasswordIcon from "@mui/icons-material/Password";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { validatePassword } from "../utils/password-validator";

function AccountSettingsPage({ onProfileImageUpdated }) {
  const { user, updateProfileImage, refreshUserData } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    // Pre-fill form with current user data when component mounts
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      }));

      // Set profile image from user object if available
      if (user.profileImage) {
        setProfileImage(user.profileImage);
      } else {
        // Fetch profile image if not in user object
        fetchProfileImage();
      }
    }
  }, [user]);

  const fetchProfileImage = async () => {
    try {
      const result = await userService.getProfileImage();
      if (result.success && result.hasImage) {
        setProfileImage(result.imageUrl);
        // Also update in auth context
        updateProfileImage(result.imageUrl);
      }
    } catch (error) {
      console.error("Error fetching profile image:", error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear password error when user types
    if (
      name === "newPassword" ||
      name === "confirmPassword" ||
      name === "currentPassword"
    ) {
      setPasswordError(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showNotification = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Update user profile in Cognito
      const result = await userService.updateUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });

      if (result.success) {
        // Refresh user data in auth context
        if (typeof refreshUserData === "function") {
          await refreshUserData();
        }
        showNotification("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message || "Failed to update profile");
      showNotification("Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPasswordError(null);

    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (!formData.currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }

    // Validate password strength
    const validation = validatePassword(formData.newPassword);
    if (!validation.isValid) {
      setPasswordError(validation.message);
      return;
    }

    setPasswordLoading(true);

    try {
      // Change password in Cognito
      const result = await userService.changePassword(
        formData.currentPassword,
        formData.newPassword
      );

      if (result.success) {
        // Clear password fields
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        // Refresh user data in auth context
        if (typeof refreshUserData === "function") {
          await refreshUserData();
        }
        showNotification("Password changed successfully");
      }
    } catch (error) {
      console.error("Error changing password:", error);

      // Handle specific Cognito error messages
      if (error.name === "NotAuthorizedException") {
        setPasswordError("Incorrect current password");
      } else if (error.name === "LimitExceededException") {
        setPasswordError("Too many attempts. Please try again later");
      } else {
        setPasswordError(error.message || "Failed to change password");
      }

      showNotification("Failed to change password", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleImageClick = () => {
    // Trigger file input click
    fileInputRef.current.click();
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showNotification(
        "Please select a valid image file (JPEG, PNG, GIF, WEBP)",
        "error"
      );
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("Image size should be less than 5MB", "error");
      return;
    }

    setImageLoading(true);

    try {
      // Try direct file upload first (more reliable)
      let result;
      try {
        result = await uploadFileDirectly(file);
      } catch (directUploadError) {
        console.log(
          "Direct upload failed, falling back to base64 method",
          directUploadError
        );

        // Fallback to base64 method
        const base64 = await fileToDataUri(file);
        // Do NOT strip the data:image/...;base64, prefix. Send the full data URI string.
        const imageData = base64; // Always send the full data URI string
        // Upload image with proper formatting
        result = await userService.uploadProfileImage(imageData);
      }

      if (result && (result.success || result.imageUrl)) {
        setProfileImage(result.imageUrl);
        // Also update in auth context
        updateProfileImage(result.imageUrl);
        showNotification("Profile image updated successfully");
        // Notify parent component if callback provided
        if (typeof onProfileImageUpdated === "function") {
          onProfileImageUpdated();
        }
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      showNotification("Failed to upload profile image", "error");
    } finally {
      setImageLoading(false);
    }
  };

  const handleRemoveProfileImage = async () => {
    setImageLoading(true);
    try {
      await userService.removeProfileImage();
      setProfileImage(null);
      // Update in auth context
      updateProfileImage(null);
      showNotification("Profile image removed successfully");
      // Notify parent component if callback provided
      if (typeof onProfileImageUpdated === "function") {
        onProfileImageUpdated();
      }
    } catch (error) {
      console.error("Error removing profile image:", error);
      showNotification("Failed to remove profile image", "error");
    } finally {
      setImageLoading(false);
    }
  };

  // Removed inline convertFileToBase64; using fileUtils.fileToDataUri

  // Alternative direct file upload using JSON
  const uploadFileDirectly = async (file) => {
    const idToken = await getAuthToken();

    // Convert file to base64
    const base64 = await fileToDataUri(file);
    // base64 is already the full data URI string (e.g., "data:image/png;base64,...")
    const jsonPayload = JSON.stringify({
      image: base64, // send the full data URI string
    });

    const response = await fetch(
      `${import.meta.env.VITE_API_ENDPOINT}/users/profile-image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken ? `Bearer ${idToken}` : undefined,
        },
        body: jsonPayload,
      }
    );
    if (!response.ok) {
      throw new Error("Failed to upload image");
    }
    return await response.json();
  };

  return (
    <SettingsPageLayout
      title="Account Settings"
      subtitle="Manage your profile information and security settings"
    >
      <UnifiedCard title="Profile Information">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <UnifiedFormField
              type="text"
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <UnifiedFormField
              type="text"
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <UnifiedFormField
              type="email"
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <UnifiedFormField
              type="tel"
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <UnifiedButton
            variant="contained"
            onClick={handleProfileUpdate}
            disabled={loading}
            loading={loading}
            startIcon={!loading && <SaveIcon />}
          >
            {loading ? "Updating..." : "Update Profile"}
          </UnifiedButton>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </UnifiedCard>

      <UnifiedCard title="Change Password" sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <UnifiedFormField
              type="password"
              label="Current Password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <UnifiedFormField
              type="password"
              label="New Password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <UnifiedFormField
              type="password"
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </Grid>
        </Grid>

        {passwordError && (
          <FormHelperText error sx={{ mt: 2 }}>
            {passwordError}
          </FormHelperText>
        )}

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <UnifiedButton
            variant="contained"
            onClick={handlePasswordChange}
            disabled={passwordLoading}
            loading={passwordLoading}
            startIcon={!passwordLoading && <LockIcon />}
          >
            {passwordLoading ? "Changing..." : "Change Password"}
          </UnifiedButton>
        </Box>
      </UnifiedCard>

      <UnifiedCard title="Profile Image" sx={{ mt: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            src={profileImage}
            alt="Profile Image"
            variant="rounded"
            sx={{ width: 100, height: 100, borderRadius: 2 }}
          >
            {user && !user.profileImage && <PersonIcon fontSize="large" />}
          </Avatar>

          <Box>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: "none" }}
            />

            <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
              <UnifiedButton
                variant="contained"
                onClick={handleImageClick}
                startIcon={<PhotoCameraIcon />}
                disabled={imageLoading}
                loading={imageLoading}
              >
                {imageLoading ? "Uploading..." : "Upload Image"}
              </UnifiedButton>

              {profileImage && (
                <UnifiedButton
                  variant="outlined"
                  onClick={handleRemoveProfileImage}
                  disabled={imageLoading}
                >
                  {imageLoading ? "Removing..." : "Remove Image"}
                </UnifiedButton>
              )}
            </Box>

            <Typography variant="body2" color="text.secondary">
              Supported formats: JPEG, PNG, GIF, WEBP. Max size: 5MB.
            </Typography>
          </Box>
        </Box>
      </UnifiedCard>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SettingsPageLayout>
  );
}

export default AccountSettingsPage;
