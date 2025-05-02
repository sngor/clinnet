// src/features/appointments/components/FrontdeskAppointmentCalendar.jsx
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

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
    status: "Scheduled"
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
    status: "Checked-in"
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
    status: "Scheduled"
  }
];

function FrontdeskAppointmentCalendar() {
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
    status: "Scheduled"
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

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
      status: "Scheduled"
    });
    setSelectedPatient(null);
    setSelectedDoctor(null);
  };

  const handleCreateAppointment = () => {
    // Create a new appointment
    const appointment = {
      event_id: Date.now(), // Simple ID generation for demo
      title: `${newAppointment.patient} - Appointment`,
      start: newAppointment.start,
      end: newAppointment.end,
      doctor: newAppointment.doctor,
      doctorId: newAppointment.doctorId,
      patient: newAppointment.patient,
      patientId: newAppointment.patientId,
      status: "Scheduled"
    };

    // Add to events
    setEvents([...events, appointment]);
    handleCloseDialog();
  };

  const handleEventClick = (event) => {
    console.log("Appointment clicked:", event);
    // Here you could open a detail view or edit dialog
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, width: '100%' }}>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant="h5">
            Appointment Calendar
          </Typography>
        </Grid>
        <Grid item>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            New Appointment
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ height: "calc(100vh - 250px)" }}>
        <Scheduler
          view="week"
          events={events}
          onEventClick={handleEventClick}
          editable={true}
          deletable={true}
          draggable={true}
          hourFormat="12"
          month={{
            weekDays: [0, 1, 2, 3, 4, 5, 6],
            weekStartOn: 0,
            startHour: 8,
            endHour: 18,
          }}
          week={{
            weekDays: [0, 1, 2, 3, 4, 5, 6],
            weekStartOn: 0,
            startHour: 8,
            endHour: 18,
            step: 60
          }}
          day={{
            startHour: 8,
            endHour: 18,
            step: 60
          }}
          eventRenderer={({ event }) => {
            return (
              <Box sx={{ 
                p: 1, 
                bgcolor: event.status === "Checked-in" ? "success.light" : "primary.light",
                borderRadius: 1,
                height: '100%'
              }}>
                <Typography variant="subtitle2" noWrap>{event.title}</Typography>
                <Typography variant="caption" display="block">{event.doctor}</Typography>
                <Typography variant="caption" display="block">Status: {event.status}</Typography>
              </Box>
            );
          }}
        />
      </Box>

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
    </Paper>
  );
}

export default FrontdeskAppointmentCalendar;