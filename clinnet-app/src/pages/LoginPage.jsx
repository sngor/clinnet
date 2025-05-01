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
} from "@mui/material";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // To display login errors
  const { login } = useAuth();
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
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in to Clinnet
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
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
          />
          {/* Add Remember me checkbox if needed */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          {/* Add Forgot password or Sign up links if needed */}
        </Box>
      </Box>
    </Container>
  );
}

export default LoginPage; // Make sure it's a default export
