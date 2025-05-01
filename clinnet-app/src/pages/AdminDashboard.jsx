// src/pages/AdminDashboard.jsx
import React from "react";
import UserList from "../features/users/components/UserList"; // Adjust path if needed
import { useAuth } from "../app/providers/AuthProvider"; // Import useAuth
import { Grid, Paper, Typography } from "@mui/material"; // Use Grid for layout

function AdminDashboard() {
  const { user } = useAuth(); // Get the user object

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

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Dashboard
        </Typography>
      </Grid>
      {/* Greeting Message */}
      <Grid item xs={12}>
        <Typography variant="h6">
          {getGreeting()}, {user?.firstName || "Admin"}!
        </Typography>
      </Grid>

      {/* Placeholder Widgets */}
      <Grid item xs={12} md={6} lg={4}>
        <Paper
          sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
        >
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Total Users
          </Typography>
          {/* Placeholder data - replace with actual data later */}
          <Typography component="p" variant="h4">
            4
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Paper
          sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
        >
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Active Appointments
          </Typography>
          {/* Placeholder data - replace with actual data later */}
          <Typography component="p" variant="h4">
            12
          </Typography>
        </Paper>
      </Grid>
      {/* User List Component */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          {/* Make sure UserList component exists and has content */}
          <UserList />
        </Paper>
      </Grid>
    </Grid>
  );
}

export default AdminDashboard;
