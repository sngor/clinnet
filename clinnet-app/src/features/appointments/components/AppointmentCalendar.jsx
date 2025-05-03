// src/features/appointments/components/AppointmentCalendar.jsx
import React, { useState } from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Button, 
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay, addWeeks, subWeeks } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TodayIcon from '@mui/icons-material/Today';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// Mock data for appointments
const mockAppointments = [
  {
    id: 101,
    title: "John Doe - Checkup",
    start: new Date(new Date().setHours(9, 0, 0, 0)),
    end: new Date(new Date().setHours(10, 0, 0, 0)),
    doctor: "Dr. Smith",
    patient: "John Doe",
    patientId: 1,
    doctorId: 1,
    status: "Scheduled"
  },
  {
    id: 102,
    title: "Jane Smith - Consultation",
    start: new Date(new Date().setHours(11, 0, 0, 0)),
    end: new Date(new Date().setHours(12, 0, 0, 0)),
    doctor: "Dr. Jones",
    patient: "Jane Smith",
    patientId: 2,
    doctorId: 2,
    status: "Checked-in"
  },
  {
    id: 103,
    title: "Michael Johnson - Follow-up",
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(15, 0, 0, 0)),
    doctor: "Dr. Smith",
    patient: "Michael Johnson",
    patientId: 3,
    doctorId: 1,
    status: "Scheduled"
  },
  {
    id: 104,
    title: "Emily Williams - New Patient",
    start: addDays(new Date(new Date().setHours(10, 30, 0, 0)), 1),
    end: addDays(new Date(new Date().setHours(11, 30, 0, 0)), 1),
    doctor: "Dr. Wilson",
    patient: "Emily Williams",
    patientId: 4,
    doctorId: 3,
    status: "Scheduled"
  },
  {
    id: 105,
    title: "David Brown - Follow-up",
    start: addDays(new Date(new Date().setHours(13, 0, 0, 0)), 2),
    end: addDays(new Date(new Date().setHours(14, 0, 0, 0)), 2),
    doctor: "Dr. Jones",
    patient: "David Brown",
    patientId: 5,
    doctorId: 2,
    status: "Scheduled"
  }
];

// Mock data for doctors
const mockDoctors = [
  { id: 1, name: "Dr. Smith", specialty: "General Medicine" },
  { id: 2, name: "Dr. Jones", specialty: "Cardiology" },
  { id: 3, name: "Dr. Wilson", specialty: "Pediatrics" },
  { id: 4, name: "Dr. Taylor", specialty: "Dermatology" }
];

// Mock data for patients
const mockPatients = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Smith" },
  { id: 3, name: "Michael Johnson" },
  { id: 4, name: "Emily Williams" },
  { id: 5, name: "David Brown" }
];

// Time slots for the calendar
const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

function AppointmentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week'); // 'day', 'week', or 'month'
  const [appointments, setAppointments] = useState(mockAppointments);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    title: "",
    start: new Date(),
    end: new Date(new Date().getTime() + 3600000), // 1 hour later
    doctor: "",
    doctorId: "",
    patient: "",
    patientId: "",
    status: "Scheduled"
  });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Get current week dates
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Navigate to previous period
  const handlePrevious = () => {
    if (view === 'day') {
      setCurrentDate(prev => addDays(prev, -1));
    } else if (view === 'week') {
      setCurrentDate(prev => subWeeks(prev, 1));
    }
  };

  // Navigate to next period
  const handleNext = () => {
    if (view === 'day') {
      setCurrentDate(prev => addDays(prev, 1));
    } else if (view === 'week') {
      setCurrentDate(prev => addWeeks(prev, 1));
    }
  };

  // Go to today
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Change view
  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Open new appointment dialog
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    // Reset form
    setNewAppointment({
      title: "",
      start: new Date(),
      end: new Date(new Date().getTime() + 3600000),
      doctor: "",
      doctorId: "",
      patient: "",
      patientId: "",
      status: "Scheduled"
    });
    setSelectedDoctor(null);
    setSelectedPatient(null);
  };

  // Handle doctor selection
  const handleDoctorChange = (event, newValue) => {
    setSelectedDoctor(newValue);
    if (newValue) {
      setNewAppointment({
        ...newAppointment,
        doctor: newValue.name,
        doctorId: newValue.id
      });
    }
  };

  // Handle patient selection
  const handlePatientChange = (event, newValue) => {
    setSelectedPatient(newValue);
    if (newValue) {
      setNewAppointment({
        ...newAppointment,
        patient: newValue.name,
        patientId: newValue.id,
        title: `${newValue.name} - Appointment`
      });
    }
  };

  // Handle date change
  const handleDateChange = (date) => {
    const newStart = new Date(date);
    newStart.setHours(
      newAppointment.start.getHours(),
      newAppointment.start.getMinutes()
    );
    
    const newEnd = new Date(date);
    newEnd.setHours(
      newAppointment.end.getHours(),
      newAppointment.end.getMinutes()
    );
    
    setNewAppointment({
      ...newAppointment,
      start: newStart,
      end: newEnd
    });
  };

  // Handle start time change
  const handleStartTimeChange = (time) => {
    if (!time) return;
    
    const newStart = new Date(time);
    const newEnd = new Date(newStart.getTime() + 3600000); // 1 hour later
    
    setNewAppointment({
      ...newAppointment,
      start: newStart,
      end: newEnd
    });
  };

  // Handle end time change
  const handleEndTimeChange = (time) => {
    if (!time) return;
    setNewAppointment({
      ...newAppointment,
      end: new Date(time)
    });
  };

  // Create appointment
  const handleCreateAppointment = () => {
    const appointment = {
      ...newAppointment,
      id: Date.now() // Simple ID generation for demo
    };
    
    setAppointments([...appointments, appointment]);
    handleCloseDialog();
  };

  // Format time
  const formatTime = (date) => {
    return format(date, 'h:mm a');
  };

  // Get appointments for a specific day
  const getAppointmentsForDay = (day) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.start), day)
    );
  };

  // Render day view
  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDay(currentDate);
    
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </Typography>
        
        <Box sx={{ display: 'flex', height: 'calc(100vh - 300px)', border: '1px solid #e0e0e0' }}>
          {/* Time column */}
          <Box sx={{ width: '80px', borderRight: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}>
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
          
          {/* Appointments column */}
          <Box sx={{ flexGrow: 1, position: 'relative', overflowY: 'auto' }}>
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
            
            {/* Render appointments */}
            {dayAppointments.map(appointment => {
              const startHour = appointment.start.getHours();
              const startMinutes = appointment.start.getMinutes();
              const endHour = appointment.end.getHours();
              const endMinutes = appointment.end.getMinutes();
              
              const top = (startHour - 8) * 60 + startMinutes;
              const height = ((endHour - startHour) * 60) + (endMinutes - startMinutes);
              
              return (
                <Box
                  key={appointment.id}
                  sx={{
                    position: 'absolute',
                    top: `${top}px`,
                    left: '5px',
                    right: '5px',
                    height: `${height}px`,
                    backgroundColor: 'primary.light',
                    color: 'white',
                    borderRadius: 1,
                    p: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                    }
                  }}
                >
                  <Typography variant="subtitle2" noWrap>
                    {appointment.title}
                  </Typography>
                  <Typography variant="caption" display="block" noWrap>
                    {formatTime(appointment.start)} - {formatTime(appointment.end)}
                  </Typography>
                  <Typography variant="caption" display="block" noWrap>
                    {appointment.doctor}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  };

  // Render week view
  const renderWeekView = () => {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {format(weekStart, 'MMMM d')} - {format(weekEnd, 'MMMM d, yyyy')}
        </Typography>
        
        <Box sx={{ display: 'flex', height: 'calc(100vh - 300px)', border: '1px solid #e0e0e0' }}>
          {/* Time column */}
          <Box sx={{ width: '80px', borderRight: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}>
            <Box sx={{ height: '40px', borderBottom: '1px solid #e0e0e0' }} /> {/* Empty cell for header */}
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
          
          {/* Days columns */}
          {weekDays.map(day => (
            <Box 
              key={format(day, 'yyyy-MM-dd')} 
              sx={{ 
                flexGrow: 1, 
                borderRight: '1px solid #e0e0e0',
                position: 'relative',
                width: 0, // This forces equal width columns
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
                  color: isToday(day) ? 'white' : 'inherit'
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
                      backgroundColor: 'primary.light',
                      color: 'white',
                      borderRadius: 1,
                      p: 0.5,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                      }
                    }}
                  >
                    <Typography variant="caption" noWrap>
                      {appointment.title}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      {/* Calendar header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 500, color: 'primary.main' }}>
            Appointment Calendar
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* View toggle */}
          <ButtonGroup size="small" sx={{ mr: 2 }}>
            <Button 
              variant={view === 'day' ? 'contained' : 'outlined'} 
              onClick={() => handleViewChange('day')}
              startIcon={<TodayIcon />}
            >
              Day
            </Button>
            <Button 
              variant={view === 'week' ? 'contained' : 'outlined'} 
              onClick={() => handleViewChange('week')}
              startIcon={<ViewWeekIcon />}
            >
              Week
            </Button>
          </ButtonGroup>
          
          {/* Navigation */}
          <ButtonGroup size="small" sx={{ mr: 2 }}>
            <Button onClick={handlePrevious} startIcon={<ArrowBackIcon />}>
              Prev
            </Button>
            <Button onClick={handleToday}>
              Today
            </Button>
            <Button onClick={handleNext} endIcon={<ArrowForwardIcon />}>
              Next
            </Button>
          </ButtonGroup>
          
          {/* Add appointment button */}
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ borderRadius: 1.5 }}
          >
            New Appointment
          </Button>
        </Box>
      </Box>
      
      {/* Calendar view */}
      {view === 'day' ? renderDayView() : renderWeekView()}
      
      {/* New Appointment Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Schedule New Appointment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Patient</InputLabel>
                <Select
                  value={selectedPatient ? selectedPatient.id : ''}
                  onChange={(e) => {
                    const patient = mockPatients.find(p => p.id === e.target.value);
                    handlePatientChange(e, patient);
                  }}
                  label="Patient"
                >
                  {mockPatients.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Doctor</InputLabel>
                <Select
                  value={selectedDoctor ? selectedDoctor.id : ''}
                  onChange={(e) => {
                    const doctor = mockDoctors.find(d => d.id === e.target.value);
                    handleDoctorChange(e, doctor);
                  }}
                  label="Doctor"
                >
                  {mockDoctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {doctor.name} ({doctor.specialty})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={newAppointment.start}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Start Time"
                  value={newAppointment.start}
                  onChange={handleStartTimeChange}
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="End Time"
                  value={newAppointment.end}
                  onChange={handleEndTimeChange}
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Notes"
                multiline
                rows={3}
                fullWidth
                placeholder="Add any notes about this appointment"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateAppointment} 
            variant="contained"
            disabled={!selectedPatient || !selectedDoctor}
          >
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default AppointmentCalendar;