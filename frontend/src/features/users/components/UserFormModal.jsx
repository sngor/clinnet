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
  useMediaQuery,
  useTheme,
  Typography,
  FormHelperText,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from "@mui/material";

const roles = ["admin", "doctor", "frontdesk"]; // Define available roles
const genders = ["Male", "Female", "Other"]; // Define available genders

function UserFormModal({ open, onClose, onSubmit, initialData }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
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
          m: isMobile ? 0 : 2
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        pt: { xs: 2, sm: 2 },
        fontSize: { xs: '1.25rem', sm: '1.5rem' },
        textAlign: { xs: 'center', sm: 'left' }
      }}>
        {isEditing ? "Edit User" : "Add New User"}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: { xs: 2, sm: 1 } }}>
          <Grid container spacing={2}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" sx={{ mb: 1, fontWeight: 'medium' }}>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="username"
                label="Username"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="password"
                label={isEditing ? "New Password (optional)" : "Password"}
                type="password"
                fullWidth
                variant="outlined"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                label="First Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="lastName"
                label="Last Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            
            {/* Contact Information */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle1" color="primary" sx={{ mb: 1, fontWeight: 'medium' }}>
                Contact Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone Number"
                type="tel"
                fullWidth
                variant="outlined"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            
            {/* Additional Information */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle1" color="primary" sx={{ mb: 1, fontWeight: 'medium' }}>
                Additional Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                error={!!errors.gender}
                size={isMobile ? "small" : "medium"}
              >
                <InputLabel id="gender-select-label">Gender</InputLabel>
                <Select
                  labelId="gender-select-label"
                  name="gender"
                  value={formData.gender}
                  label="Gender"
                  onChange={handleChange}
                >
                  {genders.map((gender) => (
                    <MenuItem key={gender} value={gender}>
                      {gender}
                    </MenuItem>
                  ))}
                </Select>
                {errors.gender && (
                  <FormHelperText>{errors.gender}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                error={!!errors.role}
                size={isMobile ? "small" : "medium"}
              >
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
                  <FormHelperText>{errors.role}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ 
          px: { xs: 3, sm: 3 },
          pb: { xs: 3, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 1 }
        }}>
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