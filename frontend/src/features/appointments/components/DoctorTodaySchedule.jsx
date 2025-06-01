// src/features/appointments/components/DoctorTodaySchedule.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Alert
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import NoteIcon from '@mui/icons-material/Note';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DoneIcon from '@mui/icons-material/Done';
import { format, parseISO, getHours, startOfDay } from 'date-fns'; // Added parseISO, getHours, startOfDay

// Custom UI Components
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import EmptyState from '../../../components/ui/EmptyState'; // Assuming EmptyState is preferred over custom text

// Services and Auth
import { useAuth } from '../../../app/providers/AuthProvider';
import appointmentService from '../../../services/appointmentService';


function DoctorTodaySchedule() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !user.username) {
      setLoading(false);
      // setError("User details not available."); // Optionally set error for user not found
      return;
    }

    let isMounted = true;
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const allAppointments = await appointmentService.getAppointmentsByDoctor(user.username);
        if (isMounted) {
          // Filter for today's appointments and prepare data
          const today = startOfDay(new Date());
          const todayAppointments = allAppointments
            .filter(appt => {
              // Assuming appt.appointmentDate is a string like "YYYY-MM-DD" or full ISO string
              // And appt.time or appt.startTime might exist for more precise time
              // For now, let's assume appointmentDate is the primary field for date filtering
              if (!appt.appointmentDate) return false;
              const apptDate = startOfDay(parseISO(appt.appointmentDate));
              return apptDate.getTime() === today.getTime();
            })
            .map(appt => {
              // Map to the structure expected by the rendering logic (start/end times)
              // This is a critical part and depends heavily on the actual API response structure
              // Example: if API returns 'appointmentDate' (YYYY-MM-DD) and 'time' (HH:MM:SS)
              let startDate, endDate;
              if (appt.appointmentDate && appt.time) { // Common case
                startDate = parseISO(`${appt.appointmentDate}T${appt.time}`);
              } else if (appt.startDateTime) { // If API provides full ISO datetime for start
                startDate = parseISO(appt.startDateTime);
              } else if (appt.appointmentDate) { // Fallback if only date is available
                startDate = parseISO(appt.appointmentDate); // Defaults to midnight
              } else {
                startDate = new Date(); // Should not happen with valid data
              }

              // Similar logic for end time, might be duration based or explicit endDateTime
              if (appt.appointmentDate && appt.endTime) {
                endDate = parseISO(`${appt.appointmentDate}T${appt.endTime}`);
              } else if (appt.endDateTime) {
                endDate = parseISO(appt.endDateTime);
              } else if (startDate) { // Default to 1 hour duration if no end time
                endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
              } else {
                endDate = new Date(); // Should not happen
              }

              return {
                ...appt,
                // Ensure patientName is mapped to patient for rendering if needed,
                // but the Link will use patientName directly if available, or patient as fallback.
                patient: appt.patientName || appt.patient || "N/A", // Ensure 'patient' field for rendering
                start: startDate,
                end: endDate,
              };
            });
          setAppointments(todayAppointments);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to fetch appointments.");
          setAppointments([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAppointments();

    return () => {
      isMounted = false;
    };
  }, [user]);

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
    // Use getHours from date-fns for safety with potentially invalid dates from parsing
    const hour = appointment.start ? getHours(appointment.start) : -1; // handle potential invalid date
    if (hour === -1) return acc; // Skip if date is invalid
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
      {loading && <LoadingIndicator message="Loading today's schedule..." />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Today's Schedule</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {appointments.length > 0 ? (
        Object.keys(groupedAppointments)
          .filter(hourKey => groupedAppointments[hourKey] && groupedAppointments[hourKey].length > 0) // Ensure hour group is not empty
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map(hour => (
            <Box key={hour} sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'medium' }}>
                {/* Ensure hour is valid before formatting */}
                {parseInt(hour) >= 0 && parseInt(hour) <=23 ? formatTime(new Date(new Date().setHours(parseInt(hour), 0, 0, 0))) : "Invalid Time"}
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
                            <Link to={`/doctor/patients/${appointment.patientId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              {appointment.patientName || appointment.patient} {/* Use patientName first, fallback to patient */}
                            </Link>
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
                            {/* Ensure start and end are valid dates before formatting */}
                            {appointment.start && appointment.end ?
                              `${formatTime(appointment.start)} - ${formatTime(appointment.end)}`
                              : "Time N/A"}
                          </Typography>
                        </Box>
                        
                        {/* Patient ID display can be removed if name is linked, or kept for clarity */}
                        {/* <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Patient ID: {appointment.patientId}
                          </Typography>
                        </Box> */}
                        
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
        <EmptyState
          title="No Appointments Today"
          description="No appointments are scheduled for today. Enjoy your day!"
        />
      )}
        </>
      )}
    </Paper>
  );
}

export default DoctorTodaySchedule;