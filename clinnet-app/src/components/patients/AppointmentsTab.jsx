// src/components/patients/AppointmentsTab.jsx
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';

// Mock appointments data
const mockAppointments = [
  {
    id: 101,
    patientId: 1,
    date: "2023-11-20",
    time: "09:00 AM",
    doctorName: "Dr. Smith",
    reason: "Annual checkup",
    notes: "Patient reported feeling well. Blood pressure normal.",
    status: "Completed"
  },
  {
    id: 102,
    patientId: 1,
    date: "2023-12-05",
    time: "10:30 AM",
    doctorName: "Dr. Jones",
    reason: "Follow-up",
    notes: "",
    status: "Scheduled"
  },
  {
    id: 103,
    patientId: 2,
    date: "2023-10-05",
    time: "11:00 AM",
    doctorName: "Dr. Wilson",
    reason: "Diabetes management",
    notes: "Adjusted medication dosage.",
    status: "Completed"
  }
];

function AppointmentsTab({ patientId }) {
  // Get patient appointments
  const patientAppointments = mockAppointments.filter(a => a.patientId === parseInt(patientId));

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle schedule appointment
  const handleScheduleAppointment = () => {
    alert('Schedule appointment functionality will be implemented here');
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 500, color: 'primary.main' }}>
          Appointments
        </Typography>
        <Button
          variant="contained"
          startIcon={<EventIcon />}
          onClick={handleScheduleAppointment}
          sx={{ borderRadius: 1.5 }}
        >
          Schedule Appointment
        </Button>
      </Box>
      
      {patientAppointments.length > 0 ? (
        <Grid container spacing={3}>
          {patientAppointments.map((appointment) => (
            <Grid item xs={12} md={6} key={appointment.id}>
              <Card sx={{ 
                height: '100%',
                borderLeft: 6,
                borderColor: appointment.status === 'Completed' ? 'success.main' : 'primary.main',
              }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                    {formatDate(appointment.date)} at {appointment.time}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Doctor: {appointment.doctorName}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Reason: {appointment.reason}
                  </Typography>
                  {appointment.notes && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Notes: {appointment.notes}
                    </Typography>
                  )}
                  <Chip 
                    label={appointment.status} 
                    size="small" 
                    color={appointment.status === 'Completed' ? 'success' : 'primary'}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
          No appointments found for this patient.
        </Typography>
      )}
    </>
  );
}

export default AppointmentsTab;