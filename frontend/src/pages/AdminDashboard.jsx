// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../app/providers/AuthProvider";
// Grid import removed as DashboardGridLayout handles it.
// import Grid from "@mui/material/Grid";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PersonIcon from "@mui/icons-material/Person";

// Import UI components
import {
  PageLayout,
  ContentCard,
  AppointmentList,
  BodyText,
  DashboardGridLayout, // Added DashboardGridLayout
} from "../components/ui";
// DashboardCard import removed as it's used by DashboardGridLayout
// import DashboardCard from "../components/ui/DashboardCard";
import adminService from "../services/adminService";
import patientService from "../services/patientService";
import { getTodaysAppointments } from "../services/appointmentService";
import { getTimeBasedGreeting } from "../utils/dateUtils";

function AdminDashboard() {
  const { user } = useAuth();
  // theme and isMobile might not be needed if layout is simpler
  // const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // const navigate = useNavigate(); // Not used directly for navigation in this simplified version
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [patientsCount, setPatientsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partialErrors, setPartialErrors] = useState([]);
  const [appointmentsData, setAppointmentsData] = useState([]);

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
            usersData.users.filter((u) => u.role === "doctor").length
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
      let appointmentsApiData = []; // Renamed to avoid conflict
      try {
        appointmentsApiData = await getTodaysAppointments();
        if (!Array.isArray(appointmentsApiData)) appointmentsApiData = [];
        if (isMounted) {
          setAppointmentsCount(appointmentsApiData.length);
          setAppointmentsData(appointmentsApiData);
        }
      } catch (err) {
        errors.push("Appointments: " + (err?.message || err));
        if (isMounted) {
          setAppointmentsCount(0);
          setAppointmentsData([]);
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

  const dashboardItems = [
    {
      icon: <PeopleIcon fontSize="large" />,
      title: "Users",
      value: usersCount,
      linkText: "Manage Users",
      linkTo: "/admin/users",
      md: 3, // Equivalent to 25% width (4 items per row on medium screens)
      // itemSx: { p: 1.5 } // Padding is handled by containerSpacing in DashboardGridLayout
    },
    {
      icon: <EventIcon fontSize="large" />,
      title: "Appointments",
      value: appointmentsCount,
      linkText: "View All",
      linkTo: "/admin/appointments",
      md: 3,
      // itemSx: { p: 1.5 }
    },
    {
      icon: <PersonIcon fontSize="large" />,
      title: "Patients",
      value: patientsCount,
      linkText: "View All",
      linkTo: "/admin/patients",
      md: 3,
      // itemSx: { p: 1.5 }
    },
    {
      icon: <LocalHospitalIcon fontSize="large" />,
      title: "Doctors",
      value: doctorsCount,
      linkText: "View All",
      linkTo: "/admin/users",
      md: 3,
      // itemSx: { p: 1.5 }
    },
  ];

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
      {partialErrors.length > 0 && error && (
        <BodyText
          sx={{
            color: "error.main",
            fontWeight: 500,
            mb: 2,
            textAlign: "center",
          }}
        >
          {error}
        </BodyText>
      )}

      {/* Dashboard Summary Cards */}
      <DashboardGridLayout items={dashboardItems} containerSpacing={3} />

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
