// src/pages/FrontdeskAppointmentsPage.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container
} from '@mui/material';
import FrontdeskAppointmentCalendar from '../features/appointments/components/FrontdeskAppointmentCalendar';
import PatientStatusWorkflow from '../features/patients/components/PatientStatusWorkflow';

// Import mock data from centralized location
import { mockTodayAppointments as initialAppointments, getAppointmentStatusColor } from '../mock/mockAppointments';
import { mockPatients } from '../mock/mockPatients';

function FrontdeskAppointmentsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Get patient data for an appointment
  const getPatientForAppointment = (appointment) => {
    return mockPatients.find(p => p.id === appointment.patientId);
  };
  
  // Handle opening the workflow dialog
  const handleOpenWorkflow = (appointment) => {
    setSelectedAppointment(appointment);
    setWorkflowDialogOpen(true);
  };
  
  // Handle status change from the workflow component
  const handleStatusChange = (newStatus, notes) => {
    // Update the appointment status
    setAppointments(prevAppointments => 
      prevAppointments.map(appt => 
        appt.id === selectedAppointment.id 
          ? { ...appt, status: newStatus, notes: notes } 
          : appt
      )
    );
    
    // Also update the selected appointment
    setSelectedAppointment(prev => prev ? { ...prev, status: newStatus, notes: notes } : null);
    
    // In a real app, you would make an API call to update the appointment status
    console.log(`Appointment ${selectedAppointment.id} status updated to ${newStatus}`);
    if (notes) {
      console.log(`Notes: ${notes}`);
    }
  };
  
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
          Manage patient check-ins and appointments
        </Typography>
      </Box>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        centered={false}
      >
        <Tab label="Today's Appointments" />
        <Tab label="Calendar View" />
      </Tabs>
      
      {tabValue === 0 && (
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, width: '100%' }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Today's Appointments
          </Typography>
          
          <Grid container spacing={2}>
            {appointments.map((appointment) => (
              <Grid item xs={12} sm={6} md={4} key={appointment.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderLeft: 5, 
                    borderColor: `${getAppointmentStatusColor(appointment.status)}.main`,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" component="div">
                        {appointment.time}
                      </Typography>
                      <Chip 
                        label={appointment.status} 
                        color={getAppointmentStatusColor(appointment.status)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {appointment.patientName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Doctor: {appointment.doctorName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Type: {appointment.type}
                    </Typography>
                    
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={() => handleOpenWorkflow(appointment)}
                      >
                        Manage Visit
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
      
      {tabValue === 1 && (
        <FrontdeskAppointmentCalendar />
      )}
      
      {/* Patient Visit Workflow Dialog */}
      <Dialog 
        open={workflowDialogOpen} 
        onClose={() => setWorkflowDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Patient Visit Management
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box>
              {/* Patient Info */}
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Patient
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {selectedAppointment.patientName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Appointment
                    </Typography>
                    <Typography variant="body1">
                      {selectedAppointment.time} - {selectedAppointment.type}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Doctor
                    </Typography>
                    <Typography variant="body1">
                      {selectedAppointment.doctorName}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
              
              {/* Status Workflow */}
              <PatientStatusWorkflow 
                patient={getPatientForAppointment(selectedAppointment)}
                appointment={selectedAppointment}
                onStatusChange={handleStatusChange}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkflowDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default FrontdeskAppointmentsPage;