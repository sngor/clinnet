// src/pages/DoctorAppointmentsPage.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab,
  Container
} from '@mui/material';
import DoctorAppointmentCalendar from '../features/appointments/components/DoctorAppointmentCalendar';
import DoctorTodaySchedule from '../features/appointments/components/DoctorTodaySchedule';
import DoctorAppointmentHistory from '../features/appointments/components/DoctorAppointmentHistory';

function DoctorAppointmentsPage() {
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  return (
    <Container maxWidth="xl" disableGutters>
      {/* Page header */}
      <Box 
        sx={{ 
          mb: 4,
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 'medium',
            color: 'primary.main'
          }}
        >
          My Appointments
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          View and manage your appointment schedule
        </Typography>
      </Box>
      
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
        <DoctorTodaySchedule />
      )}
      
      {tabValue === 1 && (
        <DoctorAppointmentCalendar />
      )}
      
      {tabValue === 2 && (
        <DoctorAppointmentHistory />
      )}
    </Container>
  );
}

export default DoctorAppointmentsPage;