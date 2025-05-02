// src/features/appointments/components/AppointmentForm.jsx
import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Autocomplete,
} from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"; // Import adapter

// Placeholder data for Autocomplete
const mockPatients = [
  { id: 1, label: "John Doe" },
  { id: 2, label: "Jane Smith" },
];
const mockDoctors = [
  { id: 1, label: "Dr. Alice Johnson" },
  { id: 2, label: "Dr. Bob Williams" },
];

function AppointmentForm() {
  const [patient, setPatient] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [dateTime, setDateTime] = useState(null); // Use null for initial state with Day.js
  const [reason, setReason] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    // In MVP, just log the data
    console.log({
      patient: patient, // Selected patient object or null
      doctor: doctor, // Selected doctor object or null
      dateTime: dateTime ? dateTime.toISOString() : null, // Send ISO string or null
      reason: reason,
    });
    // Add logic to clear form or show success message later
    alert("Appointment data logged to console (MVP)");
  };
  // Import the useTranslation hook from react-i18next
  // This hook is used for internationalization of component labels
  import { useTranslation } from "react-i18next";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {" "}
      {/* Wrap with provider */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ mt: 1, p: 2, border: "1px solid grey", borderRadius: 1 }}
      >
        <Typography variant="h6" gutterBottom>
          {t("scheduleNewAppointment")}
        </Typography>
        <Autocomplete
          options={mockPatients}
          getOptionLabel={(option) => option.label}
          onChange={(event, newValue) => {
            setPatient(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("patient")}
              margin="normal"
              required
            />
          )}
        />
        <Autocomplete
          options={mockDoctors}
          getOptionLabel={(option) => option.label}
          onChange={(event, newValue) => {
            setDoctor(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("doctor")}
              margin="normal"
              required
            />
          )}
        />
        <DateTimePicker
          label={t("appointmentDateTime")}
          value={dateTime}
          onChange={(newValue) => {
            setDateTime(newValue);
          }}
          renderInput={(params) => (
            <TextField {...params} margin="normal" fullWidth required />
          )}
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
