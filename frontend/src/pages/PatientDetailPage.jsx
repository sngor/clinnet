// src/pages/PatientDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDisplayableS3Url } from "../utils/s3Utils";
import { calculateAge } from "../utils/dateUtils"; // Import calculateAge
import {
  // Container, // Replaced by PageLayout
  Box,
  // Typography, // Replaced by UI kit components
  // Paper, // Replaced by SectionContainer/CardContainer
  Grid,
  // Button, // Replaced by UI kit components
  Chip, // Keep for now, style guide doesn't specify
  Tab, // Keep for now
  Tabs, // Keep for now
  // IconButton, // Replaced by AppIconButton
  Alert, // Keep for now
  Snackbar, // Keep for now
  // TextField, // Assuming handled by child components or not directly here
  CircularProgress, // Keep for specific loading instances if any
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
import {
  LoadingIndicator,
  PageLayout,
  PrimaryButton,
  SecondaryButton,
  TextButton,
  AppIconButton,
  SectionContainer, // Using SectionContainer for larger grouping
  CardContainer, // Could use for smaller cards if needed
  PageTitle,
  BodyText,
  SecondaryText,
} from "../components/ui";

// Tab components
import MedicalInfoTab from "../components/patients/MedicalInfoTab";
import AppointmentsTab from "../components/patients/AppointmentsTab";
import MedicalRecordsTab from "../components/patients/MedicalRecordsTab";
import PersonalInfoTab from "../components/patients/PersonalInfoTab";

import patientService from "../services/patients";
import { fileToDataUri } from "../utils/fileUtils";

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
        // Always fetch directly from backend for latest info
        const { data: fetchedPatient, error } =
          await patientService.fetchPatientById(id);
        if (isMounted) {
          if (error || !fetchedPatient) {
            setPatient(null); // Patient not found
            setEditedPatient(null);
            setPageError(error ? error.message : "Patient not found.");
          } else {
            loadPatientDataIntoState(fetchedPatient);
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
  }, [id]); // Only depend on id, not contextPatients

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
      const dataUri = await fileToDataUri(file);
      setProfileImagePreview(dataUri); // Set preview for the new image
      setEditedPatient((prev) => ({ ...prev, profileImage: dataUri })); // Store base64 for upload
      setDisplayableProfileImageUrl(null); // Hide existing S3 image when new one is chosen
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
    // Using PageLayout to provide consistent structure even for loading state
    return (
      <PageLayout
        title="Loading Patient..."
        subtitle="Please wait."
        showBackButton
        onBack={handleBackClick}
      >
        <LoadingIndicator
          size="large"
          message="Loading patient information..."
        />
      </PageLayout>
    );
  }

  if (pageError) {
    return (
      <PageLayout
        title="Error"
        subtitle="Could not load patient data."
        showBackButton
        onBack={handleBackClick}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          {pageError}
        </Alert>
        <PrimaryButton startIcon={<ArrowBackIcon />} onClick={handleBackClick}>
          Return to Patients
        </PrimaryButton>
      </PageLayout>
    );
  }

  if (!patient) {
    return (
      <PageLayout
        title="Not Found"
        subtitle="Patient not found."
        showBackButton
        onBack={handleBackClick}
      >
        <SectionContainer sx={{ textAlign: "center" }}>
          <BodyText sx={{ mb: 2 }}>
            Patient information not found or an error occurred.
          </BodyText>
          <PrimaryButton
            startIcon={<ArrowBackIcon />}
            onClick={handleBackClick}
          >
            Return to Patients
          </PrimaryButton>
        </SectionContainer>
      </PageLayout>
    );
  }

  const pageTitle = `${patient.firstName} ${patient.lastName}`;
  const headerActions = isEditing ? (
    <Box>
      <PrimaryButton
        startIcon={<SaveIcon />}
        onClick={handleSaveChanges}
        sx={{ mr: 1 }}
      >
        Save
      </PrimaryButton>
      <SecondaryButton startIcon={<CancelIcon />} onClick={handleCancelEdit}>
        Cancel
      </SecondaryButton>
    </Box>
  ) : (
    <Box>
      <PrimaryButton
        startIcon={<EditIcon />}
        onClick={handleEditClick}
        sx={{ mr: 1 }}
      >
        Edit
      </PrimaryButton>
      <AppIconButton
        icon={SyncIcon}
        color="primary"
        onClick={refreshPatientData}
        aria-label="refresh"
        tooltip="Refresh patient data"
      />
    </Box>
  );

  // Main render
  return (
    <PageLayout
      title={pageTitle}
      action={headerActions}
      showBackButton
      onBack={handleBackClick}
      maxWidth="xl"
    >
      {/* Personal Info and Medical Info always visible at the top */}
      <SectionContainer sx={{ mb: 3 }}>
        {" "}
        {/* Was Paper */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <PersonalInfoTab
              patient={patient}
              isEditing={isEditing}
              editedPatient={editedPatient}
              handleInputChange={handleInputChange}
              imageUrlToDisplay={
                profileImagePreview || displayableProfileImageUrl
              }
              onEditClick={handleEditClick}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MedicalInfoTab
              patient={patient}
              isEditing={isEditing && getRole() === "doctor"}
              editedPatient={editedPatient}
              handleInputChange={handleInputChange}
              // No edit button in container
            />
          </Grid>
        </Grid>
      </SectionContainer>

      {/* Tabs for patient sections (remove Personal Info and Medical Info tabs) */}
      <Box sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Appointments" />
          <Tab label="Medical Records" />
        </Tabs>
      </Box>

      {/* Tab content (remove PersonalInfoTab and MedicalInfoTab from here) */}
      <SectionContainer>
        {" "}
        {/* Was Paper */}
        {tabValue === 0 && <AppointmentsTab patientId={patient?.id} />}
        {tabValue === 1 && <MedicalRecordsTab patientId={patient?.id} />}
      </SectionContainer>

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
    </PageLayout>
  );
}

export default PatientDetailPage;
