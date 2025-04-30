// src/pages/DoctorDashboard.jsx
import React from "react";
import PatientList from "../features/patients/components/PatientList"; // Adjust path
import AppointmentCalendar from "../features/appointments/components/AppointmentCalendar"; // Adjust path
import { Grid, Paper, Typography, Box } from "@mui/material";

function DoctorDashboard() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Doctor Dashboard
        </Typography>
      </Grid>
      {/* Placeholder Widgets */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, height: 140 }}>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Today's Appointments
          </Typography>
          <Typography component="p" variant="h4">
            5
          </Typography>{" "}
          {/* Placeholder */}
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, height: 140 }}>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Unread Messages
          </Typography>
          <Typography component="p" variant="h4">
            2
          </Typography>{" "}
          {/* Placeholder */}
        </Paper>
      </Grid>
      {/* Appointment Calendar */}
      <Grid item xs={12} lg={7}>
        <Paper sx={{ p: 2 }}>
          <AppointmentCalendar />
        </Paper>
      </Grid>
      {/* Patient List Snippet */}
      <Grid item xs={12} lg={5}>
        <Paper sx={{ p: 2 }}>
          {/* Render a smaller version or link to full list */}
          <PatientList />
        </Paper>
      </Grid>
    </Grid>
  );
}

export default DoctorDashboard;
