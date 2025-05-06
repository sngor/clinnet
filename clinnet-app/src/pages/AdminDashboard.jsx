// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../app/providers/AuthProvider";
import { 
  Grid, 
  Container,
  useMediaQuery, 
  useTheme
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import { PageHeaderWithDivider } from "../components/PageHeader";
import DashboardCard from "../components/DashboardCard";
import AppointmentList from "../components/AppointmentList";

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

  // Using the shared getStatusColor function from UI components

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
      <AppointmentList
        appointments={appointments}
        loading={loading}
        title="Recent Appointments"
        emptyMessage="No appointments scheduled for today."
      />
    </Container>
  );
}

export default AdminDashboard;