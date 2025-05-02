// src/pages/AdminDashboard.jsx
import React from "react";
import { useAuth } from "../app/providers/AuthProvider"; // Import useAuth
import { 
  Grid, 
  Paper, 
  Typography, 
  useMediaQuery, 
  useTheme, 
  Box, 
  Button,
  Container,
  Stack
} from "@mui/material"; // Use Grid for layout
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const { user } = useAuth(); // Get the user object
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // Function to get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good morning";
    } else if (hour < 18) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  // Navigate to Users page
  const handleNavigateToUsers = () => {
    navigate("/admin/users");
  };

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Greeting Message - Separate section */}
      <Box 
        sx={{ 
          mb: 4,
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2
        }}
      >
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          sx={{ 
            fontWeight: 'medium',
            color: 'primary.main'
          }}
        >
          {getGreeting()}, {user?.firstName || "Admin"}!
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          Here's what's happening in your clinic today
        </Typography>
      </Box>

      {/* Dashboard Summary Cards - Aligned in a row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Paper
            elevation={0}
            sx={{ 
              p: 3, 
              display: "flex", 
              flexDirection: "column", 
              height: 180,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: 3,
                transform: "translateY(-4px)"
              }
            }}
          >
            <Box 
              sx={{ 
                position: "absolute",
                top: 10,
                right: 10,
                color: "primary.light",
                opacity: 0.15,
                transform: "scale(2.5)",
                transformOrigin: "top right"
              }}
            >
              <PeopleIcon fontSize="large" />
            </Box>
            <Typography 
              component="h2" 
              variant="h6" 
              color="primary.main" 
              fontWeight="medium"
            >
              Total Users
            </Typography>
            <Typography 
              component="p" 
              variant="h2" 
              sx={{ 
                mt: 2, 
                mb: 2,
                fontWeight: 'bold' 
              }}
            >
              4
            </Typography>
            <Button 
              variant="text" 
              color="primary" 
              onClick={handleNavigateToUsers}
              sx={{ 
                alignSelf: "flex-start", 
                mt: "auto",
                pl: 0,
                "&:hover": {
                  backgroundColor: "transparent",
                  textDecoration: "underline"
                }
              }}
            >
              Manage Users
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Paper
            elevation={0}
            sx={{ 
              p: 3, 
              display: "flex", 
              flexDirection: "column", 
              height: 180,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: 3,
                transform: "translateY(-4px)"
              }
            }}
          >
            <Box 
              sx={{ 
                position: "absolute",
                top: 10,
                right: 10,
                color: "primary.light",
                opacity: 0.15,
                transform: "scale(2.5)",
                transformOrigin: "top right"
              }}
            >
              <EventIcon fontSize="large" />
            </Box>
            <Typography 
              component="h2" 
              variant="h6" 
              color="primary.main"
              fontWeight="medium"
            >
              Active Appointments
            </Typography>
            <Typography 
              component="p" 
              variant="h2" 
              sx={{ 
                mt: 2, 
                mb: 2,
                fontWeight: 'bold'
              }}
            >
              12
            </Typography>
            <Button 
              variant="text" 
              color="primary" 
              sx={{ 
                alignSelf: "flex-start", 
                mt: "auto",
                pl: 0,
                "&:hover": {
                  backgroundColor: "transparent",
                  textDecoration: "underline"
                }
              }}
            >
              View Details
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Additional Dashboard Content */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, sm: 4 },
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom
          color="primary.main"
          fontWeight="medium"
        >
          System Overview
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to the Clinnet Admin Dashboard. From here, you can manage users, view system statistics, and access administrative functions.
        </Typography>
        <Typography variant="body1">
          Use the navigation menu to access different sections of the admin portal. For user management, click on the "Users" tab in the sidebar or use the "Manage Users" button above.
        </Typography>
      </Paper>
    </Container>
  );
}

export default AdminDashboard;