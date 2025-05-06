// src/features/appointments/components/AdminAppointmentHistory.jsx
import React from 'react';
import AppointmentList from './AppointmentList';
import { Box, Typography } from '@mui/material';

function AdminAppointmentHistory() {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        All Appointments
      </Typography>
      <AppointmentList />
    </Box>
  );
}

export default AdminAppointmentHistory;