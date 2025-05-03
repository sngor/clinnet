// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useAuth } from "../app/providers/AuthProvider";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  useMediaQuery,
  useTheme,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress,
  Link
} from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
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
      // Simulate network delay for better UX feedback
      await new Promise(resolve => setTimeout(resolve, 800));
      await login({ username, password });
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
      <Container maxWidth="md">
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
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 4,
                color: 'text.secondary'
              }}
            >
              Enter your credentials to access your account
            </Typography>

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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading || !username || !password}
                sx={{ 
                  mt: 1, 
                  mb: 3,
                  py: 1.5,
                  borderRadius: 2,
                  position: 'relative',
                  boxShadow: '0 4px 14px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                  }
                }}
              >
                {isLoading ? (
                  <CircularProgress 
                    size={24} 
                    sx={{ 
                      color: 'white',
                      position: 'absolute'
                    }} 
                  />
                ) : 'Sign In'}
              </Button>

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

              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1.5,
                  justifyContent: 'space-between'
                }}
              >
                {demoCredentials.map((demo) => (
                  <Button
                    key={demo.role}
                    variant="outlined"
                    size="small"
                    onClick={() => handleDemoLogin(demo.username, demo.password)}
                    sx={{ 
                      flex: { sm: 1 },
                      borderRadius: 1.5,
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    {demo.role}
                  </Button>
                ))}
              </Box>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Having trouble signing in? <Link href="#" underline="hover">Contact Support</Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;