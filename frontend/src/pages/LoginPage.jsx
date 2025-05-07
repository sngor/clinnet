// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useAuth } from "../app/providers/AuthProvider";
import {
  Box,
  Typography,
  Alert,
  Paper,
  useMediaQuery,
  useTheme,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress,
  Link,
  TextField
} from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';

import { 
  PageContainer, 
  FlexBox, 
  PrimaryButton, 
  SecondaryButton, 
  BodyText, 
  SecondaryText 
} from '../components/ui';

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, loading: authLoading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Demo credentials for quick login
  const demoCredentials = [
    { role: "Admin", username: "admin", password: "password" },
    { role: "Doctor", username: "doctor", password: "password" },
    { role: "Front Desk", username: "frontdesk", password: "password" }
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login({ username, password });
      if (!result.success) {
        setError(result.error || "Login failed. Please check your username and password.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed. Please check your username and password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoUsername, demoPassword) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    // Don't auto-submit to let users see the credentials
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: 2, sm: 4 },
        backgroundColor: '#f5f7fa'
      }}
    >
      <Box maxWidth="md" sx={{ width: '100%' }}>
        <Paper 
          elevation={4}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          {/* Left side - Brand/Logo section */}
          <Box
            sx={{
              flex: { md: '0 0 45%' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 4, md: 6 },
              backgroundColor: 'primary.main',
              color: 'white',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <Box 
              sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            >
              <MedicalServicesOutlinedIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem' }
              }}
            >
              CLINNET
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3, 
                fontWeight: 400
              }}
            >
              Healthcare Management System
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                maxWidth: '80%', 
                opacity: 0.9
              }}
            >
              Streamline your clinic operations with our comprehensive EMR solution
            </Typography>
          </Box>

          {/* Right side - Login form */}
          <Box
            sx={{
              flex: { md: '0 0 55%' },
              p: { xs: 3, sm: 4, md: 5 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              backgroundColor: 'white'
            }}
          >
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                mb: 1,
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              Sign In
            </Typography>
            <SecondaryText sx={{ mb: 4 }}>
              Enter your credentials to access your account
            </SecondaryText>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  width: "100%", 
                  mb: 3,
                  borderRadius: 1.5
                }}
              >
                {error}
              </Alert>
            )}

            <Box 
              component="form" 
              onSubmit={handleSubmit} 
              noValidate 
              sx={{ width: "100%" }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 2.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <PrimaryButton
                type="submit"
                fullWidth
                size="large"
                disabled={isLoading || authLoading || !username || !password}
                sx={{ mt: 1, mb: 3 }}
              >
                {(isLoading || authLoading) ? (
                  <CircularProgress 
                    size={24} 
                    sx={{ 
                      color: 'white',
                      position: 'absolute'
                    }} 
                  />
                ) : 'Sign In'}
              </PrimaryButton>

              <Box sx={{ mb: 3 }}>
                <Divider>
                  <Typography 
                    variant="body2" 
                    component="span" 
                    sx={{ 
                      px: 1, 
                      color: 'text.secondary',
                      fontSize: '0.875rem'
                    }}
                  >
                    Demo Accounts
                  </Typography>
                </Divider>
              </Box>

              <FlexBox 
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                justify="space-between"
              >
                {demoCredentials.map((demo) => (
                  <SecondaryButton
                    key={demo.role}
                    size="small"
                    onClick={() => handleDemoLogin(demo.username, demo.password)}
                    sx={{ flex: { sm: 1 } }}
                  >
                    {demo.role}
                  </SecondaryButton>
                ))}
              </FlexBox>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <SecondaryText sx={{ mb: 0 }}>
                  Having trouble signing in? <Link href="#" underline="hover">Contact Support</Link>
                </SecondaryText>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default LoginPage;