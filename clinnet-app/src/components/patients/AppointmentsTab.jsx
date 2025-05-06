// src/components/patients/AppointmentsTab.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import { useAppData } from '../../app/providers/DataProvider';
import { formatDateForDisplay } from '../../utils/validation';

function AppointmentsTab({ patientId }) {
  const { appointments, loading } = useAppData();
  const [patientAppointments, setPatientAppointments] = useState([]);

  // Filter appointments for this patient
  useEffect(() => {
    if (appointments && appointments.length > 0) {
      const filtered = appointments.filter(a => a.patientId === patientId);
      setPatientAppointments(filtered);
    }
  }, [appointments, patientId]);

  // Handle schedule appointment
  const handleScheduleAppointment = () => {
    alert('Schedule appointment functionality will be implemented here');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

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
                borderColor: appointment.status === 'completed' ? 'success.main' : 'primary.main',
              }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                    {formatDateForDisplay(appointment.startTime)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Doctor: {appointment.doctorName || 'Not assigned'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Duration: {appointment.duration || 30} minutes
                  </Typography>
                  {appointment.notes && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Notes: {appointment.notes}
                    </Typography>
                  )}
                  <Chip 
                    label={appointment.status || 'scheduled'} 
                    size="small" 
                    color={appointment.status === 'completed' ? 'success' : 'primary'}
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