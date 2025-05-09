// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../app/providers/AuthProvider";
import { 
  Grid, 
  useMediaQuery, 
  useTheme, 
  Container
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";

// Import UI components
import { 
  PageHeading, 
  ContentCard, 
  AppointmentList
} from "../components/ui";
import DashboardCard from "../components/DashboardCard";

// Import mock data from centralized location
import { mockTodayAppointments as mockAppointments } from "../mock/mockAppointments";
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
      {/* Page header */}
      <PageHeading 
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
      <ContentCard
        title="Recent Appointments"
        elevation={0}
        sx={{ 
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <AppointmentList 
          appointments={appointments}
          loading={loading}
          showAction={false}
        />
      </ContentCard>
    </Container>
  );
}

export default AdminDashboard;