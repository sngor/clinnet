// src/pages/AdminAppointmentsPage.jsx
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
import FrontdeskAppointmentCalendar from '../features/appointments/components/FrontdeskAppointmentCalendar';
import AppointmentCard from '../components/AppointmentCard';
import PageHeader from '../components/PageHeader';

// Mock data for all appointments (admin can see all appointments)
const allAppointments = [
  {
    id: 201,
    patientName: "Alice Brown",
    time: "09:00 AM",
    doctorName: "Dr. Smith",
    status: "Scheduled",
    type: "Checkup"
  },
  {
    id: 202,
    patientName: "Bob White",
    time: "09:30 AM",
    doctorName: "Dr. Jones",
    status: "Checked-in",
    type: "Follow-up"
  },
  {
    id: 203,
    patientName: "Charlie Green",
    time: "10:00 AM",
    doctorName: "Dr. Smith",
    status: "In Progress",
    type: "Consultation"
  },
  {
    id: 204,
    patientName: "David Black",
    time: "10:30 AM",
    doctorName: "Dr. Jones",
    status: "Scheduled",
    type: "New Patient"
  },
  {
    id: 205,
    patientName: "Eva Gray",
    time: "11:00 AM",
    doctorName: "Dr. Wilson",
    status: "Scheduled",
    type: "Annual Physical"
  },
  {
    id: 206,
    patientName: "Frank Miller",
    time: "11:30 AM",
    doctorName: "Dr. Taylor",
    status: "Cancelled",
    type: "Follow-up"
  }
];

function AdminAppointmentsPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Use the consistent PageHeader component */}
      <PageHeader 
        title="Appointments" 
        subtitle="View and manage all clinic appointments"
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
        <Tab label="All Appointments" />
      </Tabs>

      {tabValue === 0 && (
        <FrontdeskAppointmentCalendar />
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
            All Appointments
          </Typography>
          
          <Grid container spacing={3}>
            {allAppointments.map((appointment) => (
              <Grid item xs={12} sm={6} md={4} key={appointment.id}>
                <AppointmentCard appointment={appointment} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Container>
  );
}

export default AdminAppointmentsPage;