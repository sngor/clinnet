// src/pages/AdminDashboard.jsx
import React from "react";
import { useAuth } from "../app/providers/AuthProvider"; // Import useAuth
import { Grid, Paper, Typography, useMediaQuery, useTheme, Box, Button } from "@mui/material"; // Use Grid for layout
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
    <Grid container spacing={isMobile ? 2 : 3}>
      {/* Greeting Message */}
      <Grid item xs={12}>
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          sx={{ 
            mb: { xs: 2, sm: 3 },
            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          {getGreeting()}, {user?.firstName || "Admin"}!
        </Typography>
      </Grid>

      {/* Dashboard Summary Cards */}
      <Grid item xs={12} sm={6} md={4}>
        <Paper
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            display: "flex", 
            flexDirection: "column", 
            height: { xs: 160, sm: 180 },
            borderRadius: 2,
            boxShadow: 2,
            position: "relative",
            overflow: "hidden"
          }}
        >
          <Box 
            sx={{ 
              position: "absolute",
              top: 10,
              right: 10,
              color: "primary.light",
              opacity: 0.2,
              transform: "scale(2)",
              transformOrigin: "top right"
            }}
          >
            <PeopleIcon fontSize="large" />
          </Box>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Total Users
          </Typography>
          {/* Placeholder data - replace with actual data later */}
          <Typography component="p" variant="h3" sx={{ mt: 2, mb: 2 }}>
            4
          </Typography>
          <Button 
            variant="text" 
            color="primary" 
            onClick={handleNavigateToUsers}
            sx={{ alignSelf: "flex-start", mt: "auto" }}
          >
            Manage Users
          </Button>
        </Paper>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Paper
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            display: "flex", 
            flexDirection: "column", 
            height: { xs: 160, sm: 180 },
            borderRadius: 2,
            boxShadow: 2,
            position: "relative",
            overflow: "hidden"
          }}
        >
          <Box 
            sx={{ 
              position: "absolute",
              top: 10,
              right: 10,
              color: "primary.light",
              opacity: 0.2,
              transform: "scale(2)",
              transformOrigin: "top right"
            }}
          >
            <EventIcon fontSize="large" />
          </Box>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Active Appointments
          </Typography>
          {/* Placeholder data - replace with actual data later */}
          <Typography component="p" variant="h3" sx={{ mt: 2, mb: 2 }}>
            12
          </Typography>
          <Button 
            variant="text" 
            color="primary" 
            sx={{ alignSelf: "flex-start", mt: "auto" }}
          >
            View Details
          </Button>
        </Paper>
      </Grid>

      {/* Additional Dashboard Content */}
      <Grid item xs={12}>
        <Paper sx={{ 
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          boxShadow: 2,
          mt: { xs: 2, sm: 3 }
        }}>
          <Typography variant="h5" gutterBottom>
            System Overview
          </Typography>
          <Typography variant="body1" paragraph>
            Welcome to the Clinnet Admin Dashboard. From here, you can manage users, view system statistics, and access administrative functions.
          </Typography>
          <Typography variant="body1">
            Use the navigation menu to access different sections of the admin portal. For user management, click on the "Users" tab in the sidebar or use the "Manage Users" button above.
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default AdminDashboard;