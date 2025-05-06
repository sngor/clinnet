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
import { useAppData } from '../app/providers/DataProvider';
import { calculateAge } from '../utils/validation';

function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients, loading } = useAppData();
  const [patient, setPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Fetch patient data
  useEffect(() => {
    if (patients && patients.length > 0) {
      const foundPatient = patients.find(p => p.id === id);
      
      if (foundPatient) {
        setPatient(foundPatient);
        setEditedPatient(foundPatient);
      } else {
        // Handle patient not found
        setSnackbarMessage('Patient not found');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        // Redirect back to patients list after a delay
        setTimeout(() => navigate('/frontdesk/patients'), 2000);
      }
    }
  }, [id, navigate, patients]);

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
  const handleSaveChanges = async () => {
    try {
      // In a real app, this would be an API call
      setPatient(editedPatient);
      setIsEditing(false);
      setSnackbarMessage('Patient information updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating patient:', error);
      setSnackbarMessage('Error updating patient information');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedPatient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate(-1);
  };

  // If patient is not loaded yet
  if (loading || !patient) {
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
                label={`${calculateAge(patient.dateOfBirth || patient.dob)} years`} 
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

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default PatientDetailPage;