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
  Divider,
  Container,
  Avatar,
  IconButton,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { useAuth } from "../app/providers/AuthProvider"; // Adjust path as needed
import PersonIcon from "@mui/icons-material/Person";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LockIcon from "@mui/icons-material/Lock";
import SaveIcon from "@mui/icons-material/Save";

function AccountSettingsPage() {
  const { user /* Need a function to update user details via API */ } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
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
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
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
    // Simulate API call for now
    setTimeout(() => {
      setSuccess("Your account settings have been updated successfully!");
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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
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
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {/* Profile Section */}
        <Card 
          elevation={0} 
          sx={{ 
            mb: 4, 
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="medium">
                Profile Information
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: 3, alignItems: { xs: 'center', sm: 'flex-start' } }}>
              <Box sx={{ position: 'relative', mr: { xs: 0, sm: 4 }, mb: { xs: 3, sm: 0 } }}>
                <Avatar
                  sx={{ 
                    width: 100, 
                    height: 100,
                    bgcolor: 'primary.main'
                  }}
                >
                  {user?.firstName?.[0] || user?.username?.[0] || "U"}
                </Avatar>
                <IconButton 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    right: 0,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'background.paper',
                    }
                  }}
                  size="small"
                >
                  <PhotoCameraIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="firstName"
                    label="First Name"
                    fullWidth
                    value={formData.firstName}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="lastName"
                    label="Last Name"
                    fullWidth
                    value={formData.lastName}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="username"
                    label="Username"
                    fullWidth
                    value={formData.username}
                    onChange={handleChange}
                    variant="outlined"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="email"
                    label="Email Address"
                    fullWidth
                    value={formData.email}
                    onChange={handleChange}
                    variant="outlined"
                    type="email"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="phone"
                    label="Phone Number"
                    fullWidth
                    value={formData.phone}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
        
        {/* Password Section */}
        <Card 
          elevation={0} 
          sx={{ 
            mb: 4, 
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LockIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="medium">
                Change Password
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  name="currentPassword"
                  type="password"
                  fullWidth
                  label="Current Password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  name="newPassword"
                  type="password"
                  fullWidth
                  label="New Password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  name="confirmPassword"
                  type="password"
                  fullWidth
                  label="Confirm New Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{ 
              py: 1.5, 
              px: 3,
              borderRadius: 1.5
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default AccountSettingsPage;