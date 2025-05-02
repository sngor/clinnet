// src/pages/FrontDeskDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../app/providers/AuthProvider"; // Import useAuth
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
  Container,
  Grid,
  useTheme,
  useMediaQuery
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"; // Icon for walk-in button
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
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
  const { user } = useAuth(); // Get the user object
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for walk-in modal
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  // Function to get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good morning";
    } else if (hour < 18) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  // Fetch today's appointments (using mock data)
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      try {
        // Filter mock data for example purposes, API should handle this
        setAppointments(mockAppointments);
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
      console.log(`Patient with appointment ID ${appointmentId} checked in successfully`);
    } catch (err) {
      setError(`Failed to check in: ${err.message}`);
      console.error("Check-in error:", err);
    }
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

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Greeting Section - Same as Admin Dashboard */}
      <Box 
        sx={{ 
          mb: 4,
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2
        }}
      >
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          sx={{ 
            fontWeight: 'medium',
            color: 'primary.main'
          }}
        >
          {getGreeting()}, {user?.firstName || "Front Desk"}!
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          {appointments.length} appointments scheduled for today
        </Typography>
      </Box>

      {/* Dashboard Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Paper
            elevation={0}
            sx={{ 
              p: 3, 
              display: "flex", 
              flexDirection: "column", 
              height: 180,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: 3,
                transform: "translateY(-4px)"
              }
            }}
          >
            <Box 
              sx={{ 
                position: "absolute",
                top: 10,
                right: 10,
                color: "primary.light",
                opacity: 0.15,
                transform: "scale(2.5)",
                transformOrigin: "top right"
              }}
            >
              <EventIcon fontSize="large" />
            </Box>
            <Typography 
              component="h2" 
              variant="h6" 
              color="primary.main" 
              fontWeight="medium"
            >
              Today's Appointments
            </Typography>
            <Typography 
              component="p" 
              variant="h2" 
              sx={{ 
                mt: 2, 
                mb: 2,
                fontWeight: 'bold' 
              }}
            >
              {appointments.length}
            </Typography>
            <Button 
              variant="text" 
              color="primary" 
              sx={{ 
                alignSelf: "flex-start", 
                mt: "auto",
                pl: 0,
                "&:hover": {
                  backgroundColor: "transparent",
                  textDecoration: "underline"
                }
              }}
            >
              View All
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Paper
            elevation={0}
            sx={{ 
              p: 3, 
              display: "flex", 
              flexDirection: "column", 
              height: 180,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: 3,
                transform: "translateY(-4px)"
              }
            }}
          >
            <Box 
              sx={{ 
                position: "absolute",
                top: 10,
                right: 10,
                color: "primary.light",
                opacity: 0.15,
                transform: "scale(2.5)",
                transformOrigin: "top right"
              }}
            >
              <PeopleIcon fontSize="large" />
            </Box>
            <Typography 
              component="h2" 
              variant="h6" 
              color="primary.main"
              fontWeight="medium"
            >
              Checked-In Patients
            </Typography>
            <Typography 
              component="p" 
              variant="h2" 
              sx={{ 
                mt: 2, 
                mb: 2,
                fontWeight: 'bold'
              }}
            >
              {appointments.filter(a => a.status === "Checked-in").length}
            </Typography>
            <Button 
              variant="text" 
              color="primary" 
              sx={{ 
                alignSelf: "flex-start", 
                mt: "auto",
                pl: 0,
                "&:hover": {
                  backgroundColor: "transparent",
                  textDecoration: "underline"
                }
              }}
            >
              View Patients
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Appointments List */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          mb: 3
        }}>
          <Typography 
            variant="h5" 
            color="primary.main"
            fontWeight="medium"
          >
            Today's Appointments
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleOpenWalkInModal}
            sx={{ 
              borderRadius: 1.5,
              px: 2
            }}
          >
            Add Walk-In
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

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
                    py: 2,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between'
                  }}
                >
                  <Box sx={{ mb: { xs: 2, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}>
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
                        alignSelf: { xs: 'flex-start', sm: 'center' }
                      }}
                    >
                      Check In
                    </Button>
                  )}
                </ListItem>
                {index < appointments.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
        
        {!loading && appointments.length === 0 && (
          <Typography sx={{ textAlign: 'center', py: 4 }}>
            No appointments scheduled for today
          </Typography>
        )}
      </Paper>

      {/* Temporarily commented out until WalkInFormModal is implemented 
      <WalkInFormModal
        open={isWalkInModalOpen}
        onClose={handleCloseWalkInModal}
        onSubmit={handleSubmitWalkIn}
      /> */}
    </Container>
  );
}

export default FrontDeskDashboard;