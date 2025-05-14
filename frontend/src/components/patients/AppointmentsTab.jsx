// src/components/patients/AppointmentsTab.jsx
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';

// Mock appointments data - in a real app, this would come from an API
const mockAppointments = [
  {
    id: 1,
    date: '2023-12-05',
    time: '09:00 AM',
    doctor: 'Dr. Smith',
    type: 'Checkup',
    status: 'Scheduled'
  },
  {
    id: 2,
    date: '2023-11-20',
    time: '02:30 PM',
    doctor: 'Dr. Jones',
    type: 'Follow-up',
    status: 'Completed'
  },
  {
    id: 3,
    date: '2023-10-15',
    time: '11:00 AM',
    doctor: 'Dr. Smith',
    type: 'Consultation',
    status: 'Completed'
  }
];

function AppointmentsTab({ patientId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch appointments for this patient
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      try {
        // Filter appointments for this patient
        setAppointments(mockAppointments);
        setLoading(false);
      } catch (err) {
        setError(`Failed to load appointments: ${err.message}`);
        setLoading(false);
      }
    }, 500);
  }, [patientId]);

  // Get color for status chip
  const getStatusColor = (status) => {
    switch(status) {
      case 'Scheduled':
        return 'primary';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'error';
      case 'No-show':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error">
        {error}
      </Typography>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Patient Appointments
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          size="small"
        >
          Schedule Appointment
        </Button>
      </Box>

      {appointments.length > 0 ? (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{formatDate(appointment.date)}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>{appointment.doctor}</TableCell>
                  <TableCell>{appointment.type}</TableCell>
                  <TableCell>
                    <Chip 
                      label={appointment.status} 
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No appointments found for this patient
        </Typography>
      )}
    </Box>
  );
}

export default AppointmentsTab;