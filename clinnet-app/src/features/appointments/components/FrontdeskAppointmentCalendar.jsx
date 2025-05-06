// src/features/appointments/components/FrontdeskAppointmentCalendar.jsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import AppointmentList from './AppointmentList';

function FrontdeskAppointmentCalendar() {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        All Appointments
      </Typography>
      <AppointmentList />
    </Box>
  );
}

export default FrontdeskAppointmentCalendar;