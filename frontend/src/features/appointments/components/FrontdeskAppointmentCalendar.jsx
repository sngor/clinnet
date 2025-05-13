// src/features/appointments/components/FrontdeskAppointmentCalendar.jsx
import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Card,
  CardContent,
  Chip,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import ViewListIcon from '@mui/icons-material/ViewList';
import { 
  format, 
  addDays, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth,
  endOfMonth,
  eachDayOfInterval, 
  eachWeekOfInterval,
  isToday, 
  isSameDay,
  isSameMonth
} from 'date-fns';

// Import mock data from centralized location
import { mockDoctors } from '../../../mock/mockDoctors';
import { mockPatients } from '../../../mock/mockPatients';
import { mockAppointments, getAppointmentStatusColor } from '../../../mock/mockAppointments';
import { formatTime } from '../../../utils/dateUtils';

// Time slots for the calendar
const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

function FrontdeskAppointmentCalendar() {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [openDialog, setOpenDialog] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    title: "",
    start: new Date(),
    end: new Date(new Date().getTime() + 3600000), // 1 hour later
    doctor: "",
    doctorId: "",
    patient: "",
    patientId: "",
    status: "Scheduled",
    type: ""
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('all');
  
  // Calendar view type
  const [calendarView, setCalendarView] = useState('week'); // 'week' or 'month'
  
  // Get current week dates
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset form
    setNewAppointment({
      title: "",
      start: new Date(),
      end: new Date(new Date().getTime() + 3600000),
      doctor: "",
      doctorId: "",
      patient: "",
      patientId: "",
      status: "Scheduled",
      type: ""
    });
    setSelectedPatient(null);
    setSelectedDoctor(null);
  };

  const handleAppointmentFieldChange = (field, date) => {
    setNewAppointment({
      ...newAppointment,
      [field]: date
    });
  };

  const handlePatientChange = (event, value) => {
    if (value) {
      setSelectedPatient(value);
      setNewAppointment({
        ...newAppointment,
        patient: value.name || `${value.firstName} ${value.lastName}`,
        patientId: value.id
      });
    } else {
      setSelectedPatient(null);
      setNewAppointment({
        ...newAppointment,
        patient: "",
        patientId: ""
      });
    }
  };

  const handleDoctorChange = (event, value) => {
    if (value) {
      setSelectedDoctor(value);
      setNewAppointment({
        ...newAppointment,
        doctor: value.name,
        doctorId: value.id
      });
    } else {
      setSelectedDoctor(null);
      setNewAppointment({
        ...newAppointment,
        doctor: "",
        doctorId: ""
      });
    }
  };

  const handleCreateAppointment = () => {
    // Create a title from patient name and appointment type
    const title = `${newAppointment.patient} - ${newAppointment.type || "Appointment"}`;
    
    const appointment = {
      ...newAppointment,
      id: Date.now(), // Simple ID generation
      title
    };
    
    setAppointments([...appointments, appointment]);
    handleCloseDialog();
  };

  // Handle view mode change
  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };
  
  // Handle calendar view change
  const handleCalendarViewChange = (event, newView) => {
    if (newView !== null) {
      setCalendarView(newView);
    }
  };
  
  // Handle date navigation
  const handleDateNavigation = (direction) => {
    if (direction === 'prev') {
      setCurrentDate(prev => {
        if (calendarView === 'week') {
          return addDays(prev, -7);
        } else {
          // For month view, go back one month
          const newDate = new Date(prev);
          newDate.setMonth(prev.getMonth() - 1);
          return newDate;
        }
      });
    } else if (direction === 'next') {
      setCurrentDate(prev => {
        if (calendarView === 'week') {
          return addDays(prev, 7);
        } else {
          // For month view, go forward one month
          const newDate = new Date(prev);
          newDate.setMonth(prev.getMonth() + 1);
          return newDate;
        }
      });
    } else if (direction === 'today') {
      setCurrentDate(new Date());
    }
  };

  // Filter appointments by doctor
  const filteredAppointments = selectedDoctorFilter === 'all' 
    ? appointments 
    : appointments.filter(appointment => appointment.doctorId === parseInt(selectedDoctorFilter));

  // Get appointments for a specific day
  const getAppointmentsForDay = (day) => {
    return filteredAppointments.filter(appointment => 
      isSameDay(new Date(appointment.start), day)
    );
  };

  // Group appointments by doctor
  const appointmentsByDoctor = filteredAppointments.reduce((acc, appointment) => {
    if (!acc[appointment.doctorId]) {
      acc[appointment.doctorId] = [];
    }
    acc[appointment.doctorId].push(appointment);
    return acc;
  }, {});

  // Render week view calendar
  const renderWeekCalendar = () => {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {format(weekStart, 'MMMM d')} - {format(weekEnd, 'MMMM d, yyyy')}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          height: 'calc(100vh - 350px)', 
          border: '1px solid #e0e0e0',
          overflow: 'auto' // Make the entire calendar scrollable
        }}>
          {/* Time column */}
          <Box sx={{ 
            width: '80px', 
            borderRight: '1px solid #e0e0e0', 
            bgcolor: '#f5f5f5',
            position: 'sticky',
            left: 0,
            zIndex: 1 // Ensure time column stays above other content when scrolling
          }}>
            <Box sx={{ 
              height: '40px', 
              borderBottom: '1px solid #e0e0e0',
              position: 'sticky',
              top: 0,
              bgcolor: '#f5f5f5',
              zIndex: 2 // Higher z-index for the corner cell
            }} /> {/* Empty cell for header */}
            {timeSlots.map(hour => (
              <Box 
                key={hour} 
                sx={{ 
                  height: '60px', 
                  borderBottom: '1px solid #e0e0e0',
                  p: 1,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="caption">
                  {hour % 12 === 0 ? 12 : hour % 12} {hour >= 12 ? 'PM' : 'AM'}
                </Typography>
              </Box>
            ))}
          </Box>
          
          {/* Days columns container */}
          <Box sx={{ 
            display: 'flex', 
            flexGrow: 1,
            minWidth: 'min-content' // Ensure columns don't shrink too much
          }}>
            {/* Days columns */}
            {weekDays.map(day => (
              <Box 
                key={format(day, 'yyyy-MM-dd')} 
                sx={{ 
                  flexGrow: 1, 
                  borderRight: '1px solid #e0e0e0',
                  position: 'relative',
                  minWidth: '150px', // Minimum width for each day column
                }}
              >
                {/* Day header */}
                <Box 
                  sx={{ 
                    height: '40px', 
                    borderBottom: '1px solid #e0e0e0',
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isToday(day) ? 'primary.light' : '#f5f5f5',
                    color: isToday(day) ? 'white' : 'inherit',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1
                  }}
                >
                  <Typography variant="subtitle2">
                    {format(day, 'EEE d')}
                  </Typography>
                </Box>
                
                {/* Time slots */}
                {timeSlots.map(hour => (
                  <Box 
                    key={hour} 
                    sx={{ 
                      height: '60px', 
                      borderBottom: '1px solid #e0e0e0',
                      position: 'relative'
                    }}
                  />
                ))}
                
                {/* Render appointments for this day */}
                {getAppointmentsForDay(day).map(appointment => {
                  const startHour = appointment.start.getHours();
                  const startMinutes = appointment.start.getMinutes();
                  const endHour = appointment.end.getHours();
                  const endMinutes = appointment.end.getMinutes();
                  
                  const top = 40 + (startHour - 8) * 60 + startMinutes; // 40px for the header
                  const height = ((endHour - startHour) * 60) + (endMinutes - startMinutes);
                  
                  return (
                    <Box
                      key={appointment.id}
                      sx={{
                        position: 'absolute',
                        top: `${top}px`,
                        left: '2px',
                        right: '2px',
                        height: `${height}px`,
                        backgroundColor: getAppointmentStatusColor(appointment.status) + '.light',
                        color: 'white',
                        borderRadius: 1,
                        p: 0.5,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: getAppointmentStatusColor(appointment.status) + '.main',
                        }
                      }}
                    >
                      <Typography variant="caption" noWrap>
                        {appointment.title}
                      </Typography>
                      <Typography variant="caption" display="block" noWrap sx={{ fontSize: '0.65rem' }}>
                        {appointment.doctor}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  };
  
  // Render month view calendar
  const renderMonthCalendar = () => {
    // Get month dates
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // Get all weeks in the month
    const monthWeeks = eachWeekOfInterval(
      { start: monthStart, end: monthEnd },
      { weekStartsOn: 1 } // Start on Monday
    );
    
    // Get all days in the month view (including days from previous/next months)
    const calendarDays = monthWeeks.flatMap(weekStart => {
      return eachDayOfInterval({
        start: weekStart,
        end: addDays(weekStart, 6)
      });
    });
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {format(monthStart, 'MMMM yyyy')}
        </Typography>
        
        <Box sx={{ 
          width: '100%',
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          overflow: 'hidden'
        }}>
          {/* Day headers */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)',
            bgcolor: '#f5f5f5',
            borderBottom: '1px solid #e0e0e0'
          }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <Box 
                key={day} 
                sx={{ 
                  p: 1,
                  textAlign: 'center',
                  borderRight: '1px solid #e0e0e0',
                  '&:last-child': {
                    borderRight: 'none'
                  }
                }}
              >
                <Typography variant="subtitle2">{day}</Typography>
              </Box>
            ))}
          </Box>
          
          {/* Calendar grid */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridAutoRows: 'minmax(120px, 1fr)',
          }}>
            {calendarDays.map(day => {
              const dayAppointments = getAppointmentsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              
              return (
                <Box 
                  key={format(day, 'yyyy-MM-dd')} 
                  sx={{ 
                    p: 1,
                    borderRight: '1px solid #e0e0e0',
                    borderBottom: '1px solid #e0e0e0',
                    bgcolor: isToday(day) ? 'primary.light' : 
                           !isCurrentMonth ? '#f9f9f9' : 'background.paper',
                    color: isToday(day) ? 'white' : 
                           !isCurrentMonth ? 'text.disabled' : 'text.primary',
                    position: 'relative',
                    height: '100%',
                    '&:nth-of-type(7n)': {
                      borderRight: 'none'
                    },
                    '&:nth-last-of-type(-n+7)': {
                      borderBottom: 'none'
                    }
                  }}
                >
                  {/* Day number */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: isToday(day) ? 'bold' : 'normal',
                      mb: 1
                    }}
                  >
                    {format(day, 'd')}
                  </Typography>
                  
                  {/* Appointments for this day */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 0.5,
                    maxHeight: 'calc(100% - 24px)',
                    overflow: 'auto'
                  }}>
                    {dayAppointments.map(appointment => (
                      <Box
                        key={appointment.id}
                        sx={{
                          backgroundColor: getAppointmentStatusColor(appointment.status) + '.light',
                          color: 'white',
                          borderRadius: 1,
                          p: 0.5,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          '&:hover': {
                            backgroundColor: getAppointmentStatusColor(appointment.status) + '.main',
                          }
                        }}
                      >
                        {format(appointment.start, 'h:mm a')} - {appointment.patient}
                        <Typography variant="caption" display="block" sx={{ fontSize: '0.65rem' }}>
                          {appointment.doctor}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ mb: 3, textAlign: 'left' }}>
        <Typography variant="h6">Appointment Calendar</Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage all scheduled appointments
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, flexWrap: 'wrap', gap: 2 }}>
        {/* Date navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => handleDateNavigation('prev')}
          >
            Previous
          </Button>
          <Button 
            variant="contained" 
            size="small"
            onClick={() => handleDateNavigation('today')}
          >
            Today
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => handleDateNavigation('next')}
          >
            Next
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* Doctor filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Doctor</InputLabel>
            <Select
              value={selectedDoctorFilter}
              label="Filter by Doctor"
              onChange={(e) => setSelectedDoctorFilter(e.target.value)}
            >
              <MenuItem value="all">All Doctors</MenuItem>
              {mockDoctors.map(doctor => (
                <MenuItem key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Calendar view toggle */}
          {viewMode === 'calendar' && (
            <ToggleButtonGroup
              value={calendarView}
              exclusive
              onChange={handleCalendarViewChange}
              aria-label="calendar view"
              size="small"
            >
              <ToggleButton value="week" aria-label="week view">
                <Tooltip title="Week View">
                  <Typography variant="body2">Week</Typography>
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="month" aria-label="month view">
                <Tooltip title="Month View">
                  <Typography variant="body2">Month</Typography>
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          )}
          
          {/* View toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
          >
            <ToggleButton value="calendar" aria-label="calendar view">
              <Tooltip title="Calendar View">
                <CalendarViewWeekIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <Tooltip title="List View">
                <ViewListIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            size="small"
          >
            New
          </Button>
        </Box>
      </Box>

      {/* Calendar View */}
      {viewMode === 'calendar' && calendarView === 'week' && renderWeekCalendar()}
      {viewMode === 'calendar' && calendarView === 'month' && renderMonthCalendar()}

      {/* List View */}
      {viewMode === 'list' && (
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Appointments by Doctor
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            {Object.keys(appointmentsByDoctor).map(doctorId => {
              const doctorAppointments = appointmentsByDoctor[doctorId];
              const doctor = mockDoctors.find(d => d.id === parseInt(doctorId));
              
              return (
                <Grid item xs={12} md={6} key={doctorId}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      mb: 3, 
                      borderTop: 4, 
                      borderColor: 'primary.main' 
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {doctor ? doctor.name : `Doctor ID: ${doctorId}`}
                    </Typography>
                    
                    {doctorAppointments
                      .sort((a, b) => a.start - b.start)
                      .map(appointment => (
                        <Card 
                          key={appointment.id} 
                          sx={{ 
                            mb: 2, 
                            borderLeft: 4, 
                            borderColor: getAppointmentStatusColor(appointment.status) + '.main' 
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle1">
                                {appointment.patient}
                              </Typography>
                              <Chip 
                                label={appointment.status} 
                                color={getAppointmentStatusColor(appointment.status)} 
                                size="small" 
                              />
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {format(appointment.start, 'MMM d, yyyy')} • {formatTime(appointment.start)} - {formatTime(appointment.end)}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                Patient ID: {appointment.patientId}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocalHospitalIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                Type: {appointment.type}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* New Appointment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Schedule New Appointment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={mockPatients}
                getOptionLabel={(option) => option.name || `${option.firstName} ${option.lastName}`}
                value={selectedPatient}
                onChange={handlePatientChange}
                renderInput={(params) => (
                  <TextField {...params} label="Patient" fullWidth required />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={mockDoctors}
                getOptionLabel={(option) => option.name}
                value={selectedDoctor}
                onChange={handleDoctorChange}
                renderInput={(params) => (
                  <TextField {...params} label="Doctor" fullWidth required />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                required
                value={newAppointment.start.toISOString().split('T')[0]}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  const startTime = new Date(newAppointment.start);
                  date.setHours(startTime.getHours(), startTime.getMinutes());
                  
                  const endDate = new Date(date);
                  endDate.setHours(date.getHours() + 1);
                  
                  handleAppointmentFieldChange('start', date);
                  handleAppointmentFieldChange('end', endDate);
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Time"
                type="time"
                fullWidth
                required
                value={`${String(newAppointment.start.getHours()).padStart(2, '0')}:${String(newAppointment.start.getMinutes()).padStart(2, '0')}`}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':').map(Number);
                  const startDate = new Date(newAppointment.start);
                  startDate.setHours(hours, minutes);
                  
                  const endDate = new Date(startDate);
                  endDate.setHours(startDate.getHours() + 1);
                  
                  handleAppointmentFieldChange('start', startDate);
                  handleAppointmentFieldChange('end', endDate);
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Appointment Type</InputLabel>
                <Select
                  value={newAppointment.type || ""}
                  label="Appointment Type"
                  onChange={(e) => setNewAppointment({
                    ...newAppointment,
                    type: e.target.value
                  })}
                >
                  <MenuItem value="Checkup">Checkup</MenuItem>
                  <MenuItem value="Follow-up">Follow-up</MenuItem>
                  <MenuItem value="Consultation">Consultation</MenuItem>
                  <MenuItem value="Procedure">Procedure</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                multiline
                rows={3}
                fullWidth
                placeholder="Add any additional notes about the appointment"
                onChange={(e) => setNewAppointment({
                  ...newAppointment,
                  notes: e.target.value
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateAppointment} 
            variant="contained" 
            disabled={!newAppointment.patient || !newAppointment.doctor}
          >
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default FrontdeskAppointmentCalendar;