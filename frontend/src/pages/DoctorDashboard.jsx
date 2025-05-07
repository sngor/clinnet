// src/pages/DoctorDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../app/providers/AuthProvider";
import { 
  Grid, 
  Paper, 
  Typography, 
  useMediaQuery, 
  useTheme, 
  Box, 
  Container,
  CircularProgress,
  List,
  ListItem,
  Divider,
  Chip,
  Button
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useNavigate } from "react-router-dom";
import { PageHeaderWithDivider } from "../components/PageHeader";
import DashboardCard from "../components/DashboardCard";

// Mock data for doctor's appointments
const mockAppointments = [
  {
    id: 301,
    patientName: "Alice Brown",
    time: "09:00 AM",
    status: "Scheduled",
    type: "Checkup",
    notes: "Annual physical examination"
  },
  {
    id: 302,
    patientName: "Bob White",
    time: "09:30 AM",
    status: "Checked-in",
    type: "Follow-up",
    notes: "Follow-up on medication adjustment"
  },
  {
    id: 303,
    patientName: "Charlie Green",
    time: "10:00 AM",
    status: "In Progress",
    type: "Consultation",
    notes: "New symptoms discussion"
  }
];

// Mock data for doctor's patients
const mockPatients = [
  { id: 1, name: "John Doe", lastVisit: "2023-11-20" },
  { id: 2, name: "Jane Smith", lastVisit: "2023-10-05" },
  { id: 3, name: "Michael Johnson", lastVisit: "2023-09-20" },
  { id: 4, name: "Emily Williams", lastVisit: "2023-11-25" }
];

function DoctorDashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Use the PageHeaderWithDivider component for the dashboard */}
      <PageHeaderWithDivider 
        title={`${getGreeting()}, Dr. ${user?.lastName || user?.username || "Smith"}!`}
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
            linkTo="/doctor/appointments"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <DashboardCard 
            icon={<PeopleIcon fontSize="large" />}
            title="Patients"
            value={patients.length}
            linkText="View All"
            linkTo="/doctor/patients"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
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
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          mb: 4
        }}
      >
        <Typography 
          variant="h5" 
          color="primary.main"
          fontWeight="medium"
          sx={{ mb: 3 }}
        >
          Today's Schedule
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
                      Type: {appt.type}
                    </Typography>
                    {appt.notes && (
                      <Typography variant="body2" color="text.secondary">
                        Notes: {appt.notes}
                      </Typography>
                    )}
                  </Box>
                  
                  <Chip 
                    label={appt.status} 
                    color={getStatusColor(appt.status)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </ListItem>
                {index < appointments.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
}

export default DoctorDashboard;