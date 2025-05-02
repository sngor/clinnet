// src/pages/AppointmentManagementPage.jsx
import React from "react";
import { 
  Box, 
  Typography, 
  Container
} from "@mui/material";
import { useAuth } from "../app/providers/AuthProvider";
import AppointmentManagement from "../features/appointments/components/AppointmentManagement";

function AppointmentManagementPage() {
  const { user } = useAuth();
  
  return (
    <Container maxWidth="xl" disableGutters sx={{ height: 'calc(100vh - 100px)' }}>
      {/* Page header */}
      <Box 
        sx={{ 
          mb: 3,
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
          Appointment Management
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          {user?.role === 'doctor' ? 
            'View and manage your appointment schedule' : 
            user?.role === 'admin' ?
            'Oversee all clinic appointments' :
            'Schedule and manage patient appointments'}
        </Typography>
      </Box>

      {/* Appointment management component - giving it full height */}
      <Box sx={{ height: 'calc(100% - 80px)' }}>
        <AppointmentManagement />
      </Box>
    </Container>
  );
}

export default AppointmentManagementPage;