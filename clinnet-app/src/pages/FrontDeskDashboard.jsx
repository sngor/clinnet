// src/pages/FrontDeskDashboard.jsx
import React from "react";
import AppointmentCalendar from "../features/appointments/components/AppointmentCalendar";
import AppointmentForm from "../features/appointments/components/AppointmentForm";
import PatientList from "../features/patients/components/PatientList";
import { Grid, Paper, Typography } from "@mui/material";

function FrontDeskDashboard() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Front Desk Dashboard
        </Typography>
      </Grid>
      {/* Placeholder Widgets */}
      <Grid item xs={12} md={6} lg={3}>
        <Paper sx={{ p: 2, height: 140 }}>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Check-ins Today
          </Typography>
          <Typography component="p" variant="h4">
            8
          </Typography>{" "}
          {/* Placeholder */}
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Paper sx={{ p: 2, height: 140 }}>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Pending Tasks
          </Typography>
          <Typography component="p" variant="h4">
            3
          </Typography>{" "}
          {/* Placeholder */}
        </Paper>
      </Grid>
      {/* Main Content Area */}
      <Grid item xs={12} lg={8}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <AppointmentCalendar />
        </Paper>
        <Paper sx={{ p: 2 }}>
          <PatientList />
        </Paper>
      </Grid>
      <Grid item xs={12} lg={4}>
        <Paper sx={{ p: 2 }}>
          <AppointmentForm />
        </Paper>
      </Grid>
    </Grid>
  );
}

export default FrontDeskDashboard;
