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
  Container,
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
import { FormField, FormLayout } from "../components/ui";
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
        console.log('Direct upload failed, falling back to base64 method', directUploadError);
        
        // Fallback to base64 method
        const base64 = await convertFileToBase64(file);
        
        // Remove the data:image/jpeg;base64, prefix if present
        const imageData = base64.includes('base64,') ? 
          base64.split('base64,')[1] : base64;
        
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

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  
  // Alternative direct file upload using JSON
  const uploadFileDirectly = async (file) => {
    const idToken = await getAuthToken();
    
    // Convert file to base64
    const base64 = await convertFileToBase64(file);
    const base64Data = base64.includes('base64,') ? 
      base64.split('base64,')[1] : base64;
    
    // Create JSON payload
    const jsonPayload = JSON.stringify({
      image: base64Data,
      contentType: file.type || 'image/jpeg'
    });
    
    const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/users/profile-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: jsonPayload
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    try {
      return await response.json();
    } catch (e) {
      return { 
        success: true,
        imageUrl: `${import.meta.env.VITE_API_ENDPOINT}/users/profile-image?t=${Date.now()}`
      };
    }
  };

  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        color="primary.main"
        fontWeight="medium"
        sx={{ mb: 3 }}
      >
        Account Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Profile Section */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <PersonIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="medium">
              Profile Information
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleProfileUpdate} noValidate>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                mb: 3,
                alignItems: { xs: "center", sm: "flex-start" },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  mr: { xs: 0, sm: 4 },
                  mb: { xs: 3, sm: 0 },
                }}
              >
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  badgeContent={
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Upload profile picture">
                        <IconButton
                          onClick={handleImageClick}
                          disabled={imageLoading}
                          sx={{
                            bgcolor: "background.paper",
                            border: "1px solid",
                            borderColor: "divider",
                            "&:hover": {
                              bgcolor: "background.paper",
                            },
                          }}
                          size="small"
                        >
                          {imageLoading ? (
                            <CircularProgress size={16} />
                          ) : (
                            <PhotoCameraIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      {profileImage && (
                        <Tooltip title="Remove profile picture">
                          <IconButton
                            onClick={handleRemoveProfileImage}
                            disabled={imageLoading}
                            sx={{
                              bgcolor: "background.paper",
                              border: "1px solid",
                              borderColor: "divider",
                              "&:hover": {
                                bgcolor: "background.paper",
                              },
                            }}
                            size="small"
                          >
                            <PersonIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  }
                >
                  <Avatar
                    src={profileImage}
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: "primary.main",
                      fontSize: "2.5rem",
                    }}
                  >
                    {user?.firstName?.[0] || user?.username?.[0] || "U"}
                  </Avatar>
                </Badge>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  style={{ display: "none" }}
                />
              </Box>

              <FormLayout spacing={2} withPaper={false} sx={{ flexGrow: 1 }}>
                <FormField
                  type="text"
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                
                <FormField
                  type="text"
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                
                <FormField
                  type="email"
                  name="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  helperText="Email cannot be changed as it's used for authentication"
                  sx={{ gridColumn: "span 2" }}
                />
                
                <FormField
                  type="tel"
                  name="phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  sx={{ gridColumn: "span 2" }}
                />
                
                <Box sx={{ display: "flex", justifyContent: "flex-end", gridColumn: "span 2" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    sx={{
                      py: 1,
                      px: 3,
                      borderRadius: 1.5,
                    }}
                  >
                    Save Profile
                  </Button>
                </Box>
              </FormLayout>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <LockIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="medium">
              Change Password
            </Typography>
          </Box>

          {passwordError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {passwordError}
            </Alert>
          )}

          <Box component="form" onSubmit={handlePasswordChange} noValidate>
            <FormLayout spacing={2} withPaper={false}>
                <FormField
                  type="password"
                  name="currentPassword"
                  label="Current Password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                />
                
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <FormField
                    type="password"
                    name="newPassword"
                    label="New Password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                  />
                  <PasswordStrengthMeter password={formData.newPassword} />
                  <FormHelperText>
                    Password must be at least 8 characters with uppercase,
                    lowercase, number, and special character
                  </FormHelperText>
                </Box>
                
                <FormField
                  type="password"
                  name="confirmPassword"
                  label="Confirm New Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  error={
                    formData.newPassword !== formData.confirmPassword &&
                    formData.confirmPassword !== ""
                  }
                  helperText={
                    formData.newPassword !== formData.confirmPassword &&
                    formData.confirmPassword !== ""
                      ? "Passwords do not match"
                      : ""
                  }
                />
                
                <Box sx={{ display: "flex", justifyContent: "flex-end", gridColumn: "span 3" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    disabled={
                      passwordLoading ||
                      !formData.currentPassword ||
                      !formData.newPassword ||
                      !formData.confirmPassword
                    }
                    startIcon={
                      passwordLoading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <PasswordIcon />
                      )
                    }
                    sx={{
                      py: 1,
                      px: 3,
                      borderRadius: 1.5,
                    }}
                  >
                    Change Password
                  </Button>
                </Box>
            </FormLayout>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AccountSettingsPage;
