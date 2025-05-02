// src/features/appointments/components/AppointmentManagement.jsx
import React, { useState } from "react";
import { Scheduler } from "@aldabil/react-scheduler";
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
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Autocomplete,
  useMediaQuery,
  useTheme
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from "../../../app/providers/AuthProvider";

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
    event_id: 1,
    title: "Alice Brown - Checkup",
    start: new Date(new Date().setHours(9, 0, 0, 0)),
    end: new Date(new Date().setHours(10, 0, 0, 0)),
    doctor: "Dr. Smith",
    patient: "Alice Brown",
    patientId: 101,
    doctorId: 1,
    status: "Scheduled",
    type: "Checkup"
  },
  {
    event_id: 2,
    title: "Bob White - Consultation",
    start: new Date(new Date().setHours(11, 0, 0, 0)),
    end: new Date(new Date().setHours(12, 0, 0, 0)),
    doctor: "Dr. Jones",
    patient: "Bob White",
    patientId: 102,
    doctorId: 2,
    status: "Checked-in",
    type: "Follow-up"
  },
  {
    event_id: 3,
    title: "Charlie Green - Follow-up",
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(15, 0, 0, 0)),
    doctor: "Dr. Smith",
    patient: "Charlie Green",
    patientId: 103,
    doctorId: 1,
    status: "Scheduled",
    type: "Consultation"
  },
  {
    event_id: 4,
    title: "David Black - New Patient",
    start: new Date(new Date().setHours(15, 30, 0, 0)),
    end: new Date(new Date().setHours(16, 30, 0, 0)),
    doctor: "Dr. Jones",
    patient: "David Black",
    patientId: 104,
    doctorId: 2,
    status: "Scheduled",
    type: "New Patient"
  }
];

// Today's appointments (for card view)
const todaysAppointments = mockAppointments.map(appt => ({
  id: appt.event_id,
  patientName: appt.patient,
  time: appt.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
  doctorName: appt.doctor,
  status: appt.status,
  type: appt.type
}));

function AppointmentManagement() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [tabValue, setTabValue] = useState(0);
  const [events, setEvents] = useState(mockAppointments);
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

  // For doctor role, filter appointments to only show their own
  const filteredEvents = user?.role === 'doctor' 
    ? events.filter(event => event.doctor === `Dr. ${user.lastName}` || event.doctorId === user.id)
    : events;

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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

  const handleCreateAppointment = () => {
    // Create a new appointment
    const appointment = {
      event_id: Date.now(), // Simple ID generation for demo
      title: `${newAppointment.patient} - ${newAppointment.type || 'Appointment'}`,
      start: newAppointment.start,
      end: newAppointment.end,
      doctor: newAppointment.doctor,
      doctorId: newAppointment.doctorId,
      patient: newAppointment.patient,
      patientId: newAppointment.patientId,
      status: "Scheduled",
      type: newAppointment.type || "Appointment"
    };

    // Add to events
    setEvents([...events, appointment]);
    handleCloseDialog();
  };

  const handleEventClick = (event) => {
    console.log("Appointment clicked:", event);
    // Here you could open a detail view or edit dialog
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

  // Determine if the user can edit appointments
  const canEdit = user?.role === 'admin' || user?.role === 'frontdesk';

  return (
    <Box sx={{ height: '100%' }}>
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
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, width: '100%', height: 'calc(100vh - 200px)' }}>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs>
              <Typography variant="h5">
                Appointment Calendar
              </Typography>
            </Grid>
            {canEdit && (
              <Grid item>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleOpenDialog}
                >
                  New Appointment
                </Button>
              </Grid>
            )}
          </Grid>

          <Box sx={{ height: "calc(100vh - 280px)" }}>
            <Scheduler
              view="week"
              events={filteredEvents}
              onEventClick={handleEventClick}
              editable={canEdit}
              deletable={canEdit}
              draggable={canEdit}
              hourFormat="12"
              month={{
                weekDays: [0, 1, 2, 3, 4, 5, 6],
                weekStartOn: 0,
                startHour: 8,
                endHour: 18,
                cellHeight: 80 // Increase cell height for month view
              }}
              week={{
                weekDays: [0, 1, 2, 3, 4, 5, 6],
                weekStartOn: 0,
                startHour: 8,
                endHour: 18,
                step: 60,
                cellHeight: 80 // Increase cell height for week view
              }}
              day={{
                startHour: 8,
                endHour: 18,
                step: 60,
                cellHeight: 80 // Increase cell height for day view
              }}
              eventRenderer={({ event }) => {
                return (
                  <Box sx={{ 
                    p: 1.5, // Increased padding
                    bgcolor: event.status === "Checked-in" ? "success.light" : "primary.light",
                    borderRadius: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 'medium',
                        fontSize: '0.95rem',
                        mb: 0.5
                      }}
                    >
                      {event.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.85rem',
                        mb: 0.5
                      }}
                    >
                      {event.doctor}
                    </Typography>
                    <Chip 
                      label={event.status} 
                      color={getStatusColor(event.status)}
                      size="small"
                      sx={{ 
                        alignSelf: 'flex-start',
                        height: 24,
                        '& .MuiChip-label': { 
                          px: 1,
                          fontSize: '0.75rem'
                        }
                      }}
                    />
                  </Box>
                );
              }}
              resourceFields={{
                idField: 'doctorId',
                textField: 'doctor',
                subTextField: 'specialty',
                avatarField: 'avatar',
                colorField: 'color'
              }}
              resourceViewMode="tabs"
              resources={mockDoctors.map(doctor => ({
                doctorId: doctor.id,
                doctor: doctor.name,
                specialty: doctor.specialty,
                color: doctor.id % 2 === 0 ? '#1976d2' : '#2196f3'
              }))}
            />
          </Box>
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, width: '100%', minHeight: 'calc(100vh - 200px)' }}>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs>
              <Typography variant="h5">
                Today's Appointments
              </Typography>
            </Grid>
            {canEdit && (
              <Grid item>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleOpenDialog}
                >
                  New Appointment
                </Button>
              </Grid>
            )}
          </Grid>
          
          <Grid container spacing={3}>
            {todaysAppointments
              .filter(appointment => 
                user?.role !== 'doctor' || appointment.doctorName === `Dr. ${user.lastName}`)
              .map((appointment) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={appointment.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      borderLeft: 5, 
                      borderColor: `${getStatusColor(appointment.status)}.main`,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'medium' }}>
                          {appointment.time}
                        </Typography>
                        <Chip 
                          label={appointment.status} 
                          color={getStatusColor(appointment.status)}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
                        {appointment.patientName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
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

      {/* New Appointment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule New Appointment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={mockPatients}
                getOptionLabel={(option) => option.name}
                value={selectedPatient}
                onChange={(event, newValue) => {
                  setSelectedPatient(newValue);
                  if (newValue) {
                    setNewAppointment({
                      ...newAppointment,
                      patient: newValue.name,
                      patientId: newValue.id
                    });
                  }
                }}
                renderInput={(params) => <TextField {...params} label="Patient" required />}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                options={mockDoctors}
                getOptionLabel={(option) => `${option.name} (${option.specialty})`}
                value={selectedDoctor}
                onChange={(event, newValue) => {
                  setSelectedDoctor(newValue);
                  if (newValue) {
                    setNewAppointment({
                      ...newAppointment,
                      doctor: newValue.name,
                      doctorId: newValue.id
                    });
                  }
                }}
                renderInput={(params) => <TextField {...params} label="Doctor" required />}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Appointment Type"
                fullWidth
                value={newAppointment.type}
                onChange={(e) => setNewAppointment({...newAppointment, type: e.target.value})}
                placeholder="e.g., Checkup, Follow-up, Consultation"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={newAppointment.start.toISOString().split('T')[0]}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  const startTime = new Date(newAppointment.start);
                  const endTime = new Date(newAppointment.end);
                  
                  date.setHours(startTime.getHours(), startTime.getMinutes());
                  const newStart = new Date(date);
                  
                  const newEnd = new Date(date);
                  newEnd.setHours(endTime.getHours(), endTime.getMinutes());
                  
                  setNewAppointment({
                    ...newAppointment,
                    start: newStart,
                    end: newEnd
                  });
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Start Time"
                type="time"
                fullWidth
                value={`${String(newAppointment.start.getHours()).padStart(2, '0')}:${String(newAppointment.start.getMinutes()).padStart(2, '0')}`}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':').map(Number);
                  const newStart = new Date(newAppointment.start);
                  newStart.setHours(hours, minutes);
                  
                  // Ensure end time is at least 30 minutes after start time
                  const newEnd = new Date(newStart);
                  newEnd.setMinutes(newEnd.getMinutes() + 30);
                  
                  setNewAppointment({
                    ...newAppointment,
                    start: newStart,
                    end: newEnd
                  });
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="End Time"
                type="time"
                fullWidth
                value={`${String(newAppointment.end.getHours()).padStart(2, '0')}:${String(newAppointment.end.getMinutes()).padStart(2, '0')}`}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':').map(Number);
                  const newEnd = new Date(newAppointment.end);
                  newEnd.setHours(hours, minutes);
                  setNewAppointment({
                    ...newAppointment,
                    end: newEnd
                  });
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                multiline
                rows={3}
                fullWidth
                placeholder="Add any additional notes about the appointment"
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
    </Box>
  );
}

export default AppointmentManagement;