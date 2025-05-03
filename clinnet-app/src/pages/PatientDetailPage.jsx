// src/pages/PatientDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
  Tab,
  Tabs,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';

// Import tab components
import PersonalInfoTab from '../components/patients/PersonalInfoTab';
import MedicalInfoTab from '../components/patients/MedicalInfoTab';
import AppointmentsTab from '../components/patients/AppointmentsTab';
import MedicalRecordsTab from '../components/patients/MedicalRecordsTab';

// Mock patient data - in a real app, this would come from an API
const mockPatients = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    gender: "Male",
    dateOfBirth: "1985-05-15",
    address: "123 Main St",
    city: "Anytown",
    state: "CA",
    zipCode: "12345",
    insuranceProvider: "Blue Cross",
    insuranceNumber: "BC12345678",
    emergencyContactName: "Jane Doe",
    emergencyContactPhone: "+1 (555) 987-6543",
    allergies: "Penicillin",
    medicalConditions: "Hypertension, Asthma",
    medications: "Lisinopril, Albuterol",
    lastVisit: "2023-11-20",
    upcomingAppointment: "2023-12-05",
    bloodType: "O+",
    height: "180 cm",
    weight: "75 kg"
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 234-5678",
    gender: "Female",
    dateOfBirth: "1990-08-22",
    address: "456 Oak Ave",
    city: "Somewhere",
    state: "CA",
    zipCode: "67890",
    insuranceProvider: "Aetna",
    insuranceNumber: "AE87654321",
    emergencyContactName: "John Smith",
    emergencyContactPhone: "+1 (555) 876-5432",
    allergies: "None",
    medicalConditions: "Diabetes Type 2",
    medications: "Metformin",
    lastVisit: "2023-10-05",
    upcomingAppointment: null,
    bloodType: "A+",
    height: "165 cm",
    weight: "62 kg"
  },
  {
    id: 3,
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.j@example.com",
    phone: "+1 (555) 345-6789",
    gender: "Male",
    dateOfBirth: "1978-11-30",
    address: "789 Pine Rd",
    city: "Nowhere",
    state: "CA",
    zipCode: "54321",
    insuranceProvider: "Kaiser",
    insuranceNumber: "KP98765432",
    emergencyContactName: "Sarah Johnson",
    emergencyContactPhone: "+1 (555) 765-4321",
    allergies: "Shellfish",
    medicalConditions: "None",
    medications: "None",
    lastVisit: "2023-09-20",
    upcomingAppointment: "2023-12-15",
    bloodType: "B-",
    height: "175 cm",
    weight: "80 kg"
  },
  {
    id: 4,
    firstName: "Emily",
    lastName: "Williams",
    email: "emily.w@example.com",
    phone: "+1 (555) 456-7890",
    gender: "Female",
    dateOfBirth: "1990-11-28",
    address: "101 Elm St",
    city: "Anytown",
    state: "CA",
    zipCode: "12345",
    insuranceProvider: "Cigna",
    insuranceNumber: "CI12345678",
    emergencyContactName: "David Williams",
    emergencyContactPhone: "+1 (555) 654-3210",
    allergies: "Peanuts",
    medicalConditions: "Migraine",
    medications: "Sumatriptan",
    lastVisit: "2023-11-25",
    upcomingAppointment: "2023-12-05",
    bloodType: "AB+",
    height: "170 cm",
    weight: "65 kg"
  }
];

function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Fetch patient data
  useEffect(() => {
    // In a real app, this would be an API call
    const patientId = parseInt(id);
    const foundPatient = mockPatients.find(p => p.id === patientId);
    
    if (foundPatient) {
      setPatient(foundPatient);
      setEditedPatient(foundPatient);
    } else {
      // Handle patient not found
      setSnackbarMessage('Patient not found');
      setSnackbarOpen(true);
      // Redirect back to patients list after a delay
      setTimeout(() => navigate('/frontdesk/patients'), 2000);
    }
  }, [id, navigate]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Start editing patient
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedPatient(patient);
  };

  // Save patient changes
  const handleSaveChanges = () => {
    // In a real app, this would be an API call
    setPatient(editedPatient);
    setIsEditing(false);
    setSnackbarMessage('Patient information updated successfully');
    setSnackbarOpen(true);
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedPatient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate(-1);
  };

  // If patient is not loaded yet
  if (!patient) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h5">Loading patient information...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={handleBackClick} 
          sx={{ mr: 2 }}
          aria-label="back"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 500 }}>
          Patient Details
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {!isEditing ? (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEditClick}
            sx={{ borderRadius: 1.5 }}
          >
            Edit Patient
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancelEdit}
              sx={{ borderRadius: 1.5 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveChanges}
              sx={{ borderRadius: 1.5 }}
            >
              Save Changes
            </Button>
          </Box>
        )}
      </Box>

      {/* Patient summary card */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          bgcolor: 'primary.main',
          color: 'white'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ fontWeight: 500 }}>
              {patient.firstName} {patient.lastName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip 
                label={`${calculateAge(patient.dateOfBirth)} years`} 
                size="small" 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip 
                label={patient.gender} 
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              {patient.bloodType && (
                <Chip 
                  label={`Blood: ${patient.bloodType}`} 
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2">{patient.phone}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2">{patient.email}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs for different sections */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="patient information tabs"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '1rem',
            }
          }}
        >
          <Tab label="Personal Information" />
          <Tab label="Medical Information" />
          <Tab label="Appointments" />
          <Tab label="Medical Records" />
        </Tabs>
      </Box>

      {/* Tab content */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        {tabValue === 0 && (
          <PersonalInfoTab 
            patient={patient} 
            editedPatient={editedPatient} 
            isEditing={isEditing} 
            handleInputChange={handleInputChange} 
          />
        )}
        {tabValue === 1 && (
          <MedicalInfoTab 
            patient={patient} 
            editedPatient={editedPatient} 
            isEditing={isEditing} 
            handleInputChange={handleInputChange} 
          />
        )}
        {tabValue === 2 && (
          <AppointmentsTab patientId={id} />
        )}
        {tabValue === 3 && (
          <MedicalRecordsTab patientId={id} />
        )}
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default PatientDetailPage;