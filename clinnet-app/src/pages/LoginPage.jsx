// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useAuth } from "../app/providers/AuthProvider"; // Adjust path if needed
// import { useNavigate, useLocation } from 'react-router-dom';
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
} from "@mui/material";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // To display login errors
  const { login } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  //   const navigate = useNavigate();
  //   const location = useLocation();

  // Get the location to redirect to after login, default to '/'
  //   const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(""); // Clear previous errors

    try {
      // Use the login function from the AuthProvider
      // Note: The AuthProvider's login function currently handles navigation
      // based on hardcoded roles. In a real app, it would likely just set
      // the user state, and navigation would happen here or be based on API response.
      await login({ username, password });

      // If login is successful, AuthProvider should navigate based on role.
      // If not, you might want to navigate to a default page here:
      // navigate(from, { replace: true }); // Redirect to the page the user came from
    } catch (err) {
      // In a real app, catch errors from the API call in login()
      console.error("Login failed:", err);
      setError("Login failed. Please check your username and password."); // Set error message
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3}
        sx={{
          mt: { xs: 4, sm: 8 },
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography 
            component="h1" 
            variant={isMobile ? "h3" : "h2"}
            sx={{ 
              mb: 3,
              textAlign: "center",
              fontSize: { xs: '2rem', sm: '3rem' }
            }}
          >
            Welcome to Clinnet
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: "100%" }}>
            {error && (
              <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
                {error}
              </Alert>
            )}
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
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
            />
            {/* Add Remember me checkbox if needed */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size={isMobile ? "medium" : "large"}
              sx={{ 
                mt: 2, 
                mb: 2,
                py: { xs: 1, sm: 1.5 },
                borderRadius: 1.5
              }}
            >
              Sign In
            </Button>
            {/* Add Forgot password or Sign up links if needed */}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default LoginPage; // Make sure it's a default export