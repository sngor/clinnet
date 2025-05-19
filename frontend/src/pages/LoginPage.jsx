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
  TextField,
  Avatar,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import { demoCredentials } from "../config/auth-config";
import { extractUsername } from "../services/userService";
import { styled } from "@mui/material/styles";

import {
  PageContainer,
  FlexBox,
  PrimaryButton,
  SecondaryButton,
  BodyText,
  SecondaryText,
} from "../components/ui";

const AnimatedAlert = styled(Alert)(({ theme }) => ({
  transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
  opacity: 1,
  marginBottom: theme.spacing(2),
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(255,255,255,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10,
  opacity: 1,
  pointerEvents: "all",
  transition: "opacity 0.4s cubic-bezier(0.4,0,0.2,1)",
}));

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading: authLoading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      let loginUsername = username;
      if (loginUsername && !loginUsername.includes("@")) {
        loginUsername = `${loginUsername}@clinnet.com`;
      }
      const result = await login({ username: loginUsername, password });
      if (!result.success) {
        setError(
          result.error || "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      setError(
        `Login failed: ${err.message || "Please check your credentials."}`
      );
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
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: { xs: 2, sm: 4 },
        backgroundColor: "#f5f7fa",
      }}
    >
      <Box maxWidth="md" sx={{ width: "100%", position: "relative" }}>
        {/* Loading overlay above the Paper */}
        {(isLoading || authLoading) && (
          <LoadingOverlay>
            <CircularProgress size={48} color="primary" thickness={4} />
          </LoadingOverlay>
        )}
        <Paper
          elevation={4}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            position: "relative",
            minHeight: 480,
          }}
        >
          {/* Left side - Brand/Logo section */}
          <Box
            sx={{
              flex: { md: "0 0 45%" },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 4, md: 6 },
              backgroundColor: "primary.main",
              color: "white",
              textAlign: "center",
              position: "relative",
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
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
                fontSize: { xs: "2rem", sm: "2.5rem" },
              }}
            >
              CLINNET
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 400,
              }}
            >
              Healthcare Management System
            </Typography>
            <Typography
              variant="body2"
              sx={{
                maxWidth: "80%",
                opacity: 0.9,
              }}
            >
              Streamline your clinic operations with our comprehensive EMR
              solution
            </Typography>
          </Box>

          {/* Right side - Login form */}
          <Box
            sx={{
              flex: { md: "0 0 55%" },
              p: { xs: 3, sm: 4, md: 5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              backgroundColor: "white",
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              sx={{
                mb: 1,
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              Sign In
            </Typography>
            <SecondaryText sx={{ mb: 4 }}>
              Enter your credentials to access your account
            </SecondaryText>

            {error && (
              <AnimatedAlert
                severity="error"
                sx={{
                  width: "100%",
                  mb: 3,
                  borderRadius: 1.5,
                  animation: "shake 0.3s",
                  "@keyframes shake": {
                    "10%, 90%": { transform: "translateX(-2px)" },
                    "20%, 80%": { transform: "translateX(4px)" },
                    "30%, 50%, 70%": { transform: "translateX(-8px)" },
                    "40%, 60%": { transform: "translateX(8px)" },
                  },
                }}
              >
                {error}
              </AnimatedAlert>
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
                label="Email or Username"
                name="username"
                autoComplete="email"
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
                disabled={isLoading || authLoading}
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
                        disabled={isLoading || authLoading}
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                disabled={isLoading || authLoading}
              />

              <PrimaryButton
                type="submit"
                fullWidth
                size="large"
                disabled={isLoading || authLoading || !username || !password}
                sx={{
                  mt: 1,
                  mb: 3,
                  position: "relative",
                  fontWeight: 600,
                  fontSize: 18,
                  borderRadius: 2,
                  boxShadow: 1,
                  transition: "all 0.2s",
                  background:
                    "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #1565c0 0%, #42a5f5 100%)",
                  },
                }}
              >
                <span style={{ opacity: isLoading || authLoading ? 0.5 : 1 }}>
                  Sign In
                </span>
              </PrimaryButton>

              <Box sx={{ mb: 3 }}>
                <Divider>
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{
                      px: 1,
                      color: "text.secondary",
                      fontSize: "0.875rem",
                    }}
                  >
                    Demo Accounts
                  </Typography>
                </Divider>
              </Box>

              <FlexBox
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                justify="space-between"
              >
                {demoCredentials.map((demo) => (
                  <SecondaryButton
                    key={demo.role}
                    size="small"
                    onClick={() =>
                      handleDemoLogin(demo.username, demo.password)
                    }
                    sx={{ flex: { sm: 1 } }}
                    disabled={isLoading || authLoading}
                  >
                    {demo.role}
                  </SecondaryButton>
                ))}
              </FlexBox>

              <Box sx={{ mt: 3, textAlign: "center" }}>
                <SecondaryText sx={{ mb: 0 }}>
                  Having trouble signing in?{" "}
                  <Link href="#" underline="hover">
                    Contact Support
                  </Link>
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
