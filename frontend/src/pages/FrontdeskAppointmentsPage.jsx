// src/pages/FrontdeskAppointmentsPage.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab,
  Container
} from '@mui/material';
import FrontdeskAppointmentCalendar from '../features/appointments/components/FrontdeskAppointmentCalendar';
import FrontdeskTodaySchedule from '../features/appointments/components/FrontdeskTodaySchedule';
import FrontdeskAppointmentHistory from '../features/appointments/components/FrontdeskAppointmentHistory';
import PageContainer from '../components/ui/PageContainer';
import PageHeading from '../components/ui/PageHeading';

function FrontdeskAppointmentsPage() {
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  return (
    <PageContainer>
      <PageHeading 
        title="Appointments" 
        subtitle="Manage patient check-ins and appointments"
      />
      
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
        <FrontdeskTodaySchedule />
      )}
      
      {tabValue === 1 && (
        <FrontdeskAppointmentCalendar />
      )}
      
      {tabValue === 2 && (
        <FrontdeskAppointmentHistory />
      )}
    </PageContainer>
  );
}

export default FrontdeskAppointmentsPage;