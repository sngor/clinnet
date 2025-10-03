// src/pages/FrontdeskDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../app/providers/AuthProvider";
import {
  getTodaysAppointments,
  getAppointments,
} from "../services/appointmentService";
import patientService from "../services/patientService";
import {
  Grid,
  // Typography, // Replaced by UI kit components
  useMediaQuery,
  useTheme,
  Box,
  // Button, // Replaced by UI kit components
  Dialog,
  DialogContent,
  DialogActions, // Keep for structure, buttons inside will be replaced
  // TextField, // Replaced by StyledTextField
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useNavigate } from "react-router-dom";

// Import UI components
import {
  PageLayout, // Added PageLayout
  ContentCard,
  AppointmentList,
  DialogHeading, // DialogHeading is kept
  BodyText, // Added
  SectionTitle, // Added
  PrimaryButton, // Added
  SecondaryButton, // Added (for Cancel button)
  TextButton, // Added (alternative for Cancel)
  StyledTextField, // Added
} from "../components/ui";
import DashboardCard from "../components/ui/DashboardCard"; // Updated path
// Removed BannerWarning - moved to Settings page

// Import mock data from centralized location
// import { mockTodayAppointments as mockAppointments } from "../mock/mockAppointments"; // Removed
// import { mockDoctors } from "../mock/mockDoctors"; // Removed
import { getTimeBasedGreeting } from "../utils/dateUtils";

function FrontdeskDashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [todaysAppointmentsCount, setTodaysAppointmentsCount] = useState(0);
  const [totalPatientsCount, setTotalPatientsCount] = useState(0);
  const [totalAppointmentsCount, setTotalAppointmentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [partialErrors, setPartialErrors] = useState([]);
  const [error, setError] = useState(null);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    patientName: "",
    doctorName: "",
    type: "Walk-in",
    notes: "",
  });

  // Fetch dashboard data
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
      setError(
        errors.length > 0
          ? `Some data failed to load: ${errors.join("; ")}`
          : null
      );
      setLoading(false);
    };

    fetchData();
  }, []);

  // Handle Check-in Action
  const handleCheckIn = (appointmentId) => {
    setError(null);
    try {
      // API call would go here
      // Assuming the status update is handled by a dedicated service call in a real app
      setTodaysAppointments(
        (
          prevAppointments // Update today's appointments list
        ) =>
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

  // --- Walk-in Handlers ---
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

    // Simulate adding to the list for now:
    const newWalkInAppointment = {
      ...walkInForm,
      id: `walkin-${Date.now()}`, // Ensure unique ID for walk-ins
      appointmentDate: new Date().toISOString().split("T")[0], // Set current date
      appointmentTime: new Date().toLocaleTimeString([], {
        // Set current time
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      doctorName: walkInForm.doctorName || "Unassigned", // Use selected doctor or default
      status: "Checked-in", // Walk-ins are typically checked-in immediately
      // patientId: "new-patient-" + Date.now(), // Placeholder for actual patient ID generation
    };
    // Add to today's appointments list for immediate UI update
    setTodaysAppointments((prev) => [newWalkInAppointment, ...prev]);
    setTodaysAppointmentsCount((prevCount) => prevCount + 1); // Increment today's appointment count
    // Potentially increment total appointments count as well if walk-ins are added to the main schedule
    setTotalAppointmentsCount((prevCount) => prevCount + 1);
    handleCloseWalkInModal(); // Close modal on success

    // Reset form
    setWalkInForm({
      patientName: "",
      doctorName: "",
      type: "Walk-in",
      notes: "",
    });
  };

  return (
    <PageLayout
      title={`${getTimeBasedGreeting()}, ${
        user?.firstName || user?.username || "Front Desk"
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
      {/* Error alerts moved to Settings page */}
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
            linkTo="/frontdesk/appointments"
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
            value={totalPatientsCount}
            linkText="View All"
            linkTo="/frontdesk/patients"
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
            icon={<CalendarMonthIcon fontSize="large" />}
            title="Schedule"
            value={totalAppointmentsCount}
            linkText="View All"
            linkTo="/frontdesk/appointments"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <SectionTitle sx={{ mb: 2 }}>
          {" "}
          {/* Was Typography h5 */}
          Quick Actions
        </SectionTitle>
        <Grid container spacing={2}>
          <Grid item>
            <PrimaryButton /* Was Button variant="contained" */
              startIcon={<PersonAddIcon />}
              onClick={handleOpenWalkInModal}
              // sx={{ borderRadius: 1.5 }} // PrimaryButton has its own styling
            >
              Register Walk-in
            </PrimaryButton>
          </Grid>
        </Grid>
      </Box>

      {/* Appointments List */}
      <ContentCard
        title="Upcoming Appointments"
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <AppointmentList
          appointments={todaysAppointments} // Use fetched today's appointments
          // loading={loading} // Removed, as PageLayout handles main loading
          onAction={handleCheckIn}
          actionText="Check In"
          actionStatus="Scheduled"
        />
      </ContentCard>

      {/* Walk-in Registration Modal */}
      <Dialog
        open={isWalkInModalOpen}
        onClose={handleCloseWalkInModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogHeading title="Register Walk-in Patient" />
        <DialogContent sx={{ pt: 3 }}>
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <StyledTextField /* Was TextField */
                  name="patientName"
                  label="Patient Name"
                  fullWidth
                  required
                  value={walkInForm.patientName}
                  onChange={handleWalkInFormChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="walk-in-doctor-label">Doctor</InputLabel>{" "}
                  {/* Added id for label */}
                  <Select
                    name="doctorName"
                    labelId="walk-in-doctor-label" // Added labelId
                    value={walkInForm.doctorName}
                    onChange={handleWalkInFormChange}
                    label="Doctor"
                  >
                    {/* 
                      TODO: Replace mockDoctors with actual fetched doctor list
                      For now, this will be empty or show a placeholder if mockDoctors is removed.
                      It's recommended to fetch doctors similar to other data.
                    */}
                    {/* {mockDoctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.name}>
                        {doctor.name} ({doctor.specialty})
                      </MenuItem>
                    ))} */}
                    <MenuItem value="">
                      <em>Select Doctor (Feature pending)</em>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <StyledTextField /* Was TextField */
                  name="notes"
                  label="Notes"
                  multiline
                  rows={3}
                  fullWidth
                  value={walkInForm.notes}
                  onChange={handleWalkInFormChange}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <TextButton onClick={handleCloseWalkInModal}>Cancel</TextButton>{" "}
          {/* Was Button */}
          <PrimaryButton /* Was Button variant="contained" */
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
