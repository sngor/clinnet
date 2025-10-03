// src/pages/PatientDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../app/providers/AuthProvider";
import { useMediaQuery, useTheme } from "@mui/material";
import patientService from "../services/patientService";
import { getTodaysAppointments } from "../services/appointmentService";
import Grid from "@mui/material/Grid"; // Updated Grid import
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";

// Import UI components
import {
  DashboardPageLayout,
  ContentCard,
  AppointmentList,
  BodyText,
} from "../components/ui";
import DashboardCard from "../components/ui/DashboardCard"; // Updated path
// Removed BannerWarning - moved to Settings page

// Import mock data from centralized location
// import { mockTodayAppointments as mockAppointments } from "../mock/mockAppointments";
import { getTimeBasedGreeting } from "../utils/dateUtils";

function PatientDashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [appointmentsCount, setAppointmentsCount] = useState(0);
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
    <DashboardPageLayout
      title="Patient Dashboard"
      subtitle="View your appointments and health information"
      loading={loading}
      error={null} // Don't block UI with error
    >
      {/* Error alerts moved to Settings page */}
      {/* Dashboard Summary Cards */}
      <Grid container spacing={0} sx={{ mb: 4 }}>
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
            icon={<EventIcon fontSize="large" />}
            title="Appointments"
            value={appointmentsCount}
            linkText="View All"
            linkTo="/admin/appointments"
          />
        </Grid>
      </Grid>
      {/* Appointments List */}
      <ContentCard
        title="Recent Appointments"
        elevation={0}
        sx={{
          border: "none", // Remove outer border
          borderColor: undefined,
        }}
      >
        <AppointmentList
          appointments={Array.isArray(appointmentsData) ? appointmentsData : []}
          showAction={false}
        />
      </ContentCard>
    </DashboardPageLayout>
  );
}

export default PatientDashboard;
