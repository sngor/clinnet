// src/features/appointments/components/AdminAppointmentCalendar.jsx
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
  Tabs,
  Tab
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from 'date-fns';

// Mock data for doctors
const mockDoctors = [
  { id: 1, name: "Dr. Smith", specialty: "General Medicine" },
  { id: 2, name: "Dr. Jones", specialty: "Cardiology" },
  { id: 3, name: "Dr. Wilson", specialty: "Pediatrics" },
  { id: 4, name: "Dr. Taylor", specialty: "Dermatology" }
];

// Mock data for patients
const mockPatients = [
  { id: 101, name: "Alice Brown" },
  { id: 102, name: "Bob White" },
  { id: 103, name: "Charlie Green" },
  { id: 104, name: "David Black" },
  { id: 105, name: "Eva Gray" }
];

// Placeholder appointments
const mockAppointments = [
  {
    id: 1,
    title: "Alice Brown - Checkup",
    start: new Date(new Date().setHours(9, 0, 0, 0)),
    end: new Date(new Date().setHours(10, 0, 0, 0)),
    doctor: "Dr. Smith",
    doctorId: 1,
    patient: "Alice Brown",
    patientId: 101,
    status: "Scheduled",
    type: "Checkup"
  },
  {
    id: 2,
    title: "Bob White - Consultation",
    start: new Date(new Date().setHours(11, 0, 0, 0)),
    end: new Date(new Date().setHours(12, 0, 0, 0)),
    doctor: "Dr. Jones",
    doctorId: 2,
    patient: "Bob White",
    patientId: 102,
    status: "Checked-in",
    type: "Consultation"
  },
  {
    id: 3,
    title: "Charlie Green - Follow-up",
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(15, 0, 0, 0)),
    doctor: "Dr. Smith",
    doctorId: 1,
    patient: "Charlie Green",
    patientId: 103,
    status: "Scheduled",
    type: "Follow-up"
  },
  {
    id: 4,
    title: "David Black - Checkup",
    start: addDays(new Date(new Date().setHours(10, 0, 0, 0)), 1),
    end: addDays(new Date(new Date().setHours(11, 0, 0, 0)), 1),
    doctor: "Dr. Wilson",
    doctorId: 3,
    patient: "David Black",
    patientId: 104,
    status: "Scheduled",
    type: "Checkup"
  },
  {
    id: 5,
    title: "Eva Gray - Consultation",
    start: addDays(new Date(new Date().setHours(13, 30, 0, 0)), 2),
    end: addDays(new Date(new Date().setHours(14, 30, 0, 0)), 2),
    doctor: "Dr. Taylor",
    doctorId: 4,
    patient: "Eva Gray",
    patientId: 105,
    status: "Scheduled",
    type: "Consultation"
  }
];

// Time slots for the calendar
const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

function AdminAppointmentCalendar() {
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

  // Get current week dates
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

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

  const handleDateChange = (field, date) => {
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
        patient: value.name,
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

  // Format time
  const formatTime = (date) => {
    return format(date, 'h:mm a');
  };

  // Render week view calendar
  const renderWeekCalendar = () => {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {format(weekStart, 'MMMM d')} - {format(weekEnd, 'MMMM d, yyyy')}
        </Typography>
        
        <Box sx={{ display: 'flex', height: 'calc(100vh - 350px)', border: '1px solid #e0e0e0' }}>
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
                      backgroundColor: getStatusColor(appointment.status) + '.light',
                      color: 'white',
                      borderRadius: 1,
                      p: 0.5,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: getStatusColor(appointment.status) + '.main',
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
    );
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6">Appointment Calendar</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          New Appointment
        </Button>
      </Box>

      {/* View toggle and doctor filter */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Tabs value={viewMode} onChange={(e, newValue) => setViewMode(newValue)}>
              <Tab value="calendar" label="Calendar View" />
              <Tab value="list" label="List View" />
            </Tabs>
          </Grid>
          <Grid item xs />
          <Grid item>
            <FormControl sx={{ minWidth: 200 }}>
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
          </Grid>
        </Grid>
      </Box>

      {/* Calendar View */}
      {viewMode === 'calendar' && renderWeekCalendar()}

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
                            borderColor: getStatusColor(appointment.status) + '.main' 
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle1">
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
                                Type: {appointment.type || "General"}
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
                getOptionLabel={(option) => option.name}
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
                  
                  handleDateChange('start', date);
                  handleDateChange('end', endDate);
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
                  
                  handleDateChange('start', startDate);
                  handleDateChange('end', endDate);
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

export default AdminAppointmentCalendar;