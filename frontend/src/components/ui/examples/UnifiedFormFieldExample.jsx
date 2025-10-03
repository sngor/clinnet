/**
 * UnifiedFormField Example Component
 * Demonstrates the usage of the UnifiedFormField component with various input types
 */

import React, { useState } from "react";
import { Box, Typography, Paper, Grid, Button } from "@mui/material";
import {
  Email,
  Phone,
  Person,
  Search,
  AttachMoney,
  CalendarToday,
  Description,
} from "@mui/icons-material";
import UnifiedFormField from "../UnifiedFormField.jsx";

const UnifiedFormFieldExample = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    age: "",
    birthDate: "",
    gender: "",
    bio: "",
    newsletter: false,
    theme: "light",
    notifications: true,
    searchQuery: "",
    files: [],
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({});

  const handleChange = (event) => {
    const { name, value, files, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" || type === "switch"
          ? checked
          : type === "file"
          ? files
          : value,
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    // Set success states for valid fields
    const newSuccess = {};
    if (formData.firstName && !newErrors.firstName)
      newSuccess.firstName = "Valid";
    if (formData.email && !newErrors.email)
      newSuccess.email = "Valid email address";

    setSuccess(newSuccess);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
    }
  };

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer-not-to-say", label: "Prefer not to say" },
  ];

  const themeOptions = [
    { value: "light", label: "Light Theme" },
    { value: "dark", label: "Dark Theme" },
    { value: "auto", label: "Auto (System)" },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        UnifiedFormField Examples
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
        This component demonstrates all the input types and features of the
        UnifiedFormField component, including validation states, adornments,
        accessibility features, and theme support.
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Text Inputs with Adornments */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Text Inputs with Adornments
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <UnifiedFormField
                type="text"
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                error={errors.firstName}
                success={success.firstName}
                startAdornment={<Person />}
                placeholder="Enter your first name"
                helperText="This field is required"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <UnifiedFormField
                type="text"
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                startAdornment={<Person />}
                placeholder="Enter your last name"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <UnifiedFormField
                type="email"
                name="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                error={errors.email}
                success={success.email}
                startAdornment={<Email />}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <UnifiedFormField
                type="tel"
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                startAdornment={<Phone />}
                placeholder="(555) 123-4567"
                autoComplete="tel"
              />
            </Grid>

            {/* Password Fields */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Password Fields
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <UnifiedFormField
                type="password"
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                required
                error={errors.password}
                placeholder="Enter your password"
                helperText="Minimum 6 characters"
                autoComplete="new-password"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <UnifiedFormField
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                error={errors.confirmPassword}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </Grid>

            {/* Number and Date Inputs */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Number and Date Inputs
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <UnifiedFormField
                type="number"
                name="age"
                label="Age"
                value={formData.age}
                onChange={handleChange}
                startAdornment={<AttachMoney />}
                placeholder="25"
                min="18"
                max="120"
                helperText="Must be 18 or older"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <UnifiedFormField
                type="date"
                name="birthDate"
                label="Birth Date"
                value={formData.birthDate}
                onChange={handleChange}
                startAdornment={<CalendarToday />}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <UnifiedFormField
                type="search"
                name="searchQuery"
                label="Search"
                value={formData.searchQuery}
                onChange={handleChange}
                startAdornment={<Search />}
                placeholder="Search anything..."
                size="lg"
              />
            </Grid>

            {/* Select and Radio */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Select and Radio Inputs
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <UnifiedFormField
                type="select"
                name="gender"
                label="Gender"
                value={formData.gender}
                onChange={handleChange}
                options={genderOptions}
                helperText="Optional field"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <UnifiedFormField
                type="radio"
                name="theme"
                label="Preferred Theme"
                value={formData.theme}
                onChange={handleChange}
                options={themeOptions}
                row
              />
            </Grid>

            {/* Textarea */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Textarea
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <UnifiedFormField
                type="textarea"
                name="bio"
                label="Bio"
                value={formData.bio}
                onChange={handleChange}
                startAdornment={<Description />}
                placeholder="Tell us about yourself..."
                rows={4}
                maxRows={8}
                helperText="Optional: Share a brief description about yourself"
              />
            </Grid>

            {/* Checkboxes and Switches */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Checkboxes and Switches
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <UnifiedFormField
                type="checkbox"
                name="newsletter"
                label="Subscribe to newsletter"
                value={formData.newsletter}
                onChange={handleChange}
                helperText="Get updates about new features"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <UnifiedFormField
                type="switch"
                name="notifications"
                label="Enable notifications"
                value={formData.notifications}
                onChange={handleChange}
                helperText="Receive push notifications"
              />
            </Grid>

            {/* File Upload */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                File Upload
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <UnifiedFormField
                type="file"
                name="files"
                label="Upload Files"
                onChange={handleChange}
                multiple
                accept="image/*,.pdf,.doc,.docx"
                helperText="Drag and drop files or click to browse. Supports images, PDF, and Word documents."
              />
            </Grid>

            {/* Size Variations */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Size Variations
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <UnifiedFormField
                type="text"
                name="smallField"
                label="Small Size"
                placeholder="Small input"
                size="sm"
                startAdornment={<Search />}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <UnifiedFormField
                type="text"
                name="mediumField"
                label="Medium Size (Default)"
                placeholder="Medium input"
                size="md"
                startAdornment={<Search />}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <UnifiedFormField
                type="text"
                name="largeField"
                label="Large Size"
                placeholder="Large input"
                size="lg"
                startAdornment={<Search />}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                <Button type="submit" variant="contained" size="large">
                  Submit Form
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    setFormData({
                      firstName: "",
                      lastName: "",
                      email: "",
                      phone: "",
                      password: "",
                      confirmPassword: "",
                      age: "",
                      birthDate: "",
                      gender: "",
                      bio: "",
                      newsletter: false,
                      theme: "light",
                      notifications: true,
                      searchQuery: "",
                      files: [],
                    });
                    setErrors({});
                    setSuccess({});
                  }}
                >
                  Reset Form
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Form Data Display */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Form Data
        </Typography>
        <Box
          component="pre"
          sx={{
            backgroundColor: "grey.100",
            p: 2,
            borderRadius: 1,
            overflow: "auto",
            fontSize: "0.875rem",
            fontFamily: "monospace",
          }}
        >
          {JSON.stringify(formData, null, 2)}
        </Box>
      </Paper>
    </Box>
  );
};

export default UnifiedFormFieldExample;
