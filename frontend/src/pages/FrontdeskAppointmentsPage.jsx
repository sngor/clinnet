// src/pages/FrontdeskAppointmentsPage.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Container
} from '@mui/material';
import FrontdeskAppointmentCalendar from '../features/appointments/components/FrontdeskAppointmentCalendar';
import PatientStatusWorkflow from '../features/patients/components/PatientStatusWorkflow';

// Import UI components
import { 
  PageHeading, 
  AppointmentCard, 
  ContentCard, 
  LoadingIndicator 
} from '../components/ui';

// Import mock data from centralized location
import { mockTodayAppointments as initialAppointments } from '../mock/mockAppointments';
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
      <PageHeading
        title="Appointments"
        subtitle="Manage patient check-ins and appointments"
      />
      
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
        <ContentCard 
          title="Today's Appointments"
          elevation={3}
        >
          {loading ? (
            <LoadingIndicator message="Loading appointments..." />
          ) : (
            <Grid container spacing={2}>
              {appointments.map((appointment) => (
                <Grid item xs={12} sm={6} md={4} key={appointment.id}>
                  <AppointmentCard
                    appointment={appointment}
                    onAction={handleOpenWorkflow}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </ContentCard>
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
              <ContentCard 
                sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}
                elevation={0}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        Patient
                      </Box>
                      <Box sx={{ fontWeight: 'medium' }}>
                        {selectedAppointment.patientName}
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        Appointment
                      </Box>
                      <Box>
                        {selectedAppointment.time} - {selectedAppointment.type}
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        Doctor
                      </Box>
                      <Box>
                        {selectedAppointment.doctorName}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </ContentCard>
              
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