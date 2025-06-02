// src/pages/DoctorDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../app/providers/AuthProvider";
// Grid import removed
// import { Grid, useMediaQuery, useTheme } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import AssignmentIcon from "@mui/icons-material/Assignment";
// useNavigate import removed as it's not used after refactor
// import { useNavigate } from "react-router-dom";

// Import UI components
import {
  PageLayout,
  ContentCard,
  AppointmentList,
  BodyText,
  DashboardGridLayout, // Added
} from "../components/ui";
// DashboardCard import removed
// import DashboardCard from "../components/ui/DashboardCard";
import { getAppointmentsByDoctor } from "../services/appointmentService";
import patientService from "../services/patients";
import medicalRecordService from "../services/medicalRecordService";
import { getTimeBasedGreeting } from "../utils/dateUtils";

function DoctorDashboard() {
  const { user } = useAuth();
  // theme and isMobile might not be needed
  // const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // const navigate = useNavigate(); // Not used
  const [todaysAppointmentsCount, setTodaysAppointmentsCount] = useState(0);
  const [assignedPatientsCount, setAssignedPatientsCount] = useState(0);
  const [medicalRecordsCount, setMedicalRecordsCount] = useState(0);
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partialErrors, setPartialErrors] = useState([]);

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
      // let patientsData = []; // Defined later
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
        const recordsData = await medicalRecordService.getMedicalRecords('doctor', user.username);
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

  const dashboardItems = [
    {
      icon: <EventIcon fontSize="large" />,
      title: "Appointments",
      value: todaysAppointmentsCount,
      linkText: "View All",
      linkTo: "/doctor/appointments",
      // md: 4 is default in DashboardGridLayout for 3 items per row on medium
    },
    {
      icon: <PeopleIcon fontSize="large" />,
      title: "Patients",
      value: assignedPatientsCount,
      linkText: "View All",
      linkTo: "/doctor/patients",
    },
    {
      icon: <AssignmentIcon fontSize="large" />,
      title: "Records",
      value: medicalRecordsCount,
      linkText: "View All",
      linkTo: "/doctor/medical-records",
    },
  ];

  const commonGridItemSx = {
    // These were the sx from the <Grid item> in DoctorDashboard
    minWidth: { xs: '100%', sm: 260 },
    maxWidth: { xs: '100%', sm: 320 },
  };

  return (
    <PageLayout
      title={`${getTimeBasedGreeting()}, Dr. ${
        user?.lastName || user?.username || "Smith"
      }!`}
      subtitle={`${todaysAppointmentsCount} appointments scheduled for today`}
      loading={loading}
      error={null} // Don't block UI with error
    >
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

      <DashboardGridLayout items={dashboardItems} commonGridItemSx={commonGridItemSx} />

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
