// src/pages/DoctorAppointmentsPage.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab 
} from '@mui/material';
import DoctorAppointmentCalendar from '../features/appointments/components/DoctorAppointmentCalendar';

function DoctorAppointmentsPage() {
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Appointments
      </Typography>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        centered={false}
      >
        <Tab label="Today's Schedule" />
        <Tab label="Calendar View" />
        <Tab label="Appointment History" />
      </Tabs>
      
      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">
            Today's Schedule
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            This is a placeholder for today's appointments.
          </Typography>
        </Paper>
      )}
      
      {tabValue === 1 && (
        <DoctorAppointmentCalendar />
      )}
      
      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">
            Appointment History
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            This is a placeholder for past appointments.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default DoctorAppointmentsPage;