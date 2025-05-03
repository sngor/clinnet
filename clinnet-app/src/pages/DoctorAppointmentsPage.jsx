// src/pages/DoctorAppointmentsPage.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Grid,
  Container
} from '@mui/material';
import AppointmentCalendar from '../features/appointments/components/AppointmentCalendar';
import AppointmentCard from '../components/AppointmentCard';
import PageHeader from '../components/PageHeader';

// Mock data for doctor's appointments
const doctorAppointments = [
  {
    id: 301,
    patientName: "Alice Brown",
    time: "09:00 AM",
    status: "Scheduled",
    type: "Checkup",
    notes: "Annual physical examination"
  },
  {
    id: 302,
    patientName: "Bob White",
    time: "09:30 AM",
    status: "Checked-in",
    type: "Follow-up",
    notes: "Follow-up on medication adjustment"
  },
  {
    id: 303,
    patientName: "Charlie Green",
    time: "10:00 AM",
    status: "In Progress",
    type: "Consultation",
    notes: "New symptoms discussion"
  },
  {
    id: 304,
    patientName: "David Black",
    time: "10:30 AM",
    status: "Scheduled",
    type: "New Patient",
    notes: "Initial consultation"
  },
];

function DoctorAppointmentsPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Use the consistent PageHeader component */}
      <PageHeader 
        title="My Appointments" 
        subtitle="View and manage your patient appointments"
      />

      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ 
          mb: 3, 
          borderBottom: 1, 
          borderColor: 'divider',
          '& .MuiTab-root': {
            fontWeight: 500,
            fontSize: '1rem',
            textTransform: 'none',
          }
        }}
        centered
      >
        <Tab label="Calendar View" />
        <Tab label="Today's Appointments" />
      </Tabs>

      {tabValue === 0 && (
        <AppointmentCalendar />
      )}

      {tabValue === 1 && (
        <Paper 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderRadius: 2, 
            boxShadow: 2, 
            width: '100%' 
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 3, 
              fontWeight: 500,
              color: 'primary.main' 
            }}
          >
            Today's Appointments
          </Typography>
          
          <Grid container spacing={3}>
            {doctorAppointments.map((appointment) => (
              <Grid item xs={12} sm={6} md={4} key={appointment.id}>
                <AppointmentCard 
                  appointment={appointment} 
                  showDoctor={false} // Doctor doesn't need to see their own name
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Container>
  );
}

export default DoctorAppointmentsPage;