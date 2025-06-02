// src/pages/DoctorDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../app/providers/AuthProvider";
import { Grid, useMediaQuery, useTheme } from "@mui/material";
import { getAppointmentsByDoctor } from "../services/appointmentService";
import patientService from "../services/patients";
import medicalRecordService from "../services/medicalRecordService";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useNavigate } from "react-router-dom";

// Import UI components
import {
  PageLayout, // Added PageLayout
  ContentCard,
  AppointmentList,
  BodyText, // Added BodyText
  // PageContainer, // Removed PageContainer
  // PageHeading, // Removed PageHeading
} from "../components/ui";
import DashboardCard from "../components/ui/DashboardCard"; // Updated path
import BannerWarning from "../components/ui/BannerWarning";

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
  const [medicalRecordsCount, setMedicalRecordsCount] = useState(0);
  const [doctorAppointments, setDoctorAppointments] = useState([]); // To store all appointments for the list
  const [loading, setLoading] = useState(true);
  const [partialErrors, setPartialErrors] = useState([]);
  const [error, setError] = useState(null);

  // Fetch data
  useEffect(() => {
    if (!user || !user.username) {
      setLoading(false);
      setError("User details not available.");
      return;
    }
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      const errors = [];
      let appointmentsData = [];
      let patientsData = [];
      try {
        appointmentsData = await getAppointmentsByDoctor(user.username);
        if (!Array.isArray(appointmentsData)) appointmentsData = [];
        if (isMounted) setDoctorAppointments(appointmentsData);
      } catch (err) {
        errors.push("Appointments: " + (err?.message || err));
        if (isMounted) setDoctorAppointments([]);
      }
      try {
        const today = new Date().toISOString().split("T")[0];
        const todayAppointments = Array.isArray(appointmentsData)
          ? appointmentsData.filter(
              (appt) =>
                appt.appointmentDate &&
                appt.appointmentDate.split("T")[0] === today
            )
          : [];
        if (isMounted) setTodaysAppointmentsCount(todayAppointments.length);
      } catch (err) {
        errors.push("Today's Appointments: " + (err?.message || err));
        if (isMounted) setTodaysAppointmentsCount(0);
      }
      try {
        const result = await patientService.fetchPatients();
        const patientsData = Array.isArray(result.data) ? result.data : [];
        let count = 0;
        patientsData.forEach((patient) => {
          if (
            patient.primaryDoctorId === user.username ||
            patient.doctorId === user.username
          ) {
            count++;
          }
        });
        if (isMounted) setAssignedPatientsCount(count);
        if (count === 0 && patientsData.length > 0) {
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
      } catch (err) {
        errors.push("Patients: " + (err?.message || err));
        if (isMounted) setAssignedPatientsCount(0);
      }
      try {
        const recordsData = await medicalRecordService.getMedicalRecords(
          "doctor",
          user.username
        );
        if (isMounted && Array.isArray(recordsData)) {
          setMedicalRecordsCount(recordsData.length);
        } else if (isMounted) {
          setMedicalRecordsCount(0);
        }
      } catch (err) {
        errors.push("Medical Records: " + (err?.message || err));
        if (isMounted) setMedicalRecordsCount(0);
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
  }, [user]);

  return (
    <PageLayout
      title={`${getTimeBasedGreeting()}, Dr. ${
        user?.lastName || user?.username || "Smith"
      }!`}
      subtitle={
        <>
          {`${todaysAppointmentsCount} appointments scheduled for today`}
          <br />
          <span style={{ color: "#888", fontSize: 16 }}>
            {new Date().toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </>
      }
      loading={loading}
      error={null} // Don't block UI with error
    >
      {/* Show error as a warning if partialErrors exist */}
      {partialErrors.length > 0 && error && <BannerWarning message={error} />}
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
            value={medicalRecordsCount}
            linkText="View All"
            linkTo="/doctor/medical-records"
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
          appointments={
            Array.isArray(doctorAppointments)
              ? doctorAppointments.filter(
                  (appt) =>
                    appt.appointmentDate &&
                    new Date(appt.appointmentDate)
                      .toISOString()
                      .split("T")[0] === new Date().toISOString().split("T")[0]
                )
              : []
          }
          showAction={false}
        />
      </ContentCard>
    </PageLayout>
  );
}

export default DoctorDashboard;
