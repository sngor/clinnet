// src/pages/FrontdeskDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../app/providers/AuthProvider";
import { 
  Grid, 
  Typography, 
  useMediaQuery, 
  useTheme, 
  Box, 
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useNavigate } from "react-router-dom";

// Import UI components
import { 
  PageHeading, 
  ContentCard, 
  AppointmentList,
  DialogHeading
} from "../components/ui";
import DashboardCard from "../components/DashboardCard";

// Import mock data from centralized location
import { mockTodayAppointments as mockAppointments } from "../mock/mockAppointments";
import { mockDoctors } from "../mock/mockDoctors";
import { getTimeBasedGreeting } from "../utils/dateUtils";

function FrontdeskDashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    patientName: "",
    doctorName: "",
    type: "Walk-in",
    notes: ""
  });

  // Fetch today's appointments (using mock data)
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      try {
        setAppointments(mockAppointments);
        setLoading(false);
      } catch (err) {
        setError(`Failed to load appointments: ${err.message}`);
        setLoading(false);
      }
    }, 500); // Simulate network delay
  }, []);

  // Handle Check-in Action
  const handleCheckIn = (appointmentId) => {
    setError(null);
    try {
      // API call would go here
      setAppointments((prevAppointments) =>
        prevAppointments.map((appt) =>
          appt.id === appointmentId ? { ...appt, status: "Checked-in" } : appt
        )
      );
      console.log(`Patient with appointment ID ${appointmentId} checked in successfully`);
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
    setWalkInForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitWalkIn = () => {
    console.log("Walk-in data submitted:", walkInForm);
    setError(null);

    // Simulate adding to the list for now:
    const newWalkInAppointment = {
      ...walkInForm,
      id: Date.now(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      doctorName: walkInForm.doctorName || "Unassigned",
      status: "Checked-in",
    }; // Mock data
    setAppointments((prev) => [newWalkInAppointment, ...prev]); // Add to top of list
    handleCloseWalkInModal(); // Close modal on success
    
    // Reset form
    setWalkInForm({
      patientName: "",
      doctorName: "",
      type: "Walk-in",
      notes: ""
    });
  };

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Page header */}
      <PageHeading 
        title={`${getTimeBasedGreeting()}, ${user?.firstName || user?.username || "Front Desk"}!`}
        subtitle={`${appointments.length} appointments scheduled for today`}
      />

      {/* Dashboard Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <DashboardCard 
            icon={<EventIcon fontSize="large" />}
            title="Appointments"
            value={appointments.length}
            linkText="View All"
            linkTo="/frontdesk/appointments"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <DashboardCard 
            icon={<PeopleIcon fontSize="large" />}
            title="Patients"
            value={42} // Mock value
            linkText="View All"
            linkTo="/frontdesk/patients"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <DashboardCard 
            icon={<CalendarMonthIcon fontSize="large" />}
            title="Schedule"
            value={7} // Mock value
            linkText="View All"
            linkTo="/frontdesk/appointments"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h5" 
          color="primary.main"
          fontWeight="medium"
          sx={{ mb: 2 }}
        >
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button 
              variant="contained" 
              startIcon={<PersonAddIcon />}
              onClick={handleOpenWalkInModal}
              sx={{ borderRadius: 1.5 }}
            >
              Register Walk-in
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Appointments List */}
      <ContentCard
        title="Upcoming Appointments"
        elevation={0}
        sx={{ 
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <AppointmentList 
          appointments={appointments}
          loading={loading}
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
                <TextField
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
                  <InputLabel>Doctor</InputLabel>
                  <Select
                    name="doctorName"
                    value={walkInForm.doctorName}
                    onChange={handleWalkInFormChange}
                    label="Doctor"
                  >
                    {mockDoctors.map(doctor => (
                      <MenuItem key={doctor.id} value={doctor.name}>
                        {doctor.name} ({doctor.specialty})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
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
          <Button onClick={handleCloseWalkInModal}>Cancel</Button>
          <Button 
            onClick={handleSubmitWalkIn} 
            variant="contained"
            disabled={!walkInForm.patientName}
          >
            Register
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default FrontdeskDashboard;