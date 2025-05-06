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
  Tab,
  Tabs,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../app/providers/AuthProvider";
import PageHeader from '../components/PageHeader';
import PatientCard from '../components/PatientCard';

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
    primaryDoctor: "Dr. Smith",
    status: "Active"
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
    primaryDoctor: "Dr. Jones",
    status: "Active"
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
    primaryDoctor: "Dr. Smith",
    status: "Active"
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
    primaryDoctor: "Dr. Wilson",
    status: "Active"
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
    primaryDoctor: "Dr. Taylor",
    status: "Inactive"
  }
];

function AdminPatientsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [patients, setPatients] = useState(mockPatients);

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

  // Filter patients based on search term and active tab
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      searchTerm === '' || 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);
    
    // Filter by tab (All, Active, Inactive)
    if (tabValue === 1) return matchesSearch && patient.status === 'Active';
    if (tabValue === 2) return matchesSearch && patient.status === 'Inactive';
    
    return matchesSearch; // tabValue === 0 (All)
  });

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
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          placeholder="Search patients..."
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 500 }}
        />
        <IconButton aria-label="filter">
          <FilterListIcon />
        </IconButton>
        <IconButton aria-label="sort">
          <SortIcon />
        </IconButton>
      </Box>

      {/* Tabs for filtering */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="patient filter tabs"
        >
          <Tab label="All Patients" />
          <Tab label="Active" />
          <Tab label="Inactive" />
        </Tabs>
      </Box>

      {/* Patient grid */}
      {filteredPatients.length > 0 ? (
        <Grid container spacing={3}>
          {filteredPatients.map((patient) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={patient.id}>
              <PatientCard 
                patient={patient}
                onView={handleViewPatient}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No patients found</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search or filters
          </Typography>
        </Paper>
      )}
    </Container>
  );
}

export default AdminPatientsPage;