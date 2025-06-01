// src/components/patients/AppointmentsTab.jsx
import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { format, parseISO } from "date-fns"; // Added parseISO
import EmptyState from "../ui/EmptyState";
import appointmentService from "../../services/appointmentService"; // Corrected path


function AppointmentsTab({ patientId }) {
  // Safety check for missing patientId
  if (!patientId) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1">
          Cannot load appointments: Patient ID is not available.
        </Typography>
      </Box>
    );
  }

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch appointments for this patient
  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      // Error or empty state is already handled by the initial check
      return;
    }

    let isMounted = true;
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await appointmentService.getAppointmentsByPatient(patientId);
        if (isMounted) {
          // Assuming data is an array of appointments
          // And each appointment has: id, appointmentDate, time (or appointmentTime), doctorName, type, status
          setAppointments(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load appointments.");
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
  }, [patientId]);

  // Get color for status chip
  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "primary";
      case "Completed":
        return "success";
      case "Cancelled":
        return "error";
      case "No-show":
        return "warning";
      default:
        return "default";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      // Prefer parseISO for ISO 8601 strings, fallback to new Date for other formats
      const date = parseISO(dateString);
      // Check if date is valid after parsing
      if (isNaN(date.getTime())) {
          // Attempt direct parsing if parseISO fails (e.g. for "MM/DD/YYYY" or other non-ISO formats)
          const directDate = new Date(dateString);
          if (isNaN(directDate.getTime())) return dateString; // Return original if still invalid
          return format(directDate, "MMM dd, yyyy");
      }
      return format(date, "MMM dd, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; // Return original string if formatting fails
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">Patient Appointments</Typography>
        <Button variant="contained" startIcon={<AddIcon />} size="small">
          Schedule Appointment
        </Button>
      </Box>

      {appointments.length > 0 ? (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{formatDate(appointment.appointmentDate || appointment.date)}</TableCell>
                  <TableCell>{appointment.time || appointment.appointmentTime || "N/A"}</TableCell>
                  <TableCell>{appointment.doctorName || appointment.doctor || "N/A"}</TableCell>
                  <TableCell>{appointment.type || appointment.serviceName || "N/A"}</TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.status || "N/A"}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <EmptyState
          title="No Appointments Found"
          description="No appointments found for this patient."
        />
      )}
    </Box>
  );
}

export default AppointmentsTab;
