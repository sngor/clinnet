// src/pages/AdminAppointmentsPage.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab,
  Container
} from '@mui/material';
import AdminAppointmentCalendar from '../features/appointments/components/AdminAppointmentCalendar';
import AdminAppointmentHistory from '../features/appointments/components/AdminAppointmentHistory';

function AdminAppointmentsPage() {
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
          Appointments
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          Manage all appointments across the practice
        </Typography>
      </Box>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        centered={false}
      >
        <Tab label="Calendar View" />
        <Tab label="Appointment History" />
      </Tabs>
      
      {tabValue === 0 && (
        <AdminAppointmentCalendar />
      )}
      
      {tabValue === 1 && (
        <AdminAppointmentHistory />
      )}
    </Container>
  );
}

export default AdminAppointmentsPage;