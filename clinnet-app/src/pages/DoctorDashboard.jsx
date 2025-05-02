// src/pages/DoctorDashboard.jsx
import React from "react";
import { useAuth } from "../app/providers/AuthProvider"; // Import useAuth
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Container,
  useTheme,
  useMediaQuery,
  Button
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EventIcon from "@mui/icons-material/Event";
import EmailIcon from "@mui/icons-material/Email";
import PeopleIcon from "@mui/icons-material/People";
import AppointmentAgenda from "../features/appointments/components/AppointmentAgenda";

function DoctorDashboard() {
  const { user } = useAuth(); // Get the user object
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

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

  // Navigation handlers
  const handleNavigateToAppointments = () => {
    navigate("/doctor/appointments");
  };

  const handleNavigateToPatients = () => {
    navigate("/doctor/patients");
  };

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Greeting Section */}
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
          {getGreeting()}, Dr. {user?.lastName || user?.firstName || "Doctor"}!
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          You have 5 appointments scheduled for today
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
              5
            </Typography>
            <Button 
              variant="text" 
              color="primary" 
              onClick={handleNavigateToAppointments}
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
              View Schedule
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
              Active Patients
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
              24
            </Typography>
            <Button 
              variant="text" 
              color="primary" 
              onClick={handleNavigateToPatients}
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
              <EmailIcon fontSize="large" />
            </Box>
            <Typography 
              component="h2" 
              variant="h6" 
              color="primary.main"
              fontWeight="medium"
            >
              Unread Messages
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
              2
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
              View Messages
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Appointment Agenda */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%'
            }}
          >
            <AppointmentAgenda />
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%'
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom
              color="primary.main"
              fontWeight="medium"
              sx={{ mb: 2 }}
            >
              Recent Patients
            </Typography>
            <Typography variant="body1">
              Recent patient list will be displayed here.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default DoctorDashboard;