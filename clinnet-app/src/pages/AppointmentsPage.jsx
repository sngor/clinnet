// src/pages/AppointmentsPage.jsx
import React from "react";
import { 
  Box, 
  Typography, 
  Container, 
  Paper,
  Grid,
  Button
} from "@mui/material";
import { useAuth } from "../app/providers/AuthProvider";
import AppointmentCalendar from "../features/appointments/components/AppointmentCalendar";
import AddIcon from "@mui/icons-material/Add";

function AppointmentsPage() {
  const { user } = useAuth();
  
  return (
    <Container maxWidth="xl" disableGutters>
      {/* Page header */}
      <Box 
        sx={{ 
          mb: 4,
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 'medium',
            color: 'primary.main'
          }}
        >
          Appointments
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          {user?.role === 'doctor' ? 
            'View and manage your appointment schedule' : 
            'Schedule and manage patient appointments'}
        </Typography>
      </Box>

      {/* Calendar */}
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
          gutterBottom
          color="primary.main"
          fontWeight="medium"
          sx={{ mb: 3 }}
        >
          Appointment Calendar
        </Typography>
        
        <AppointmentCalendar />
      </Paper>
    </Container>
  );
}

export default AppointmentsPage;