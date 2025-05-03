// src/pages/AdminPatientsPage.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Tab,
  Tabs
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../app/providers/AuthProvider";
import PageHeader from '../components/PageHeader';

// Mock patient data
const mockPatients = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    gender: "Male",
    dateOfBirth: "1985-05-15",
    address: "123 Main St, Anytown, CA 12345",
    insuranceProvider: "Blue Cross",
    insuranceNumber: "BC12345678",
    lastVisit: "2023-11-20",
    upcomingAppointment: "2023-12-05",
    primaryDoctor: "Dr. Smith"
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 234-5678",
    gender: "Female",
    dateOfBirth: "1990-08-22",
    address: "456 Oak Ave, Somewhere, CA 67890",
    insuranceProvider: "Aetna",
    insuranceNumber: "AE87654321",
    lastVisit: "2023-10-05",
    upcomingAppointment: null,
    primaryDoctor: "Dr. Jones"
  },
  {
    id: 3,
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.j@example.com",
    phone: "+1 (555) 345-6789",
    gender: "Male",
    dateOfBirth: "1978-11-30",
    address: "789 Pine Rd, Nowhere, CA 54321",
    insuranceProvider: "Kaiser",
    insuranceNumber: "KP98765432",
    lastVisit: "2023-09-20",
    upcomingAppointment: "2023-12-15",
    primaryDoctor: "Dr. Smith"
  },
  {
    id: 4,
    firstName: "Emily",
    lastName: "Williams",
    email: "emily.w@example.com",
    phone: "+1 (555) 456-7890",
    gender: "Female",
    dateOfBirth: "1990-11-28",
    address: "101 Elm St, Anytown, CA 12345",
    insuranceProvider: "Cigna",
    insuranceNumber: "CI12345678",
    lastVisit: "2023-11-25",
    upcomingAppointment: "2023-12-05",
    primaryDoctor: "Dr. Wilson"
  },
  {
    id: 5,
    firstName: "David",
    lastName: "Brown",
    email: "david.b@example.com",
    phone: "+1 (555) 567-8901",
    gender: "Male",
    dateOfBirth: "1982-03-15",
    address: "202 Cedar St, Anytown, CA 12345",
    insuranceProvider: "United Healthcare",
    insuranceNumber: "UH87654321",
    lastVisit: "2023-11-10",
    upcomingAppointment: "2023-12-20",
    primaryDoctor: "Dr. Taylor"
  },
  {
    id: 6,
    firstName: "Sarah",
    lastName: "Miller",
    email: "sarah.m@example.com",
    phone: "+1 (555) 678-9012",
    gender: "Female",
    dateOfBirth: "1995-07-22",
    address: "303 Maple Ave, Somewhere, CA 67890",
    insuranceProvider: "Humana",
    insuranceNumber: "HU12345678",
    lastVisit: "2023-10-15",
    upcomingAppointment: "2023-12-10",
    primaryDoctor: "Dr. Jones"
  }
];

function AdminPatientsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState(mockPatients);
  const [tabValue, setTabValue] = useState(0);

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || 
           patient.email.toLowerCase().includes(searchLower) ||
           patient.phone.includes(searchTerm) ||
           patient.primaryDoctor.toLowerCase().includes(searchLower);
  });

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Format date to more readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle view patient details
  const handleViewPatient = (patientId) => {
    console.log(`Navigating to patient ${patientId}`);
    navigate(`/admin/patients/${patientId}`);
  };

  // Handle new patient registration
  const handleNewPatient = () => {
    console.log('Creating new patient');
    navigate('/admin/patients/new');
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Action button for the header
  const actionButton = (
    <Button
      variant="contained"
      startIcon={<PersonAddIcon />}
      onClick={handleNewPatient}
      sx={{ borderRadius: 1.5 }}
    >
      New Patient
    </Button>
  );

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Use the consistent PageHeader component */}
      <PageHeader 
        title="Patient Management" 
        subtitle="View and manage all patient records"
        action={actionButton}
      />

      {/* Search bar */}
      <Paper 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: 4,
          borderRadius: 2, 
          boxShadow: 2
        }}
      >
        <TextField
          fullWidth
          placeholder="Search patients by name, email, phone number, or doctor"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 0 }}
        />
      </Paper>

      {/* Tab navigation */}
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ 
          mb: 3, 
          borderBottom: 1, 
          borderColor: 'divider',
          '& .MuiTab-root': {
            fontWeight: 500,
            fontSize: '1rem',
            textTransform: 'none',
          }
        }}
      >
        <Tab label="All Patients" />
        <Tab label="Recent Patients" />
        <Tab label="By Doctor" />
      </Tabs>

      {/* Patient list */}
      <Grid container spacing={3}>
        {filteredPatients.length > 0 ? (
          filteredPatients.map(patient => (
            <Grid item xs={12} sm={6} md={4} key={patient.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer'
                  }
                }}
                onClick={() => handleViewPatient(patient.id)}
              >
                <CardContent>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 500 }}>
                    {patient.firstName} {patient.lastName}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 2 }}>
                    <Chip 
                      label={`${calculateAge(patient.dateOfBirth)} years`} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                    <Chip 
                      label={patient.gender} 
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <Box component="span" sx={{ fontWeight: 500 }}>Phone:</Box> {patient.phone}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <Box component="span" sx={{ fontWeight: 500 }}>Email:</Box> {patient.email}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <Box component="span" sx={{ fontWeight: 500 }}>Doctor:</Box> {patient.primaryDoctor}
                  </Typography>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <Box component="span" sx={{ fontWeight: 500 }}>Last Visit:</Box> {formatDate(patient.lastVisit)}
                  </Typography>
                  
                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 500 }}>Next Appointment:</Box> {formatDate(patient.upcomingAppointment)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">No patients found</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your search or add a new patient
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default AdminPatientsPage;