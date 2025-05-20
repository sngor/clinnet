// src/pages/DoctorDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../app/providers/AuthProvider";
import { Grid, useMediaQuery, useTheme } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useNavigate } from "react-router-dom";

// Import UI components
import {
  PageHeading,
  ContentCard,
  AppointmentList,
  PageContainer,
} from "../components/ui";
import DashboardCard from "../components/DashboardCard";

// Import mock data from centralized location
import { mockTodayAppointments as mockAppointments } from "../mock/mockAppointments";
import { getTimeBasedGreeting } from "../utils/dateUtils";

// Mock data for doctor's patients
const mockPatients = [
  { id: 1, name: "John Doe", lastVisit: "2023-11-20" },
  { id: 2, name: "Jane Smith", lastVisit: "2023-10-05" },
  { id: 3, name: "Michael Johnson", lastVisit: "2023-09-20" },
  { id: 4, name: "Emily Williams", lastVisit: "2023-11-25" },
];

function DoctorDashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data (using mock data)
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      try {
        setAppointments(mockAppointments);
        setPatients(mockPatients);
        setLoading(false);
      } catch (err) {
        setError(`Failed to load data: ${err.message}`);
        setLoading(false);
      }
    }, 500); // Simulate network delay
  }, []);

  return (
    <PageContainer>
      {/* Page header */}
      <PageHeading
        title={`${getTimeBasedGreeting()}, Dr. ${
          user?.lastName || user?.username || "Smith"
        }!`}
        subtitle={`${appointments.length} appointments scheduled for today`}
      />

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
            value={appointments.length}
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
            value={patients.length}
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
          appointments={appointments}
          loading={loading}
          showAction={false}
        />
      </ContentCard>
    </PageContainer>
  );
}

export default DoctorDashboard;
