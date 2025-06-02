// src/pages/FrontdeskDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../app/providers/AuthProvider";
import {
  getTodaysAppointments,
  getAppointments,
} from "../services/appointmentService";
import patientService from "../services/patientService";
import {
  // Grid, // Removed
  // useMediaQuery, // Removed as isMobile not used for layout here
  // useTheme, // Removed as theme not used directly for layout here
  Box,
  Dialog,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
// useNavigate import removed as it's not used after refactor
// import { useNavigate } from "react-router-dom";

// Import UI components
import {
  PageLayout,
  ContentCard,
  AppointmentList,
  DialogHeading,
  BodyText,
  SectionTitle,
  PrimaryButton,
  // SecondaryButton, // Not used directly, TextButton for cancel
  TextButton,
  StyledTextField,
  DashboardGridLayout, // Added
} from "../components/ui";
// DashboardCard import removed
// import DashboardCard from "../components/ui/DashboardCard";
import { getTimeBasedGreeting } from "../utils/dateUtils";

function FrontdeskDashboard() {
  const { user } = useAuth();
  // const theme = useTheme(); // Not used
  // const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Not used
  // const navigate = useNavigate(); // Not used
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [todaysAppointmentsCount, setTodaysAppointmentsCount] = useState(0);
  const [totalPatientsCount, setTotalPatientsCount] = useState(0);
  const [totalAppointmentsCount, setTotalAppointmentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    patientName: "",
    doctorName: "",
    type: "Walk-in",
    notes: "",
  });
  const [partialErrors, setPartialErrors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const errors = [];
      let todayApptsData = [];
      let patientsData = [];
      let allApptsData = [];
      try {
        todayApptsData = await getTodaysAppointments();
        if (!Array.isArray(todayApptsData)) todayApptsData = [];
        setTodaysAppointments(todayApptsData);
        setTodaysAppointmentsCount(todayApptsData.length);
      } catch (err) {
        errors.push("Today's Appointments: " + (err?.message || err));
        setTodaysAppointments([]);
        setTodaysAppointmentsCount(0);
      }
      try {
        patientsData = await patientService.getPatients();
        if (!Array.isArray(patientsData)) patientsData = [];
        setTotalPatientsCount(patientsData.length);
      } catch (err) {
        errors.push("Patients: " + (err?.message || err));
        setTotalPatientsCount(0);
      }
      try {
        allApptsData = await getAppointments();
        if (!Array.isArray(allApptsData)) allApptsData = [];
        setTotalAppointmentsCount(allApptsData.length);
      } catch (err) {
        errors.push("All Appointments: " + (err?.message || err));
        setTotalAppointmentsCount(0);
      }
      setPartialErrors(errors);
      setLoading(false);
      setError(
        errors.length > 0
          ? `Some data failed to load: ${errors.join("; ")}`
          : null
      );
    };

    fetchData();
  }, []);

  const handleCheckIn = (appointmentId) => {
    setError(null);
    try {
      setTodaysAppointments(
        (prevAppointments) =>
          prevAppointments.map((appt) =>
            appt.id === appointmentId ? { ...appt, status: "Checked-in" } : appt
          )
      );
      console.log(
        `Patient with appointment ID ${appointmentId} checked in successfully`
      );
    } catch (err) {
      setError(`Failed to check in: ${err.message}`);
      console.error("Check-in error:", err);
    }
  };

  const handleOpenWalkInModal = () => {
    setIsWalkInModalOpen(true);
  };

  const handleCloseWalkInModal = () => {
    setIsWalkInModalOpen(false);
  };

  const handleWalkInFormChange = (e) => {
    const { name, value } = e.target;
    setWalkInForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitWalkIn = () => {
    console.log("Walk-in data submitted:", walkInForm);
    setError(null);
    const newWalkInAppointment = {
      ...walkInForm,
      id: `walkin-${Date.now()}`,
      appointmentDate: new Date().toISOString().split("T")[0],
      appointmentTime: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      doctorName: walkInForm.doctorName || "Unassigned",
      status: "Checked-in",
    };
    setTodaysAppointments((prev) => [newWalkInAppointment, ...prev]);
    setTodaysAppointmentsCount((prevCount) => prevCount + 1);
    setTotalAppointmentsCount((prevCount) => prevCount + 1);
    handleCloseWalkInModal();
    setWalkInForm({
      patientName: "",
      doctorName: "",
      type: "Walk-in",
      notes: "",
    });
  };

  const dashboardItems = [
    {
      icon: <EventIcon fontSize="large" />,
      title: "Appointments",
      value: todaysAppointmentsCount,
      linkText: "View All",
      linkTo: "/frontdesk/appointments",
      // md: 4 is default in DashboardGridLayout for 3 items per row on medium
    },
    {
      icon: <PeopleIcon fontSize="large" />,
      title: "Patients",
      value: totalPatientsCount,
      linkText: "View All",
      linkTo: "/frontdesk/patients",
    },
    {
      icon: <CalendarMonthIcon fontSize="large" />,
      title: "Schedule",
      value: totalAppointmentsCount,
      linkText: "View All",
      linkTo: "/frontdesk/appointments",
    },
  ];

  const commonGridItemSx = {
    minWidth: { xs: '100%', sm: 260 },
    maxWidth: { xs: '100%', sm: 320 },
  };

  return (
    <PageLayout
      title={`${getTimeBasedGreeting()}, ${
        user?.firstName || user?.username || "Front Desk"
      }!`}
      subtitle={`${todaysAppointmentsCount} appointments scheduled for today`}
      loading={loading}
      error={null}
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

      <Box sx={{ mb: 4 }}>
        <SectionTitle sx={{ mb: 2 }}>
          Quick Actions
        </SectionTitle>
        {/* Using Box instead of Grid for a single button for simplicity */}
        <Box>
          <PrimaryButton
            startIcon={<PersonAddIcon />}
            onClick={handleOpenWalkInModal}
          >
            Register Walk-in
          </PrimaryButton>
        </Box>
      </Box>

      <ContentCard
        title="Upcoming Appointments"
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <AppointmentList
          appointments={todaysAppointments}
          onAction={handleCheckIn}
          actionText="Check In"
          actionStatus="Scheduled"
        />
      </ContentCard>

      <Dialog
        open={isWalkInModalOpen}
        onClose={handleCloseWalkInModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogHeading title="Register Walk-in Patient" />
        <DialogContent sx={{ pt: 3 }}>
          <Box component="form" noValidate autoComplete="off"> {/* Added form element */}
            {/* <Grid container spacing={2}> // Removed outer grid, using Box for direct layout */}
              <StyledTextField
                name="patientName"
                label="Patient Name"
                fullWidth
                required
                value={walkInForm.patientName}
                onChange={handleWalkInFormChange}
                sx={{ mb: 2 }} // Added margin bottom
              />
              <FormControl fullWidth sx={{ mb: 2 }}> {/* Added margin bottom */}
                <InputLabel id="walk-in-doctor-label">Doctor</InputLabel>
                <Select
                  name="doctorName"
                  labelId="walk-in-doctor-label"
                  value={walkInForm.doctorName}
                  onChange={handleWalkInFormChange}
                  label="Doctor"
                >
                  <MenuItem value="">
                    <em>Select Doctor (Feature pending)</em>
                  </MenuItem>
                </Select>
              </FormControl>
              <StyledTextField
                name="notes"
                label="Notes"
                multiline
                rows={3}
                fullWidth
                value={walkInForm.notes}
                onChange={handleWalkInFormChange}
                // No specific margin needed if last element or handled by DialogContent padding
              />
            {/* </Grid> */}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <TextButton onClick={handleCloseWalkInModal}>Cancel</TextButton>
          <PrimaryButton
            onClick={handleSubmitWalkIn}
            disabled={!walkInForm.patientName}
          >
            Register
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
}

export default FrontdeskDashboard;
