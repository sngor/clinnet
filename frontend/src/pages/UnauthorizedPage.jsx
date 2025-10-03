// src/pages/UnauthorizedPage.jsx
import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";
import {
  PrimaryButton,
  SecondaryButton,
  StandardPageLayout,
} from "../components/ui";
import { useAuth } from "../app/providers/AuthProvider";

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Determine where to redirect based on user role
  const handleGoToDashboard = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    switch (user.role) {
      case "admin":
        navigate("/admin");
        break;
      case "doctor":
        navigate("/doctor");
        break;
      case "frontdesk":
        navigate("/frontdesk");
        break;
      default:
        navigate("/login");
    }
  };

  return (
    <StandardPageLayout
      title="Access Denied"
      subtitle="You don't have permission to access this page"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 5,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              backgroundColor: "error.light",
              borderRadius: "50%",
              p: 2,
              mb: 3,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <LockIcon fontSize="large" sx={{ color: "white" }} />
          </Box>

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            Access Denied
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            paragraph
            sx={{ maxWidth: 500, mb: 4 }}
          >
            You don't have permission to access this page. This area requires
            different privileges than your current role provides.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <PrimaryButton // Changed to PrimaryButton
              color="primary"
              onClick={handleGoToDashboard}
            >
              Go to Dashboard
            </PrimaryButton>
            <SecondaryButton // Changed to SecondaryButton
              color="error"
              onClick={logout}
            >
              Sign Out
            </SecondaryButton>
          </Box>
        </Paper>
      </Box>
    </StandardPageLayout>
  );
};

export default UnauthorizedPage;
