// src/pages/PatientDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Tab,
  Tabs,
  IconButton,
  Alert,
  Snackbar,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Sync as SyncIcon,
} from "@mui/icons-material";
import { useAppData } from "../app/providers/DataProvider";

// Tab components
import PersonalInfoTab from "../components/patients/PersonalInfoTab";
import MedicalInfoTab from "../components/patients/MedicalInfoTab";
import AppointmentsTab from "../components/patients/AppointmentsTab";
import MedicalRecordsTab from "../components/patients/MedicalRecordsTab";

import patientService from "../services/patients";

/**
 * PatientDetailPage displays and allows editing of a single patient's details.
 * Handles loading, error, and not-found states, and provides tabbed navigation.
 */
function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients, loading, error, updatePatient } = useAppData();

  // State for patient data and UI
  const [patient, setPatient] = useState(null);
  const [editedPatient, setEditedPatient] = useState(null); // Will include profileImage (base64 for new upload)
  const [profileImagePreview, setProfileImagePreview] = useState(null); // For new image base64 preview
  const [displayableProfileImageUrl, setDisplayableProfileImageUrl] = useState(null); // For existing S3 image URL
  const [isEditing, setIsEditing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Helper to convert S3 URI to HTTPS URL - Exported for testing
  export const getDisplayableS3Url = (s3UriOrHttpsUrl) => {
    if (!s3UriOrHttpsUrl) return null;
    if (s3UriOrHttpsUrl.startsWith('https://')) {
      return s3UriOrHttpsUrl;
    }
    if (s3UriOrHttpsUrl.startsWith('s3://')) {
      const parts = s3UriOrHttpsUrl.replace('s3://', '').split('/');
      const bucket = parts.shift();
      const key = parts.join('/');
      // Assuming region us-east-1 as per requirement if not otherwise specified
      // TODO: Make region configurable if necessary, e.g., via environment variable
      const region = process.env.REACT_APP_AWS_REGION || 'us-east-1';
      return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    }
    // If it's just a key (though the backend is saving URI)
    // const bucket = process.env.REACT_APP_PROFILE_IMAGE_BUCKET; 
    // const region = process.env.REACT_APP_AWS_REGION || 'us-east-1';
    // if (bucket && key) return `https://${bucket}.s3.${region}.amazonaws.com/${s3UriOrHttpsUrl}`;
    
    console.warn("Invalid S3 URI or URL:", s3UriOrHttpsUrl);
    return null; // Or return the original string if it's an unrecognized format
  };
  
  // Effect to update displayableProfileImageUrl when patient data changes
  useEffect(() => {
    if (patient && patient.profileImage) {
      setDisplayableProfileImageUrl(getDisplayableS3Url(patient.profileImage));
    } else {
      setDisplayableProfileImageUrl(null);
    }
  }, [patient]);

  // Fetch patient by ID from context or API
  useEffect(() => {
    if (!id) return;
    if (loading) return; // Wait for initial loading to complete
    if (error) {
      setPatient(null);
      setEditedPatient(null);
      setDisplayableProfileImageUrl(null);
      setProfileImagePreview(null);
      return;
    }
  
    const loadPatientData = (patientSource) => {
      setPatient(patientSource);
      // Initialize editedPatient. profileImage here is for *new* uploads.
      // Existing S3 image URL is handled by displayableProfileImageUrl.
      setEditedPatient({ ...patientSource, profileImage: null }); 
      setProfileImagePreview(null); // Clear any previous preview
      if (patientSource.profileImage) {
        setDisplayableProfileImageUrl(getDisplayableS3Url(patientSource.profileImage));
      } else {
        setDisplayableProfileImageUrl(null);
      }
    };
  
    // Try to find patient in context first
    if (patients && Array.isArray(patients) && patients.length > 0) {
      const found = patients.find((p) => p.id === id);
      if (found) {
        // Check if patient data or its string representation has changed to avoid infinite loops
        if (!patient || patient.id !== found.id || JSON.stringify(patient) !== JSON.stringify(found)) {
          loadPatientData(found);
        }
        return; // Found in context, no need to fetch
      }
    }
  
    // If not found in context or context is empty, fetch directly
    // This also handles the case where `patients` might be initially empty then populated
    patientService
      .fetchPatientById(id)
      .then((fetchedPatient) => {
        if (fetchedPatient) {
          loadPatientData(fetchedPatient);
        } else {
          setPatient(null);
          setEditedPatient(null);
          setDisplayableProfileImageUrl(null);
          setProfileImagePreview(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching patient by ID:", err);
        setPatient(null);
        setEditedPatient(null);
        setDisplayableProfileImageUrl(null);
        setProfileImagePreview(null);
      });
  }, [id, patients, loading, error]); // Removed 'patient' from deps to avoid loop, manage updates carefully

  // Tab change handler
  const handleTabChange = (_, newValue) => setTabValue(newValue);

  // Edit mode handlers
  const handleEditClick = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileImagePreview(null); // Clear any new image preview
    // Reset editedPatient to current patient state.
    // profileImage for editedPatient should be null (for new uploads) or original if needed for some logic,
    // but generally, we rely on `displayableProfileImageUrl` for existing S3 image.
    setEditedPatient({ ...patient, profileImage: null }); 
    if (patient && patient.profileImage) {
      setDisplayableProfileImageUrl(getDisplayableS3Url(patient.profileImage));
    } else {
      setDisplayableProfileImageUrl(null);
    }
  };

  // Save changes to patient
  const handleSaveChanges = async () => {
    if (!editedPatient || !editedPatient.id) {
      setSnackbarMessage("Error: Patient data is missing.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    try {
      // Prepare data for update (DynamoDB structure if needed)
      const updated = await updatePatient(editedPatient.id, editedPatient);
      setPatient(updated);
      setEditedPatient({ ...updated });
      setIsEditing(false);
      setSnackbarMessage("Patient details updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage(
        `Error updating patient: ${err.message || "Unknown error"}`
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profileImageFile" && files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result); // Set preview for the new image
        setEditedPatient((prev) => ({ ...prev, profileImage: reader.result })); // Store base64 for upload
        setDisplayableProfileImageUrl(null); // Hide existing S3 image when new one is chosen
      };
      reader.readAsDataURL(file);
    } else {
      setEditedPatient((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dobString) => {
    if (!dobString) return "";
    const birthDate = new Date(dobString);
    const today = new Date();
    if (isNaN(birthDate.getTime())) return "N/A";
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age >= 0 ? age : "N/A";
  };

  // Refresh patient data from API
  const refreshPatientData = async () => {
    if (!id) return;
    try {
      const refreshedPatient = await patientService.fetchPatientById(id);
      if (refreshedPatient) {
        setPatient(refreshedPatient); // This will trigger the useEffect for displayableProfileImageUrl
        // Reset profileImage in editedPatient (for new uploads) and preview
        setEditedPatient({ ...refreshedPatient, profileImage: null }); 
        setProfileImagePreview(null);
        setSnackbarMessage("Patient data refreshed.");
        setSnackbarSeverity("info");
      } else {
        setSnackbarMessage("Patient not found after refresh.");
        setSnackbarSeverity("warning");
      }
    } catch (err) {
      setSnackbarMessage("Failed to refresh patient data.");
      setSnackbarSeverity("error");
    }
    setSnackbarOpen(true);
  };

  // Determine role for consistent navigation and UI
  const getRole = () => {
    if (window.location.pathname.startsWith("/doctor")) return "doctor";
    if (window.location.pathname.startsWith("/frontdesk")) return "frontdesk";
    return "admin";
  };

  // Consistent back navigation for all roles
  const handleBackClick = () => {
    const role = getRole();
    if (role === "doctor") navigate("/doctor/patients");
    else if (role === "frontdesk") navigate("/frontdesk/patients");
    else navigate("/admin/patients");
  };

  // Navigation and snackbar handlers
  const handleSnackbarClose = () => setSnackbarOpen(false);

  // Loading, error, and not-found states
  if (loading && !patient) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 4,
          }}
        >
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Loading patient information...</Typography>
        </Box>
      </Container>
    );
  }
  if (error && !patient) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Failed to load patient data"}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
        >
          Return to Patients
        </Button>
      </Container>
    );
  }
  if (!loading && !error && !patient) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Patient information not found
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackClick}
            >
              Return to Patients
            </Button>
          </Box>
        </Paper>
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

  // Main render
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with back button and actions */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={handleBackClick} sx={{ mr: 2 }} aria-label="back">
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 500, flexGrow: 1 }}
        >
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
          <Box>
            <Button
              startIcon={<EditIcon />}
              variant="contained"
              color="primary"
              onClick={handleEditClick}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <IconButton
              color="primary"
              onClick={refreshPatientData}
              aria-label="refresh"
              title="Refresh patient data"
            >
              <SyncIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Patient summary card */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {/* Date of Birth */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date of Birth
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="dateOfBirth"
                    type="date"
                    value={editedPatient.dateOfBirth || editedPatient.dob || ""}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    margin="dense"
                  />
                ) : (
                  <Typography variant="body1">
                    {patient.dateOfBirth || patient.dob || "N/A"}
                    {patient.dateOfBirth || patient.dob
                      ? ` (${calculateAge(
                          patient.dateOfBirth || patient.dob
                        )} years)`
                      : ""}
                  </Typography>
                )}
              </Grid>
              {/* Gender */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Gender
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="gender"
                    value={editedPatient.gender || ""}
                    onChange={handleInputChange}
                    size="small"
                    margin="dense"
                  />
                ) : (
                  <Typography variant="body1">
                    {patient.gender || "N/A"}
                  </Typography>
                )}
              </Grid>
              {/* Phone */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Phone
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="phone"
                    value={editedPatient.phone || ""}
                    onChange={handleInputChange}
                    size="small"
                    margin="dense"
                  />
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <PhoneIcon
                      fontSize="small"
                      sx={{ mr: 1, color: "primary.main" }}
                    />
                    <Typography variant="body1">
                      {patient.phone || "N/A"}
                    </Typography>
                  </Box>
                )}
              </Grid>
              {/* Email */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="email"
                    value={editedPatient.email || ""}
                    onChange={handleInputChange}
                    size="small"
                    margin="dense"
                  />
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <EmailIcon
                      fontSize="small"
                      sx={{ mr: 1, color: "primary.main" }}
                    />
                    <Typography variant="body1">
                      {patient.email || "N/A"}
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {/* Address */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Address
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="address"
                    value={editedPatient.address || ""}
                    onChange={handleInputChange}
                    size="small"
                    margin="dense"
                  />
                ) : (
                  <Typography variant="body1">
                    {patient.address || "N/A"}
                  </Typography>
                )}
              </Grid>
              {/* Insurance Provider */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Insurance Provider
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="insuranceProvider"
                    value={editedPatient.insuranceProvider || ""}
                    onChange={handleInputChange}
                    size="small"
                    margin="dense"
                  />
                ) : (
                  <Typography variant="body1">
                    {patient.insuranceProvider || "N/A"}
                  </Typography>
                )}
              </Grid>
              {/* Insurance Number */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Insurance Number
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="insuranceNumber"
                    value={editedPatient.insuranceNumber || ""}
                    onChange={handleInputChange}
                    size="small"
                    margin="dense"
                  />
                ) : (
                  <Typography variant="body1">
                    {patient.insuranceNumber || "N/A"}
                  </Typography>
                )}
              </Grid>
              {/* Status */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                {isEditing ? (
                  <TextField
                    select
                    fullWidth
                    name="status"
                    value={editedPatient.status || "Active"}
                    onChange={handleInputChange}
                    size="small"
                    margin="dense"
                    SelectProps={{ native: true }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </TextField>
                ) : (
                  <Chip
                    label={patient.status || "Active"}
                    color={patient.status === "Active" ? "success" : "default"}
                    size="small"
                  />
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs for patient sections */}
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
            editedPatient={editedPatient} // Contains other fields, and profileImage (base64 of new file)
            handleInputChange={handleInputChange}
            // Determine the correct image URL to display in PersonalInfoTab
            imageUrlToDisplay={profileImagePreview || displayableProfileImageUrl}
          />
        )}
        {tabValue === 1 && (
          <MedicalInfoTab patient={patient} isEditing={isEditing} />
        )}
        {tabValue === 2 && <AppointmentsTab patientId={patient?.id} />}
        {tabValue === 3 && <MedicalRecordsTab patientId={patient?.id} />}
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
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default PatientDetailPage;
