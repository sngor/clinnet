// src/pages/FrontDeskDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../app/providers/AuthProvider";
import { 
  Grid, 
  Paper, 
  Typography, 
  useMediaQuery, 
  useTheme, 
  Box, 
  Button,
  Container,
  CircularProgress,
  List,
  ListItem,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
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
import { PageHeaderWithDivider } from "../components/PageHeader";
import DashboardCard from "../components/DashboardCard";

// Mock data for today's appointments
const mockAppointments = [
  {
    id: 201,
    patientName: "Alice Brown",
    time: "09:00 AM",
    doctorName: "Dr. Smith",
    status: "Scheduled",
    type: "Checkup"
  },
  {
    id: 202,
    patientName: "Bob White",
    time: "09:30 AM",
    doctorName: "Dr. Jones",
    status: "Checked-in",
    type: "Follow-up"
  },
  {
    id: 203,
    patientName: "Charlie Green",
    time: "10:00 AM",
    doctorName: "Dr. Smith",
    status: "In Progress",
    type: "Consultation"
  }
];

// Mock data for doctors
const mockDoctors = [
  { id: 1, name: "Dr. Smith", specialty: "General Medicine" },
  { id: 2, name: "Dr. Jones", specialty: "Cardiology" },
  { id: 3, name: "Dr. Wilson", specialty: "Pediatrics" },
  { id: 4, name: "Dr. Taylor", specialty: "Dermatology" }
];

function FrontDeskDashboard() {
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

  // Function to get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good morning";
    } else if (hour < 18) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

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

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Scheduled':
        return 'primary';
      case 'Checked-in':
        return 'success';
      case 'In Progress':
        return 'warning';
      case 'Completed':
        return 'info';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

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
      {/* Use the PageHeaderWithDivider component for the dashboard */}
      <PageHeaderWithDivider 
        title={`${getGreeting()}, ${user?.firstName || user?.username || "Front Desk"}!`}
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
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography 
          variant="h5" 
          color="primary.main"
          fontWeight="medium"
          sx={{ mb: 3 }}
        >
          Upcoming Appointments
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ width: '100%' }}>
            {appointments.map((appt, index) => (
              <React.Fragment key={appt.id}>
                <ListItem
                  sx={{ 
                    py: 2,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between'
                  }}
                >
                  <Box sx={{ mb: { xs: 2, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {appt.time} - {appt.patientName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Doctor: {appt.doctorName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Type: {appt.type}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip 
                      label={appt.status} 
                      color={getStatusColor(appt.status)}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                    {appt.status === 'Scheduled' && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleCheckIn(appt.id)}
                      >
                        Check In
                      </Button>
                    )}
                  </Box>
                </ListItem>
                {index < appointments.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Walk-in Registration Modal */}
      <Dialog 
        open={isWalkInModalOpen} 
        onClose={handleCloseWalkInModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Register Walk-in Patient</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
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
        <DialogActions>
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

export default FrontDeskDashboard;