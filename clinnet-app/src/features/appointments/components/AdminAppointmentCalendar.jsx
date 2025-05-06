// src/features/appointments/components/AdminAppointmentCalendar.jsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

function AdminAppointmentCalendar() {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Appointment Calendar
      </Typography>
      <Paper sx={{ p: 3, height: '600px' }}>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 10 }}>
          Calendar view will be implemented in a future update.
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          Please use the Appointment History tab to manage appointments.
        </Typography>
      </Paper>
    </Box>
  );
}

export default AdminAppointmentCalendar;