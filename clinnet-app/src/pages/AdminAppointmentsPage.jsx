// src/pages/AdminAppointmentsPage.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab 
} from '@mui/material';
import AdminAppointmentCalendar from '../features/appointments/components/AdminAppointmentCalendar';

function AdminAppointmentsPage() {
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Appointments
      </Typography>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        centered={false}
      >
        <Tab label="Calendar View" />
        <Tab label="List View" />
        <Tab label="Settings" />
      </Tabs>
      
      {tabValue === 0 && (
        <AdminAppointmentCalendar />
      )}
      
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">
            Appointment List
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            This is a placeholder for the appointment list view.
          </Typography>
        </Paper>
      )}
      
      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">
            Appointment Settings
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            This is a placeholder for appointment settings like working hours, appointment types, etc.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default AdminAppointmentsPage;