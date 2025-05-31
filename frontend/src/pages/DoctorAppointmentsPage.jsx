// src/pages/DoctorAppointmentsPage.jsx
import React, { useState } from 'react';
import { 
  Box, // Keep Box for internal layout if needed for Tabs
  // Typography, // Will be handled by PageLayout
  Tabs, 
  Tab,
  // Container // Replaced by PageLayout
} from '@mui/material';
import { PageLayout } from '../components/ui'; // Import PageLayout
import DoctorAppointmentCalendar from '../features/appointments/components/DoctorAppointmentCalendar';
import DoctorTodaySchedule from '../features/appointments/components/DoctorTodaySchedule';
import DoctorAppointmentHistory from '../features/appointments/components/DoctorAppointmentHistory';

function DoctorAppointmentsPage() {
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  return (
    <PageLayout
      title="My Appointments"
      subtitle="View and manage your appointment schedule"
      maxWidth="xl" // Retain maxWidth if needed, disableGutters is not a PageLayout prop
    >
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        centered={false} // This prop might not be available on default Tabs
      >
        <Tab label="Today's Schedule" />
        <Tab label="Calendar View" />
        <Tab label="Appointment History" />
      </Tabs>
      
      {/* Content for each tab */}
      {tabValue === 0 && (
        <DoctorTodaySchedule />
      )}
      
      {tabValue === 1 && (
        <DoctorAppointmentCalendar />
      )}
      
      {tabValue === 2 && (
        <DoctorAppointmentHistory />
      )}
    </PageLayout>
  );
}

export default DoctorAppointmentsPage;