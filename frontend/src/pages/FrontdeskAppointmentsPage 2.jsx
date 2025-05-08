// src/pages/FrontdeskAppointmentsPage.jsx
import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
  Container
} from '@mui/material';
import FrontdeskAppointmentCalendar from '../features/appointments/components/FrontdeskAppointmentCalendar';
import PatientStatusWorkflow from '../features/patients/components/PatientStatusWorkflow';

// Mock data for today's appointments
const initialAppointments = [
  {
    id: 201,
    patientId: 101,
    patientName: "Alice Brown",
    time: "09:00 AM",
    doctorName: "Dr. Smith",
    status: "Scheduled",
    type: "Checkup"
  },
  {
    id: 202,
    patientId: 102,
    patientName: "Bob White",
    time: "09:30 AM",
    doctorName: "Dr. Jones",
    status: "Checked-in",
    type: "Follow-up"
  },
  {
    id: 203,
    patientId: 103,
    patientName: "Charlie Green",
    time: "10:00 AM",
    doctorName: "Dr. Smith",
    status: "In Progress",
    type: "Consultation"
  },
  {
    id: 204,
    patientId: 104,
    patientName: "David Black",
    time: "10:30 AM",
    doctorName: "Dr. Jones",
    status: "Ready for Checkout",
    type: "New Patient"
  },
  {
    id: 205,
    patientId: 105,
    patientName: "Eva Gray",
    time: "11:00 AM",
    doctorName: "Dr. Smith",
    status: "Completed",
    type: "Follow-up"
  },
];

// Mock patient data
const mockPatients = [
  {
    id: 101,
    firstName: "Alice",
    lastName: "Brown",
    dob: "1985-05-15",
    phone: "555-1234",
    email: "alice.b@example.com",
    address: "123 Main St, Anytown, USA",
    insuranceProvider: "Blue Cross",
    insuranceNumber: "BC12345678"
  },
  {
    id: 102,
    firstName: "Bob",
    lastName: "White",
    dob: "1992-08-22",
    phone: "555-5678",
    email: "bob.w@example.com",
    address: "456 Oak Ave, Somewhere, USA",
    insuranceProvider: "Aetna",
    insuranceNumber: "AE87654321"
  },
  {
    id: 103,
    firstName: "Charlie",
    lastName: "Green",
    dob: "1978-03-10",
    phone: "555-9012",
    email: "charlie.g@example.com",
    address: "789 Pine Rd, Elsewhere, USA",
    insuranceProvider: "United Healthcare",
    insuranceNumber: "UH56781234"
  },
  {
    id: 104,
    firstName: "David",
    lastName: "Black",
    dob: "1990-11-28",
    phone: "555-3456",
    email: "david.b@example.com",
    address: "321 Elm St, Nowhere, USA",
    insuranceProvider: "Cigna",
    insuranceNumber: "CI43218765"
  },
  {
    id: 105,
    firstName: "Eva",
    lastName: "Gray",
    dob: "1982-07-14",
    phone: "555-7890",
    email: "eva.g@example.com",
    address: "654 Maple Ave, Anywhere, USA",
    insuranceProvider: "Humana",
    insuranceNumber: "HU98761234"
  }
];

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
  
  // Get color for status chip
  const getStatusColor = (status) => {
    switch(status) {
      case 'Scheduled':
        return 'info';
      case 'Checked-in':
        return 'primary';
      case 'In Progress':
        return 'warning';
      case 'Ready for Checkout':
        return 'secondary';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
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
                    borderColor: `${getStatusColor(appointment.status)}.main`,
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
                        color={getStatusColor(appointment.status)}
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