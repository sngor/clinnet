// src/pages/AccountSettingsPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useAuth } from "../app/providers/AuthProvider"; // Adjust path as needed

function AccountSettingsPage() {
  const { user /* Need a function to update user details via API */ } =
    useAuth();
  const [formData, setFormData] = useState({
    username: "",
    // Add other fields like firstName, lastName, email if applicable
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Pre-fill form with current user data when component mounts
    if (user) {
      setFormData((prev) => ({
        ...prev,
        username: user.username || "",
        // Pre-fill other fields if they exist on the user object
      }));
    }
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      setError("New passwords do not match.");
      return;
    }
    if (formData.newPassword && !formData.currentPassword) {
      setError("Current password is required to set a new password.");
      return;
    }

    setLoading(true);

    // --- Replace with API Call ---
    console.log("Submitting account settings:", formData);
    // Example API call structure:
    /*
    try {
      // Assuming you have an updateUser function in your AuthProvider or a dedicated API service
      const updatedUserData = { ...formData }; // Prepare payload
      // Remove passwords if not changing, or structure payload as API expects
      await updateUser(user.id, updatedUserData); // Replace with actual API call
      setSuccess("Account updated successfully!");
      // Optionally clear password fields after success
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      console.error("Failed to update account:", err);
      setError(err.message || "Failed to update account.");
    } finally {
      setLoading(false);
    }
    */
    // Simulate API call for now
    setTimeout(() => {
      setSuccess("Account update simulated successfully!");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setLoading(false);
    }, 1000);
    // --- End of API Call Replacement ---
  };

  if (!user) {
    return <CircularProgress />; // Or redirect if user somehow isn't loaded
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Account Settings
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="username"
              required
              fullWidth
              label="Username"
              value={formData.username}
              onChange={handleChange}
            />
          </Grid>
          {/* Add fields for First Name, Last Name, Email here if needed */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Change Password
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="currentPassword"
              type="password"
              fullWidth
              label="Current Password"
              value={formData.currentPassword}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}></Grid> {/* Spacer */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="newPassword"
              type="password"
              fullWidth
              label="New Password"
              value={formData.newPassword}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="confirmPassword"
              type="password"
              fullWidth
              label="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Save Changes"}
        </Button>
      </Box>
    </Paper>
  );
}

export default AccountSettingsPage;
