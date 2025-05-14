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
  Snackbar,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useAppData } from "../app/providers/DataProvider";

// Import tab components
import PersonalInfoTab from '../components/patients/PersonalInfoTab';
import MedicalInfoTab from '../components/patients/MedicalInfoTab';
import AppointmentsTab from '../components/patients/AppointmentsTab';
import MedicalRecordsTab from '../components/patients/MedicalRecordsTab';

function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients, loading, error, updatePatient, refreshPatients } = useAppData();
  
  const [patient, setPatient] = useState(null);
  const [editedPatient, setEditedPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Load patient data
  useEffect(() => {
    refreshPatients();
  }, []);

  // Find patient by ID
  useEffect(() => {
    if (!patients || patients.length === 0) return;
    
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
      setTimeout(() => navigate(-1), 2000);
    }
  }, [id, patients, navigate]);

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
      // Format data for API
      const patientData = {
        firstName: editedPatient.firstName,
        lastName: editedPatient.lastName,
        dob: editedPatient.dateOfBirth || editedPatient.dob,
        phone: editedPatient.phone,
        email: editedPatient.email,
        address: editedPatient.address,
        insuranceProvider: editedPatient.insuranceProvider,
        insuranceNumber: editedPatient.insuranceNumber,
        status: editedPatient.status || 'Active'
      };
      
      await updatePatient(id, patientData);
      
      // Update local state
      setPatient(editedPatient);
      setIsEditing(false);
      
      // Show success message
      setSnackbarMessage('Patient information updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Refresh patients list
      refreshPatients();
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

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="info">Loading patient information...</Alert>
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
        <Typography variant="h4" component="h1" sx={{ fontWeight: 500, flexGrow: 1 }}>
          {patient.firstName} {patient.lastName}
        </Typography>
        
        {isEditing ? (
          <Box>
            <Button 
              startIcon={<SaveIcon />} 
              variant="contained" 
              color="primary"
              onClick={handleSaveChanges}
              sx={{ mr: 1 }}
            >
              Save
            </Button>
            <Button 
              startIcon={<CancelIcon />} 
              variant="outlined"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
          </Box>
        ) : (
          <Button 
            startIcon={<EditIcon />} 
            variant="contained" 
            color="primary"
            onClick={handleEditClick}
          >
            Edit
          </Button>
        )}
      </Box>
      
      {/* Patient summary card */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date of Birth
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="dateOfBirth"
                    type="date"
                    value={editedPatient.dateOfBirth || editedPatient.dob || ''}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    margin="dense"
                  />
                ) : (
                  <Typography variant="body1">
                    {patient.dateOfBirth || patient.dob || 'N/A'} 
                    {patient.dateOfBirth || patient.dob ? ` (${calculateAge(patient.dateOfBirth || patient.dob)} years)` : ''}
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Gender
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="gender"
                    value={editedPatient.gender || ''}
                    onChange={handleInputChange}
                    size="small"
                    margin="dense"
                  />
                ) : (
                  <Typography variant="body1">
                    {patient.gender || 'N/A'}
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Phone
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="phone"
                    value={editedPatient.phone || ''}
                    onChange={handleInputChange}
                    size="small"
                    margin="dense"
                  />
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      {patient.phone || 'N/A'}
                    </Typography>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="email"
                    value={editedPatient.email || ''}
                    onChange={handleInputChange}
                    size="small"
                    margin="dense"
                  />
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      {patient.email || 'N/A'}
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Address
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="address"
                    value={editedPatient.address || ''}
                    onChange={handleInputChange}
                    size="small"
                    margin="dense"
                  />
                ) : (
                  <Typography variant="body1">
                    {patient.address || 'N/A'}
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Insurance Provider
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="insuranceProvider"
                    value={editedPatient.insuranceProvider || ''}
                    onChange={handleInputChange}
                    size="small"
                    margin="dense"
                  />
                ) : (
                  <Typography variant="body1">
                    {patient.insuranceProvider || 'N/A'}
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Insurance Number
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="insuranceNumber"
                    value={editedPatient.insuranceNumber || ''}
                    onChange={handleInputChange}
                    size="small"
                    margin="dense"
                  />
                ) : (
                  <Typography variant="body1">
                    {patient.insuranceNumber || 'N/A'}
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                {isEditing ? (
                  <TextField
                    select
                    fullWidth
                    name="status"
                    value={editedPatient.status || 'Active'}
                    onChange={handleInputChange}
                    size="small"
                    margin="dense"
                    SelectProps={{
                      native: true
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </TextField>
                ) : (
                  <Chip 
                    label={patient.status || 'Active'} 
                    color={patient.status === 'Active' ? 'success' : 'default'}
                    size="small"
                  />
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs for different sections */}
      <Box sx={{ mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Personal Info" />
          <Tab label="Medical Info" />
          <Tab label="Appointments" />
          <Tab label="Medical Records" />
        </Tabs>
      </Box>
      
      {/* Tab content */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        {tabValue === 0 && (
          <PersonalInfoTab 
            patient={patient} 
            isEditing={isEditing}
            editedPatient={editedPatient}
            handleInputChange={handleInputChange}
          />
        )}
        {tabValue === 1 && (
          <MedicalInfoTab 
            patient={patient}
            isEditing={isEditing}
          />
        )}
        {tabValue === 2 && (
          <AppointmentsTab 
            patientId={patient.id}
          />
        )}
        {tabValue === 3 && (
          <MedicalRecordsTab 
            patientId={patient.id}
          />
        )}
      </Paper>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert 
          onClose={handleSnackbarClose} 
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