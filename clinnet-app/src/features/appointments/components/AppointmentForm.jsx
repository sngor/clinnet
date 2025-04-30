// src/features/appointments/components/AppointmentForm.jsx
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Autocomplete } from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'; // Import adapter

// Placeholder data for Autocomplete
const mockPatients =;
const mockDoctors =;

function AppointmentForm() {
  const [patient, setPatient] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const = useState(null); // Use null for initial state with Day.js
  const = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // In MVP, just log the data
    console.log({
      patient: patient, // Selected patient object or null
      doctor: doctor,   // Selected doctor object or null
      dateTime: dateTime? dateTime.toISOString() : null, // Send ISO string or null
      reason: reason,
    });
    // Add logic to clear form or show success message later
    alert('Appointment data logged to console (MVP)');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}> {/* Wrap with provider */}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, p: 2, border: '1px solid grey', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Schedule New Appointment</Typography>
        <Autocomplete
          options={mockPatients}
          getOptionLabel={(option) => option.label}
          onChange={(event, newValue) => {
            setPatient(newValue);
          }}
          renderInput={(params) => <TextField {...params} label="Patient" margin="normal" required />}
        />
         <Autocomplete
          options={mockDoctors}
          getOptionLabel={(option) => option.label}
          onChange={(event, newValue) => {
            setDoctor(newValue);
          }}
          renderInput={(params) => <TextField {...params} label="Doctor" margin="normal" required />}
        />
        <DateTimePicker
          label="Appointment Date & Time"
          value={dateTime}
          onChange={(newValue) => {
             setDateTime(newValue);
          }}
          renderInput={(params) => <TextField {...params} margin="normal" fullWidth required />}
        />
        <TextField
          label="Reason for Visit"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          margin="normal"
          fullWidth
          multiline
          rows={3}
        />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Schedule Appointment (Log MVP)
        </Button>
      </Box>
    </LocalizationProvider>
  );
}

export default AppointmentForm;