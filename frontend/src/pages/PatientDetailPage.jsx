// src/pages/PatientDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDisplayableS3Url } from "../utils/s3Utils";
import { calculateAge } from "../utils/dateUtils"; // Import calculateAge
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
import MedicalInfoTab from "../components/patients/MedicalInfoTab";
import AppointmentsTab from "../components/patients/AppointmentsTab";
import MedicalRecordsTab from "../components/patients/MedicalRecordsTab";
import PersonalInfoTab from "../components/patients/PersonalInfoTab";

import patientService from "../services/patients";

/**
 * PatientDetailPage displays and allows editing of a single patient's details.
 * Handles loading, error, and not-found states, and provides tabbed navigation.
 */
function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Alias patients from context to avoid confusion with local patient state
  const {
    patients: contextPatients,
    loading: contextLoading,
    error: contextError,
    updatePatient,
    refreshPatients, // <-- Add this
  } = useAppData();
  // const { getDisplayableS3Url } = require('../../utils/s3Utils'); // Removed require, using ES6 import now

  // State for patient data and UI
  const [patient, setPatient] = useState(null);
  const [pageLoading, setPageLoading] = useState(true); // Local loading state for this page
  const [pageError, setPageError] = useState(null); // Local error state for this page
  const [editedPatient, setEditedPatient] = useState(null); // Will include profileImage (base64 for new upload)
  const [profileImagePreview, setProfileImagePreview] = useState(null); // For new image base64 preview
  const [displayableProfileImageUrl, setDisplayableProfileImageUrl] =
    useState(null); // For existing S3 image URL
  const [isEditing, setIsEditing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // getDisplayableS3Url is now imported from ../../utils/s3Utils

  // Effect to update displayableProfileImageUrl when patient data changes
  useEffect(() => {
    if (patient && patient.profileImage) {
      setDisplayableProfileImageUrl(getDisplayableS3Url(patient.profileImage));
    } else if (!patient) {
      // Clear image if patient is null (e.g. not found or error)
      setDisplayableProfileImageUrl(null);
    }
  }, [patient]);

  // Helper function to load patient data into state (used by fetch and context)
  const loadPatientDataIntoState = (patientSource) => {
    setPatient(patientSource);
    // Initialize editedPatient. profileImage here is for *new* uploads.
    setEditedPatient({ ...patientSource, profileImage: null });
    setProfileImagePreview(null); // Clear any previous preview
    // displayableProfileImageUrl will be updated by the useEffect above
  };

  // Primary data loading effect
  useEffect(() => {
    if (!id) {
      setPageLoading(false);
      setPageError("No patient ID provided.");
      setPatient(null);
      return;
    }

    let isMounted = true;
    setPageLoading(true);
    setPageError(null);

    const loadPatient = async () => {
      try {
        // Optional: Attempt to load from context first as a quick cache
        // This check is done outside the main fetch flow to avoid contextPatients dependency for the API call part
        if (contextPatients && contextPatients.length > 0) {
          const patientFromContext = contextPatients.find((p) => p.id === id);
          if (patientFromContext) {
            if (isMounted) {
              loadPatientDataIntoState(patientFromContext);
              // Decide if we still want to fetch for freshness. For now, let's assume context is good enough if found.
              // If a fetch is still desired, this could set initial state then proceed to fetch.
              // For this refactor, if found in context, we might skip the immediate fetch or make it conditional.
              // Let's proceed to fetch to ensure data is up-to-date, context can be for initial render.
              // setPageLoading(false); // If context is considered definitive initially
              // return;
            }
          }
        }

        // Primary: Fetch directly
        const fetchedPatient = await patientService.fetchPatientById(id);
        if (isMounted) {
          if (fetchedPatient) {
            loadPatientDataIntoState(fetchedPatient);
          } else {
            setPatient(null); // Patient not found
            setEditedPatient(null);
            setPageError("Patient not found.");
          }
        }
      } catch (err) {
        console.error("Error fetching patient by ID:", err);
        if (isMounted) {
          setPatient(null);
          setEditedPatient(null);
          setPageError(err.message || "Failed to fetch patient data.");
        }
      } finally {
        if (isMounted) {
          setPageLoading(false);
        }
      }
    };

    loadPatient();

    return () => {
      isMounted = false;
    };
  }, [id, contextPatients]); // Depend on id. contextPatients is included for the cache check.
  // If contextPatients causes too many re-fetches, the cache check logic
  // might need to be more sophisticated or removed from this effect's direct trigger.
  // For now, this allows context to provide initial data if available.

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
      // Prepare data for backend (DynamoDB)
      const patientData = {
        ...editedPatient,
        dateOfBirth: editedPatient.dateOfBirth || editedPatient.dob,
        updatedAt: new Date().toISOString(),
        type: "PATIENT",
      };
      // Remove fields not needed by backend
      delete patientData.profileImagePreview;
      // Save to backend and update context
      const { data: updated, error } = await updatePatient(
        editedPatient.id,
        patientData
      );
      if (error) throw error;
      setPatient(updated);
      setEditedPatient({ ...updated });
      setIsEditing(false);
      setSnackbarMessage("Patient details updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      // Refresh all patients in context to ensure lists are up-to-date
      if (refreshPatients) await refreshPatients();
      // Refetch from backend to ensure sync with DynamoDB
      const freshPatient = await patientService.fetchPatientById(
        editedPatient.id
      );
      if (freshPatient) {
        setPatient(freshPatient);
        setEditedPatient({ ...freshPatient });
      }
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

  // Calculate age from date of birth is now imported from dateUtils

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

  // Loading, error, and not-found states using local pageLoading/pageError
  if (pageLoading) {
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

  if (pageError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {pageError}
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

  if (!patient) {
    // This covers patient not found after loading completed without error, or if patient becomes null
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Patient information not found or an error occurred.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackClick}
          >
            Return to Patients
          </Button>
        </Paper>
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

      {/* Personal Info always visible at the top */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <PersonalInfoTab
          patient={patient}
          isEditing={isEditing}
          editedPatient={editedPatient}
          handleInputChange={handleInputChange}
          imageUrlToDisplay={profileImagePreview || displayableProfileImageUrl}
          onEditClick={handleEditClick}
        />
      </Paper>

      {/* Tabs for patient sections (remove Personal Info tab) */}
      <Box sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Medical Info" />
          <Tab label="Appointments" />
          <Tab label="Medical Records" />
        </Tabs>
      </Box>

      {/* Tab content (remove PersonalInfoTab from here) */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        {tabValue === 0 && (
          <MedicalInfoTab
            patient={patient}
            isEditing={isEditing && getRole() === "doctor"}
            editedPatient={editedPatient}
            handleInputChange={handleInputChange}
            onEditClick={() => setIsEditing(true)}
          />
        )}
        {tabValue === 1 && <AppointmentsTab patientId={patient?.id} />}
        {tabValue === 2 && <MedicalRecordsTab patientId={patient?.id} />}
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
