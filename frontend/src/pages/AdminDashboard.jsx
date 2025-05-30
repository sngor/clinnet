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
  const [partialErrors, setPartialErrors] = useState([]);
  const [appointmentsData, setAppointmentsData] = useState([]); // <-- Add this line

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      const errors = [];
      // Users
      let usersData = [];
      try {
        usersData = await adminService.listUsers();
        if (!Array.isArray(usersData.users)) usersData.users = [];
        if (isMounted) {
          setUsersCount(usersData.users.length);
          setDoctorsCount(
            usersData.users.filter((user) => user.role === "doctor").length
          );
        }
      } catch (err) {
        errors.push("Users: " + (err?.message || err));
        if (isMounted) {
          setUsersCount(0);
          setDoctorsCount(0);
        }
      }
      // Patients
      let patientsData = [];
      try {
        patientsData = await patientService.getPatients();
        if (!Array.isArray(patientsData)) patientsData = [];
        if (isMounted) setPatientsCount(patientsData.length);
      } catch (err) {
        errors.push("Patients: " + (err?.message || err));
        if (isMounted) setPatientsCount(0);
      }
      // Appointments
      let appointmentsData = [];
      try {
        appointmentsData = await getTodaysAppointments();
        if (!Array.isArray(appointmentsData)) appointmentsData = [];
        if (isMounted) {
          setAppointmentsCount(appointmentsData.length);
          setAppointmentsData(appointmentsData); // <-- Add this line
        }
      } catch (err) {
        errors.push("Appointments: " + (err?.message || err));
        if (isMounted) {
          setAppointmentsCount(0);
          setAppointmentsData([]); // <-- Add this line
        }
      }
      if (isMounted) {
        setPartialErrors(errors);
        setLoading(false);
        setError(
          errors.length > 0
            ? `Some data failed to load: ${errors.join("; ")}`
            : null
        );
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PageLayout
      title={`${getTimeBasedGreeting()}, ${
        user?.firstName || user?.username || "Admin"
      }!`}
      subtitle="Here's what's happening in your clinic today"
      loading={loading}
      error={null} // Don't block UI with error
    >
      {/* Show error as a warning if partialErrors exist */}
      {partialErrors.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: "#b71c1c", fontWeight: 500 }}>{error}</div>
        </div>
      )}
      {/* Dashboard Summary Cards */}
      <Grid container spacing={0} sx={{ mb: 4 }}>
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
          appointments={Array.isArray(appointmentsData) ? appointmentsData : []}
          showAction={false}
        />
      </ContentCard>
    </PageLayout>
  );
}

export default AdminDashboard;
