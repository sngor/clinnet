// src/features/appointments/components/AppointmentCalendar.jsx
import React from "react";
import { Scheduler } from "@aldabil/react-scheduler";
import { Box, Typography } from "@mui/material";

// Placeholder appointments
const mockAppointments = [
  {
    event_id: 1,
    title: "Patient Checkup",
    start: new Date(),
    end: new Date(new Date().getTime() + 3600000), // 1 hour later
  },
];

function AppointmentCalendar() {
  return (
    <Box sx={{ height: "calc(100vh - 200px)" }}>
      {" "}
      {/* Adjust height as needed */}
      <Typography variant="h6" gutterBottom>
        Appointment Calendar
      </Typography>
      <Scheduler
        view="week" // Default view: week, month, day
        events={mockAppointments}
        // Add handlers for viewing/editing later (onEventClick, onConfirm, etc.)
        // Example: Disable drag/edit for MVP view-only
        editable={false}
        deletable={false}
        draggable={false}
      />
    </Box>
  );
}

export default AppointmentCalendar;
