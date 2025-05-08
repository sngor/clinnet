// src/features/appointments/components/DoctorTodaySchedule.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  Chip, 
  Divider, 
  Grid,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import NoteIcon from '@mui/icons-material/Note';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DoneIcon from '@mui/icons-material/Done';
import { format } from 'date-fns';

// Mock appointments for today
const mockTodayAppointments = [
  {
    id: 1,
    title: "Alice Brown - Checkup",
    start: new Date(new Date().setHours(9, 0, 0, 0)),
    end: new Date(new Date().setHours(10, 0, 0, 0)),
    patient: "Alice Brown",
    patientId: 101,
    status: "Scheduled",
    type: "Checkup",
    notes: "Annual physical examination"
  },
  {
    id: 2,
    title: "Bob White - Consultation",
    start: new Date(new Date().setHours(11, 0, 0, 0)),
    end: new Date(new Date().setHours(12, 0, 0, 0)),
    patient: "Bob White",
    patientId: 102,
    status: "Checked-in",
    type: "Consultation",
    notes: "Follow-up on medication"
  },
  {
    id: 3,
    title: "Charlie Green - Follow-up",
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(15, 0, 0, 0)),
    patient: "Charlie Green",
    patientId: 103,
    status: "Scheduled",
    type: "Follow-up",
    notes: "Review test results"
  },
  {
    id: 4,
    title: "David Black - Emergency",
    start: new Date(new Date().setHours(16, 30, 0, 0)),
    end: new Date(new Date().setHours(17, 30, 0, 0)),
    patient: "David Black",
    patientId: 104,
    status: "Scheduled",
    type: "Emergency",
    notes: "Severe abdominal pain"
  }
];

function DoctorTodaySchedule() {
  const [appointments, setAppointments] = useState(mockTodayAppointments);

  // Get color for status chip
  const getStatusColor = (status) => {
    switch(status) {
      case 'Scheduled':
        return 'info';
      case 'Checked-in':
        return 'primary';
      case 'In Progress':
        return 'warning';
      case 'Ready for Checkout':
        return 'secondary';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format time
  const formatTime = (date) => {
    return format(date, 'h:mm a');
  };

  // Handle status change
  const handleStatusChange = (appointmentId, newStatus) => {
    setAppointments(appointments.map(appointment => 
      appointment.id === appointmentId 
        ? { ...appointment, status: newStatus } 
        : appointment
    ));
  };

  // Group appointments by time
  const groupedAppointments = appointments.reduce((acc, appointment) => {
    const hour = appointment.start.getHours();
    if (!acc[hour]) {
      acc[hour] = [];
    }
    acc[hour].push(appointment);
    return acc;
  }, {});

  // Get next action based on status
  const getNextAction = (status) => {
    switch(status) {
      case 'Scheduled':
        return { label: 'Start', icon: <PlayArrowIcon />, nextStatus: 'In Progress' };
      case 'Checked-in':
        return { label: 'Start', icon: <PlayArrowIcon />, nextStatus: 'In Progress' };
      case 'In Progress':
        return { label: 'Complete', icon: <DoneIcon />, nextStatus: 'Completed' };
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Today's Schedule</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {Object.keys(groupedAppointments).length > 0 ? (
        Object.keys(groupedAppointments)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map(hour => (
            <Box key={hour} sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'medium' }}>
                {formatTime(new Date(new Date().setHours(parseInt(hour), 0, 0, 0)))}
              </Typography>
              
              <Grid container spacing={2}>
                {groupedAppointments[hour].map(appointment => (
                  <Grid item xs={12} md={6} key={appointment.id}>
                    <Card 
                      sx={{ 
                        borderLeft: 4, 
                        borderColor: getStatusColor(appointment.status) + '.main',
                        boxShadow: 2,
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4
                        }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                            {appointment.patient}
                          </Typography>
                          <Chip 
                            label={appointment.status} 
                            color={getStatusColor(appointment.status)} 
                            size="small" 
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatTime(appointment.start)} - {formatTime(appointment.end)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Patient ID: {appointment.patientId}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <NoteIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {appointment.notes}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Chip 
                            label={appointment.type} 
                            variant="outlined" 
                            size="small" 
                            color="primary"
                          />
                          
                          {appointment.status !== 'Completed' && appointment.status !== 'Cancelled' && (
                            <Button
                              variant="contained"
                              size="small"
                              color={appointment.status === 'In Progress' ? 'success' : 'primary'}
                              startIcon={getNextAction(appointment.status).icon}
                              onClick={() => handleStatusChange(appointment.id, getNextAction(appointment.status).nextStatus)}
                            >
                              {getNextAction(appointment.status).label}
                            </Button>
                          )}
                          
                          {appointment.status === 'Completed' && (
                            <Tooltip title="Appointment completed">
                              <CheckCircleIcon color="success" />
                            </Tooltip>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))
      ) : (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary">
            No appointments scheduled for today
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Enjoy your day off!
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default DoctorTodaySchedule;