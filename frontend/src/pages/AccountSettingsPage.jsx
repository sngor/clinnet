// src/pages/AccountSettingsPage.jsx
import React, { useState, useEffect } from "react";
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
  FormHelperText
} from "@mui/material";
import { useAuth } from "../app/providers/AuthProvider";
import userService from "../services/userService";
import PersonIcon from "@mui/icons-material/Person";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LockIcon from "@mui/icons-material/Lock";
import SaveIcon from "@mui/icons-material/Save";
import PasswordIcon from "@mui/icons-material/Password";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { validatePassword } from "../utils/password-validator";

function AccountSettingsPage() {
  const { user, setUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
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
    }
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear password error when user types
    if (name === 'newPassword' || name === 'confirmPassword' || name === 'currentPassword') {
      setPasswordError(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showNotification = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
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
        phone: formData.phone
      });
      
      if (result.success) {
        // Update local user state with new information
        setUser(prev => ({
          ...prev,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        }));
        
        showNotification('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
      showNotification('Failed to update profile', 'error');
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
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        
        showNotification('Password changed successfully');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      
      // Handle specific Cognito error messages
      if (error.name === 'NotAuthorizedException') {
        setPasswordError('Incorrect current password');
      } else if (error.name === 'LimitExceededException') {
        setPasswordError('Too many attempts. Please try again later');
      } else {
        setPasswordError(error.message || 'Failed to change password');
      }
      
      showNotification('Failed to change password', 'error');
    } finally {
      setPasswordLoading(false);
    }
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
          
          <Box component="form" onSubmit={handleProfileUpdate} noValidate>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: 3, alignItems: { xs: 'center', sm: 'flex-start' } }}>
              <Box sx={{ position: 'relative', mr: { xs: 0, sm: 4 }, mb: { xs: 3, sm: 0 } }}>
                <Avatar
                  sx={{ 
                    width: 100, 
                    height: 100,
                    bgcolor: 'primary.main',
                    fontSize: '2.5rem'
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
                    name="email"
                    label="Email Address"
                    fullWidth
                    value={formData.email}
                    onChange={handleChange}
                    variant="outlined"
                    type="email"
                    disabled
                    helperText="Email cannot be changed as it's used for authentication"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="phone"
                    label="Phone Number"
                    fullWidth
                    value={formData.phone}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      sx={{ 
                        py: 1, 
                        px: 3,
                        borderRadius: 1.5
                      }}
                    >
                      Save Profile
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
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
          
          {passwordError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {passwordError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handlePasswordChange} noValidate>
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
                  required
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
                  required
                />
                <PasswordStrengthMeter password={formData.newPassword} />
                <FormHelperText>
                  Password must be at least 8 characters with uppercase, lowercase, number, and special character
                </FormHelperText>
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
                  required
                  error={formData.newPassword !== formData.confirmPassword && formData.confirmPassword !== ''}
                  helperText={formData.newPassword !== formData.confirmPassword && formData.confirmPassword !== '' ? 'Passwords do not match' : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    disabled={passwordLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                    startIcon={passwordLoading ? <CircularProgress size={20} color="inherit" /> : <PasswordIcon />}
                    sx={{ 
                      py: 1, 
                      px: 3,
                      borderRadius: 1.5
                    }}
                  >
                    Change Password
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AccountSettingsPage;