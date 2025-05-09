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
  Container,
  CircularProgress,
  List,
  ListItem,
  Divider,
  Chip
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import { PageHeaderWithDivider } from "../components/PageHeader";
import DashboardCard from "../components/DashboardCard";

// Import mock data from centralized location
import { mockTodayAppointments as mockAppointments, getAppointmentStatusColor } from "../mock/mockAppointments";
import { getTimeBasedGreeting } from "../utils/dateUtils";

function AdminDashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Use the PageHeaderWithDivider component for the dashboard */}
      <PageHeaderWithDivider 
        title={`${getTimeBasedGreeting()}, ${user?.firstName || user?.username || "Admin"}!`}
        subtitle="Here's what's happening in your clinic today"
      />

      {/* Dashboard Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <DashboardCard 
            icon={<PeopleIcon fontSize="large" />}
            title="Users"
            value={4}
            linkText="Manage Users"
            linkTo="/admin/users"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <DashboardCard 
            icon={<EventIcon fontSize="large" />}
            title="Appointments"
            value={appointments.length}
            linkText="View All"
            linkTo="/admin/appointments"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <DashboardCard 
            icon={<PersonIcon fontSize="large" />}
            title="Patients"
            value={6} // Mock value
            linkText="View All"
            linkTo="/admin/patients"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <DashboardCard 
            icon={<LocalHospitalIcon fontSize="large" />}
            title="Doctors"
            value={4}
            linkText="View All"
            linkTo="/admin/users"
          />
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
                    color={getAppointmentStatusColor(appt.status)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </ListItem>
                {index < appointments.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
}

export default AdminDashboard;