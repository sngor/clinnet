// src/pages/DoctorDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../app/providers/AuthProvider";
import { Grid, useMediaQuery, useTheme } from "@mui/material";
import { getAppointmentsByDoctor } from "../services/appointmentService";
import patientService from "../services/patientService";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import AssignmentIcon from "@mui/icons-material/Assignment";
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
// import { mockTodayAppointments as mockAppointments } from "../mock/mockAppointments"; // Removed
import { getTimeBasedGreeting } from "../utils/dateUtils";

// Mock data for doctor's patients - Removed
// const mockPatients = [
//   { id: 1, name: "John Doe", lastVisit: "2023-11-20" },
//   { id: 2, name: "Jane Smith", lastVisit: "2023-10-05" },
//   { id: 3, name: "Michael Johnson", lastVisit: "2023-09-20" },
//   { id: 4, name: "Emily Williams", lastVisit: "2023-11-25" },
// ];

function DoctorDashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [todaysAppointmentsCount, setTodaysAppointmentsCount] = useState(0);
  const [assignedPatientsCount, setAssignedPatientsCount] = useState(0);
  const [doctorAppointments, setDoctorAppointments] = useState([]); // To store all appointments for the list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data
  useEffect(() => {
    if (!user || !user.username) {
      setLoading(false);
      setError("User details not available.");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const doctorId = user.username;

        // Fetch appointments
        const appointmentsData = await getAppointmentsByDoctor(doctorId);
        setDoctorAppointments(appointmentsData); // Store all appointments for the list

        const today = new Date().toISOString().split("T")[0];
        const todayAppointments = appointmentsData.filter(
          (appt) => appt.appointmentDate.split("T")[0] === today
        );
        setTodaysAppointmentsCount(todayAppointments.length);

        // Fetch patients
        const patientsData = await patientService.getPatients();
        let count = 0;
        // Attempt to filter patients: Iterate through the fetched patients.
        // If a patient object has a field like `doctorId` or `primaryDoctorId` that matches `user.username`, count it.
        // If no such field exists, set patient count to 0 and note this limitation.
        // This is a placeholder, actual field name might differ.
        // console.log("All patients data:", patientsData); // For debugging
        patientsData.forEach((patient) => {
          if (
            patient.primaryDoctorId === doctorId ||
            patient.doctorId === doctorId
          ) {
            count++;
          }
        });
        setAssignedPatientsCount(count);
        if (count === 0 && patientsData.length > 0) {
          // Check if any patient has doctorId or primaryDoctorId field
          const hasDoctorIdField = patientsData.some(
            (p) =>
              p.hasOwnProperty("doctorId") ||
              p.hasOwnProperty("primaryDoctorId")
          );
          if (!hasDoctorIdField) {
            console.warn(
              "Patient data does not seem to have 'doctorId' or 'primaryDoctorId' field for filtering."
            );
          }
        }

        setLoading(false);
      } catch (err) {
        setError(`Failed to load dashboard data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <PageLayout
      title={`${getTimeBasedGreeting()}, Dr. ${
        user?.lastName || user?.username || "Smith"
      }!`}
      subtitle={`${todaysAppointmentsCount} appointments scheduled for today`}
      loading={loading}
      error={error}
    >
      {/* Dashboard Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          lg={3}
          sx={{ minWidth: 260, maxWidth: 320 }}
        >
          <DashboardCard
            icon={<EventIcon fontSize="large" />}
            title="Appointments"
            value={todaysAppointmentsCount}
            linkText="View All"
            linkTo="/doctor/appointments"
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          lg={3}
          sx={{ minWidth: 260, maxWidth: 320 }}
        >
          <DashboardCard
            icon={<PeopleIcon fontSize="large" />}
            title="Patients"
            value={assignedPatientsCount}
            linkText="View All"
            linkTo="/doctor/patients"
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          lg={3}
          sx={{ minWidth: 260, maxWidth: 320 }}
        >
          <DashboardCard
            icon={<AssignmentIcon fontSize="large" />}
            title="Records"
            value={12}
            linkText="View All"
            linkTo="/doctor/patients"
          />
        </Grid>
      </Grid>

      {/* Appointments List */}
      <ContentCard
        title="Today's Schedule"
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          mb: 4,
        }}
      >
        <AppointmentList
          appointments={doctorAppointments.filter(
            (appt) =>
              new Date(appt.appointmentDate).toISOString().split("T")[0] ===
              new Date().toISOString().split("T")[0]
          )} // Display only today's appointments
          // loading={loading} // Removed, as PageLayout handles main loading
          showAction={false}
        />
      </ContentCard>
    </PageLayout>
  );
}

export default DoctorDashboard;
