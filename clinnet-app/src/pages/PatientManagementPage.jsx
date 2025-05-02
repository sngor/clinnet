// src/pages/PatientManagementPage.jsx
import React from "react";
import PatientList from "../features/patients/components/PatientList";
import { Box, Typography, Container } from "@mui/material";
import { useAuth } from "../app/providers/AuthProvider";

function PatientManagementPage() {
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
          Patient Management
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          {user?.role === 'doctor' ? 
            'Manage your patients and their medical records' : 
            'Register and manage patient information'}
        </Typography>
      </Box>

      {/* Patient list */}
      <PatientList />
    </Container>
  );
}

export default PatientManagementPage;