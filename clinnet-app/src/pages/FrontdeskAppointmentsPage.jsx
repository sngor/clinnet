// src/pages/FrontdeskAppointmentsPage.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import FrontdeskAppointmentCalendar from '../features/appointments/components/FrontdeskAppointmentCalendar';

// Mock data for today's appointments
const todaysAppointments = [
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
];

function FrontdeskAppointmentsPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Scheduled':
        return 'primary';
      case 'Checked-in':
        return 'success';
      case 'In Progress':
        return 'warning';
      case 'Completed':
        return 'info';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        centered
      >
        <Tab label="Calendar View" />
        <Tab label="Today's Appointments" />
      </Tabs>

      {tabValue === 0 && (
        <FrontdeskAppointmentCalendar />
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, width: '100%' }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Today's Appointments
          </Typography>
          
          <Grid container spacing={2}>
            {todaysAppointments.map((appointment) => (
              <Grid item xs={12} sm={6} md={4} key={appointment.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderLeft: 5, 
                    borderColor: `${getStatusColor(appointment.status)}.main` 
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" component="div">
                        {appointment.time}
                      </Typography>
                      <Chip 
                        label={appointment.status} 
                        color={getStatusColor(appointment.status)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {appointment.patientName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Doctor: {appointment.doctorName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Type: {appointment.type}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
}

export default FrontdeskAppointmentsPage;