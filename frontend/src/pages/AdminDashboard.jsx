// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../app/providers/AuthProvider";
import { useMediaQuery, useTheme } from "@mui/material";
import adminService from "../services/adminService";
import patientService from "../services/patientService";
import { getTodaysAppointments } from "../services/appointmentService";
import Grid from "@mui/material/Grid"; // Updated Grid import
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";

// Import UI components
import {
  PageLayout, // Added PageLayout
  ContentCard,
  AppointmentList,
  // PageContainer, // Removed PageContainer
  // PageHeading, // Removed PageHeading
} from "../components/ui";
import DashboardCard from "../components/DashboardCard";

// Import mock data from centralized location
// import { mockTodayAppointments as mockAppointments } from "../mock/mockAppointments";
import { getTimeBasedGreeting } from "../utils/dateUtils";

function AdminDashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [patientsCount, setPatientsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const usersData = await adminService.listUsers();
        setUsersCount(usersData.length);
        setDoctorsCount(
          usersData.filter((user) => user.role === "doctor").length
        );

        const patientsData = await patientService.getPatients();
        setPatientsCount(patientsData.length);

        const appointmentsData = await getTodaysAppointments();
        setAppointmentsCount(appointmentsData.length);

        setLoading(false);
      } catch (err) {
        setError(`Failed to load dashboard data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <PageLayout
      title={`${getTimeBasedGreeting()}, ${
        user?.firstName || user?.username || "Admin"
      }!`}
      subtitle="Here's what's happening in your clinic today"
      loading={loading}
      error={error}
      // maxWidth="lg" // Default is lg, so this is optional unless a different size is needed
    >
      {/* Dashboard Summary Cards */}
      <Grid
        container
        spacing={0} // Set to 0 as we're handling spacing with the child Grid sx props
        sx={{ mb: 4 }}
      >
        <Grid sx={{ width: { xs: "100%", sm: "50%", md: "25%" }, p: 1.5 }}>
          <DashboardCard
            icon={<PeopleIcon fontSize="large" />}
            title="Users"
            value={usersCount}
            linkText="Manage Users"
            linkTo="/admin/users"
          />
        </Grid>

        <Grid sx={{ width: { xs: "100%", sm: "50%", md: "25%" }, p: 1.5 }}>
          <DashboardCard
            icon={<EventIcon fontSize="large" />}
            title="Appointments"
            value={appointmentsCount}
            linkText="View All"
            linkTo="/admin/appointments"
          />
        </Grid>

        <Grid sx={{ width: { xs: "100%", sm: "50%", md: "25%" }, p: 1.5 }}>
          <DashboardCard
            icon={<PersonIcon fontSize="large" />}
            title="Patients"
            value={patientsCount}
            linkText="View All"
            linkTo="/admin/patients"
          />
        </Grid>

        <Grid sx={{ width: { xs: "100%", sm: "50%", md: "25%" }, p: 1.5 }}>
          <DashboardCard
            icon={<LocalHospitalIcon fontSize="large" />}
            title="Doctors"
            value={doctorsCount}
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
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <AppointmentList
          appointments={[]} // Replace with actual appointments if fetched
          // loading={loading} // PageLayout now handles top-level loading state
          showAction={false}
        />
      </ContentCard>
    </PageLayout>
  );
}

export default AdminDashboard;
