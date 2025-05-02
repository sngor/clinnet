// src/pages/FrontDeskDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"; // Icon for walk-in button
// Commented out until WalkInFormModal is implemented
// import WalkInFormModal from "../features/appointments/components/WalkInFormModal";

// Mock data for today's appointments - Replace with API call
const mockAppointments = [
  {
    id: 201,
    patientName: "Alice Brown",
    time: "09:00 AM",
    doctorName: "Dr. Smith",
    status: "Scheduled",
  },
  {
    id: 202,
    patientName: "Bob White",
    time: "09:30 AM",
    doctorName: "Dr. Jones",
    status: "Scheduled",
  },
  {
    id: 203,
    patientName: "Charlie Green",
    time: "10:00 AM",
    doctorName: "Dr. Smith",
    status: "Checked-in",
  },
  {
    id: 204,
    patientName: "David Black",
    time: "10:30 AM",
    doctorName: "Dr. Jones",
    status: "Scheduled",
  },
];

function FrontDeskDashboard() {
  // Removed useTranslation
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for walk-in modal
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  // Fetch today's appointments (using mock data)
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      try {
        // Filter mock data for example purposes, API should handle this
        setAppointments(mockAppointments);
        // Replace with:
        // fetch("/api/appointments?date=today&status=scheduled,checked-in") // Example API endpoint
        //   .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to fetch appointments')))
        //   .then(setAppointments)
        //   .catch(err => setError(`Failed to load appointments: ${err.message}`))
        setLoading(false);
      } catch (err) {
        setError(`Failed to load appointments: ${err.message}`);
        setLoading(false);
      }
    }, 500); // Simulate network delay
  }, []);

  // Handle Check-in Action
  const handleCheckIn = (appointmentId) => {
    setError(null);
    try {
      // API call would go here
      setAppointments((prevAppointments) =>
        prevAppointments.map((appt) =>
          appt.id === appointmentId ? { ...appt, status: "Checked-in" } : appt
        )
      );
      // Add a console log to confirm the function is executing
      console.log(`Patient with appointment ID ${appointmentId} checked in successfully`);
    } catch (err) {
      setError(`Failed to check in: ${err.message}`);
      console.error("Check-in error:", err);
    }

    // Example API call structure:
    /*
    fetch(`/api/appointments/${appointmentId}/checkin`, { method: 'PATCH' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to check in');
        return res.json(); // Assuming API returns the updated appointment
      })
      .then(updatedAppointment => {
        setAppointments(prev => prev.map(appt => appt.id === updatedAppointment.id ? updatedAppointment : appt));
      })
      .catch(err => {
        console.error("Check-in failed:", err);
        setError(`Check-in failed for appointment ${appointmentId}: ${err.message}`);
        // Optional: Revert local state change if API fails
      });
    */
  };

  // --- Walk-in Handlers ---
  const handleOpenWalkInModal = () => {
    setIsWalkInModalOpen(true);
  };

  const handleCloseWalkInModal = () => {
    setIsWalkInModalOpen(false);
  };

  const handleSubmitWalkIn = (formData) => {
    const sanitizedFormData = JSON.stringify(formData).replace(/[\r\n]/g, " ");
    console.log("Walk-in data submitted:", sanitizedFormData);
    setError(null);
    // --- Replace with API Call ---
    // This would typically involve:
    // 1. Maybe searching if patient exists or creating a new one.
    // 2. Creating a new appointment record with status 'Checked-in'.
    // 3. Fetching the updated appointment list or adding the new one locally.

    // Simulate adding to the list for now:
    const newWalkInAppointment = {
      ...formData,
      id: Date.now(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      doctorName: "Walk-in Dr.",
      status: "Checked-in",
    }; // Mock data
    setAppointments((prev) => [newWalkInAppointment, ...prev]); // Add to top of list
    handleCloseWalkInModal(); // Close modal on success
  };

  // Added return statement
  return (
    <Paper sx={{ 
      p: 3, 
      borderRadius: 2, 
      boxShadow: 3, 
      width: '100%',
    }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 3, // Increased margin bottom
            flexDirection: { xs: 'column', sm: 'column' }, // Stack on all screen sizes
            gap: 2, // Add gap between elements
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
            Today's Appointments
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleOpenWalkInModal}
            size="large"
            sx={{ 
              px: 3, 
              py: 1, 
              borderRadius: 2,
              minWidth: '200px'
            }}
          >
            Add Walk-In
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ width: '100%' }}>
            {appointments.map((appt, index) => (
              <React.Fragment key={appt.id}>
                <ListItem
                  sx={{ 
                    py: 2, // Add more vertical padding
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' }, // Stack on mobile, row on desktop
                    alignItems: { xs: 'center', sm: 'center' },
                    justifyContent: 'space-between'
                  }}
                >
                  <Box sx={{ mb: { xs: 2, sm: 0 }, width: { xs: '100%', sm: 'auto' }, textAlign: { xs: 'center', sm: 'left' } }}>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {appt.time} - {appt.patientName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Doctor: {appt.doctorName}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: appt.status === "Checked-in" ? "success.main" : "info.main",
                        fontWeight: 'medium'
                      }}
                    >
                      Status: {appt.status}
                    </Typography>
                  </Box>
                  
                  {appt.status === "Scheduled" && (
                    <Button
                      variant="contained"
                      size="medium"
                      onClick={() => handleCheckIn(appt.id)}
                      sx={{ 
                        minWidth: '120px',
                        alignSelf: { xs: 'center', sm: 'flex-end' }
                      }}
                    >
                      Check In
                    </Button>
                  )}
                </ListItem>
                {index < appointments.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
        {!loading && appointments.length === 0 && (
          <Typography sx={{ textAlign: 'center', py: 4 }}>No appointments scheduled for today</Typography>
        )}
      {/* Temporarily commented out until WalkInFormModal is implemented 
      <WalkInFormModal
        open={isWalkInModalOpen}
        onClose={handleCloseWalkInModal}
        onSubmit={handleSubmitWalkIn}
      /> */}
    </Paper>
  );
}

export default FrontDeskDashboard;
