// src/features/users/components/UserFormModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";

const roles = ["admin", "doctor", "frontdesk"]; // Define available roles

function UserFormModal({ open, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    username: "",
    firstName: "", // Add firstName
    lastName: "", // Add lastName
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
          firstName: initialData.firstName || "", // Populate firstName
          lastName: initialData.lastName || "", // Populate lastName
          role: initialData.role || "",
          password: "", // Don't pre-fill password for editing
        });
      } else {
        setFormData({ username: "", role: "", password: "" }); // Reset for adding
      }
      setErrors({}); // Clear errors on open
    }
  }, [open, initialData, isEditing]);

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
      newErrors.firstName = "First name is required"; // Validate firstName
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"; // Validate lastName
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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            margin="dense"
            name="username"
            label="Username"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
          />
          <TextField
            margin="dense"
            name="firstName"
            label="First Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.firstName}
            onChange={handleChange}
            error={!!errors.firstName}
            helperText={errors.firstName}
          />
          <TextField
            margin="dense"
            name="lastName"
            label="Last Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.lastName}
            onChange={handleChange}
            error={!!errors.lastName}
            helperText={errors.lastName}
          />
          <FormControl fullWidth margin="dense" error={!!errors.role}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              name="role"
              value={formData.role}
              label="Role"
              onChange={handleChange}
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </MenuItem>
              ))}
            </Select>
            {errors.role && (
              <p
                style={{
                  color: "#d32f2f",
                  fontSize: "0.75rem",
                  margin: "3px 14px 0",
                }}
              >
                {errors.role}
              </p>
            )}
          </FormControl>
          <TextField
            margin="dense"
            name="password"
            label={isEditing ? "New Password (optional)" : "Password"}
            type="password"
            fullWidth
            variant="outlined"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEditing ? "Save Changes" : "Add User"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default UserFormModal;
