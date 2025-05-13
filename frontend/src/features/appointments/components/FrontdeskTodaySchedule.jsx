// src/features/appointments/components/FrontdeskTodaySchedule.jsx
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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import NoteIcon from '@mui/icons-material/Note';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DoneIcon from '@mui/icons-material/Done';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
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
    doctor: "Dr. Smith",
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
    doctor: "Dr. Johnson",
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
    doctor: "Dr. Smith",
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
    doctor: "Dr. Williams",
    status: "Scheduled",
    type: "Emergency",
    notes: "Severe abdominal pain"
  }
];

function FrontdeskTodaySchedule() {
  const [appointments, setAppointments] = useState(mockTodayAppointments);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [checkInNotes, setCheckInNotes] = useState("");

  // Get color for status chip
  const getStatusColor = (status) => {
    switch(status) {
      case 'Scheduled':
        return 'info';
      case 'Checked-in':
        return 'primary';
      case 'In Progress':
        return 'warning';
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

  // Handle check-in dialog open
  const handleOpenCheckInDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setCheckInNotes("");
    setCheckInDialogOpen(true);
  };

  // Handle check-in
  const handleCheckIn = () => {
    setAppointments(appointments.map(appointment => 
      appointment.id === selectedAppointment.id 
        ? { ...appointment, status: 'Checked-in', notes: appointment.notes + (checkInNotes ? `\nCheck-in notes: ${checkInNotes}` : '') } 
        : appointment
    ));
    setCheckInDialogOpen(false);
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
        return { label: 'Check In', icon: <HowToRegIcon />, action: 'check-in' };
      case 'Checked-in':
        return { label: 'Start Visit', icon: <PlayArrowIcon />, nextStatus: 'In Progress' };
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
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocalHospitalIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {appointment.doctor}
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
                              onClick={() => {
                                if (appointment.status === 'Scheduled') {
                                  handleOpenCheckInDialog(appointment);
                                } else {
                                  handleStatusChange(appointment.id, getNextAction(appointment.status).nextStatus);
                                }
                              }}
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
            The schedule is clear!
          </Typography>
        </Box>
      )}

      {/* Check-in Dialog */}
      <Dialog open={checkInDialogOpen} onClose={() => setCheckInDialogOpen(false)}>
        <DialogTitle>Patient Check-In</DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                {selectedAppointment.patient} - {selectedAppointment.type}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {formatTime(selectedAppointment.start)} with {selectedAppointment.doctor}
              </Typography>
              <TextField
                margin="dense"
                label="Check-in Notes"
                fullWidth
                multiline
                rows={3}
                value={checkInNotes}
                onChange={(e) => setCheckInNotes(e.target.value)}
                placeholder="Enter any notes about the patient's arrival (optional)"
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckInDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCheckIn} variant="contained" color="primary">
            Confirm Check-In
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default FrontdeskTodaySchedule;