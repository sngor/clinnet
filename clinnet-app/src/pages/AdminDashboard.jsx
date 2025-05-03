// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../app/providers/AuthProvider";
import { 
  Grid, 
  Paper, 
  Typography, 
  useMediaQuery, 
  useTheme, 
  Box, 
  Button,
  Container,
  Stack,
  CircularProgress,
  List,
  ListItem,
  Divider,
  Chip
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import { useNavigate } from "react-router-dom";
import LinkButton from "../components/LinkButton";
import { PageHeaderWithDivider } from "../components/PageHeader";

// Mock data for today's appointments
const mockAppointments = [
  {
    id: 201,
    patientName: "Alice Brown",
    time: "09:00 AM",
    doctorName: "Dr. Smith",
    status: "Scheduled",
    type: "Checkup"
  },
  {
    id: 202,
    patientName: "Bob White",
    time: "09:30 AM",
    doctorName: "Dr. Jones",
    status: "Checked-in",
    type: "Follow-up"
  },
  {
    id: 203,
    patientName: "Charlie Green",
    time: "10:00 AM",
    doctorName: "Dr. Smith",
    status: "In Progress",
    type: "Consultation"
  }
];

function AdminDashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setAppointments(mockAppointments);
        setLoading(false);
      } catch (err) {
        setError(`Failed to load appointments: ${err.message}`);
        setLoading(false);
      }
    }, 500); // Simulate network delay
  }, []);

  // Get status color
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

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Use the PageHeaderWithDivider component for the dashboard */}
      <PageHeaderWithDivider 
        title={`${getGreeting()}, ${user?.firstName || user?.username || "Admin"}!`}
        subtitle="Here's what's happening in your clinic today"
      />

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
              <PeopleIcon fontSize="large" />
            </Box>
            <Typography 
              component="h2" 
              variant="h6" 
              color="primary.main" 
              fontWeight="medium"
            >
              Total Users
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
              4
            </Typography>
            <LinkButton 
              to="/admin/users"
              sx={{ 
                alignSelf: "flex-start", 
                mt: "auto",
                pl: 0
              }}
            >
              Manage Users
            </LinkButton>
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
            <LinkButton 
              to="/admin/appointments"
              sx={{ 
                alignSelf: "flex-start", 
                mt: "auto",
                pl: 0
              }}
            >
              View All
            </LinkButton>
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
        <Typography 
          variant="h5" 
          color="primary.main"
          fontWeight="medium"
          sx={{ mb: 3 }}
        >
          Recent Appointments
        </Typography>

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
                    <Typography variant="body2" color="text.secondary">
                      Type: {appt.type}
                    </Typography>
                  </Box>
                  
                  <Chip 
                    label={appt.status} 
                    color={getStatusColor(appt.status)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
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
    </Container>
  );
}

export default AdminDashboard;