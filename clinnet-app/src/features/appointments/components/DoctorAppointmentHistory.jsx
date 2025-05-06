// src/features/appointments/components/DoctorAppointmentHistory.jsx
import React from 'react';
import AppointmentList from './AppointmentList';
import { Box, Typography } from '@mui/material';

function DoctorAppointmentHistory() {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        My Appointment History
      </Typography>
      <AppointmentList />
    </Box>
  );
}

export default DoctorAppointmentHistory;