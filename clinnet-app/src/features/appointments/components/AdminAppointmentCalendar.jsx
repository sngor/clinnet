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
    id: 1,
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
    id: 2,
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
    id: 3,
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
    const title = `${newAppointment.patient} - ${newAppointment.appointmentType || "Appointment"}`;
    
    const appointment = {
      ...newAppointment,
      id: Date.now(), // Simple ID generation
      title
    };
    
    setAppointments([...appointments, appointment]);
    handleCloseDialog();
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

      <Box sx={{ height: 600, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          Calendar view placeholder - @aldabil/react-scheduler removed due to compatibility issues with date-fns
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Upcoming Appointments</Typography>
          {appointments.map(appointment => (
            <Paper key={appointment.id} sx={{ p: 2, mb: 2, borderLeft: 4, borderColor: 'primary.main' }}>
              <Typography variant="subtitle1">{appointment.title}</Typography>
              <Typography variant="body2">
                {appointment.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                {appointment.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Typography>
              <Typography variant="body2">Doctor: {appointment.doctor}</Typography>
              <Typography variant="body2">Status: {appointment.status}</Typography>
            </Paper>
          ))}
        </Box>
      </Box>

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
                  value={newAppointment.appointmentType || ""}
                  label="Appointment Type"
                  onChange={(e) => setNewAppointment({
                    ...newAppointment,
                    appointmentType: e.target.value
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