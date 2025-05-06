// src/features/appointments/components/DoctorTodaySchedule.jsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import AppointmentList from './AppointmentList';

function DoctorTodaySchedule() {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Today's Schedule
      </Typography>
      <AppointmentList />
    </Box>
  );
}

export default DoctorTodaySchedule;