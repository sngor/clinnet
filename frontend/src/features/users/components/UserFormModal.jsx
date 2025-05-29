// src/features/users/components/UserFormModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  useMediaQuery,
  useTheme,
  Typography,
  Grid,
} from "@mui/material";
import { FormField, FormLayout } from "../../../components/ui";

const roles = ["admin", "doctor", "frontdesk"]; // Define available roles
const genders = ["Male", "Female", "Other"]; // Define available genders

function UserFormModal({ open, onClose, onSubmit, initialData }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    role: "",
    password: "", // Only for adding new users or explicitly changing password
  });
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(initialData);

  useEffect(() => {
    // Reset form when opening or when initialData changes
    if (open) {
      if (isEditing) {
        setFormData({
          username: initialData.username || "",
          firstName: initialData.firstName || "",
          lastName: initialData.lastName || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
          gender: initialData.gender || "",
          role: initialData.role || "",
          password: "", // Don't pre-fill password for editing
        });
      } else {
        setFormData({
          username: "",
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          gender: "",
          role: "",
          password: "",
        });
      }

      setErrors({}); // Clear errors on open
    }
  }, [open, initialData, isEditing]);

  // Helper to extract username from email
  const extractUsernameFromEmail = (email) => {
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return email || "";
    }
    return email.split("@")[0];
  };

  // Update username automatically when email changes (for new users)
  useEffect(() => {
    if (!isEditing && formData.email) {
      setFormData((prev) => ({
        ...prev,
        username: extractUsernameFromEmail(formData.email),
      }));
    }
    // Only update username for new users, not when editing
    // eslint-disable-next-line
  }, [formData.email, isEditing]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Basic validation clear on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.role) newErrors.role = "Role is required";
    if (!isEditing && !formData.password) {
      // Password required only when adding
      newErrors.password = "Password is required for new users";
    } else if (isEditing && formData.password && formData.password.length < 6) {
      // Optional password change validation
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      // Include ID if editing
      const submissionData = isEditing
        ? { ...formData, id: initialData.id }
        : formData;
      onSubmit(submissionData); // Pass data up to parent
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          m: isMobile ? 0 : 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          pt: { xs: 2, sm: 2 },
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
          textAlign: { xs: "center", sm: "left" },
        }}
      >
        {isEditing ? "Edit User" : "Add New User"}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: { xs: 2, sm: 1 } }}>
          <Grid container spacing={2}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                color="primary"
                sx={{ mb: 1, fontWeight: "medium" }}
              >
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormField
                type="text"
                name="username"
                label="Username"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                size={isMobile ? "small" : "medium"}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormField
                type="password"
                name="password"
                label={isEditing ? "New Password (optional)" : "Password"}
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                size={isMobile ? "small" : "medium"}
                required={!isEditing}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormField
                type="text"
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                size={isMobile ? "small" : "medium"}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormField
                type="text"
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                size={isMobile ? "small" : "medium"}
                required
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography
                variant="subtitle1"
                color="primary"
                sx={{ mb: 1, fontWeight: "medium" }}
              >
                Contact Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormField
                type="email"
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                size={isMobile ? "small" : "medium"}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormField
                type="tel"
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                size={isMobile ? "small" : "medium"}
                required
              />
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography
                variant="subtitle1"
                color="primary"
                sx={{ mb: 1, fontWeight: "medium" }}
              >
                Additional Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormField
                type="select"
                name="gender"
                label="Gender"
                value={formData.gender}
                onChange={handleChange}
                error={!!errors.gender}
                helperText={errors.gender}
                options={genders.map((gender) => ({
                  value: gender,
                  label: gender,
                }))}
                size={isMobile ? "small" : "medium"}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormField
                type="select"
                name="role"
                label="Role"
                value={formData.role}
                onChange={handleChange}
                error={!!errors.role}
                helperText={errors.role}
                options={roles.map((role) => ({
                  value: role,
                  label: role.charAt(0).toUpperCase() + role.slice(1),
                }))}
                size={isMobile ? "small" : "medium"}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 3, sm: 3 },
            pb: { xs: 3, sm: 2 },
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 1 },
          }}
        >
          <Button
            onClick={onClose}
            fullWidth={isMobile}
            variant={isMobile ? "outlined" : "text"}
            size={isMobile ? "medium" : "medium"}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            fullWidth={isMobile}
            size={isMobile ? "medium" : "medium"}
          >
            {isEditing ? "Save Changes" : "Add User"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default UserFormModal;
