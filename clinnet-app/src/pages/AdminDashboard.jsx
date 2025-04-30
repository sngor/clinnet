// src/pages/AdminDashboard.jsx
import React from "react";
import UserList from "../features/users/components/UserList"; // Adjust path
import { Grid, Paper, Typography } from "@mui/material"; // Use Grid for layout

function AdminDashboard() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Admin Dashboard
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
          <Typography component="p" variant="h4">
            4
          </Typography>{" "}
          {/* Placeholder */}
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Paper
          sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
        >
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Active Appointments
          </Typography>
          <Typography component="p" variant="h4">
            12
          </Typography>{" "}
          {/* Placeholder */}
        </Paper>
      </Grid>
      {/* User List */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <UserList />
        </Paper>
      </Grid>
    </Grid>
  );
}

export default AdminDashboard;
