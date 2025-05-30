// src/components/patients/PatientDetailView.jsx
import React, { useState } from "react";
import {
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
  TextField,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { useAppData } from "../../app/providers/DataProvider";
import patientService from "../../services/patients";

// Import tab components
import PersonalInfoTab from "./PersonalInfoTab";
import MedicalInfoTab from "./MedicalInfoTab";
import AppointmentsTab from "./AppointmentsTab";
import MedicalRecordsTab from "./MedicalRecordsTab";

function PatientDetailView({ patient, onClose, mode = "doctor" }) {
  const { updatePatient, refreshPatients } = useAppData();

  // Safety check for null/undefined patient
  if (!patient) {
    return (
      <Paper sx={{ p: 3, my: 2, borderRadius: 2 }}>
        <Typography variant="h6" align="center">
          Patient information not available
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Paper>
    );
  }

  const [editedPatient, setEditedPatient] = useState(patient);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingMedical, setIsEditingMedical] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Personal Info edit handlers
  const handleEditPersonal = () => setIsEditingPersonal(true);
  const handleCancelEditPersonal = () => {
    setIsEditingPersonal(false);
    setEditedPatient(patient);
  };
  const handleSavePersonal = async () => {
    try {
      if (!patient || !patient.id) return;
      const patientData = {
        ...editedPatient,
        updatedAt: new Date().toISOString(),
        type: "PATIENT",
      };
      await updatePatient(patient.id, patientData);
      setIsEditingPersonal(false);
      if (refreshPatients) refreshPatients();
    } catch (error) {
      console.error("Error updating patient:", error);
      alert("An error occurred while saving patient information.");
    }
  };

  // Medical Info edit handlers
  const handleEditMedical = () => setIsEditingMedical(true);
  const handleCancelEditMedical = () => {
    setIsEditingMedical(false);
    setEditedPatient(patient);
  };
  const handleSaveMedical = async () => {
    try {
      if (!patient || !patient.id) return;
      const patientData = {
        ...editedPatient,
        updatedAt: new Date().toISOString(),
        type: "PATIENT",
      };
      await updatePatient(patient.id, patientData);
      setIsEditingMedical(false);
      if (refreshPatients) refreshPatients();
    } catch (error) {
      console.error("Error updating patient:", error);
      alert("An error occurred while saving patient information.");
    }
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedPatient((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Personal Info always visible at the top */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Personal Information</Typography>
          {isEditingPersonal ? (
            <Box>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleSavePersonal}
                sx={{ mr: 1 }}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleCancelEditPersonal}
              >
                Cancel
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleEditPersonal}
            >
              Edit
            </Button>
          )}
        </Box>
        <PersonalInfoTab
          patient={patient}
          isEditing={isEditingPersonal}
          editedPatient={editedPatient}
          handleInputChange={handleInputChange}
        />
      </Paper>

      {/* Tabs for patient sections (Medical Info, Appointments, Medical Records) */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Medical Info" />
          <Tab label="Appointments" />
          {(mode === "doctor" || mode === "admin") && (
            <Tab label="Medical Records" />
          )}
        </Tabs>
      </Box>
      <Box sx={{ p: 2, flexGrow: 1, overflow: "auto" }}>
        {tabValue === 0 && (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Medical Information</Typography>
              {mode === "doctor" && (
                <>
                  {isEditingMedical ? (
                    <Box>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleSaveMedical}
                        sx={{ mr: 1 }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleCancelEditMedical}
                      >
                        Cancel
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleEditMedical}
                    >
                      Edit
                    </Button>
                  )}
                </>
              )}
            </Box>
            <MedicalInfoTab
              patient={patient}
              isEditing={isEditingMedical}
              editedPatient={editedPatient}
              handleInputChange={handleInputChange}
            />
          </Paper>
        )}
        {tabValue === 1 && <AppointmentsTab patientId={patient.id} />}
        {tabValue === 2 && (mode === "doctor" || mode === "admin") && (
          <MedicalRecordsTab patientId={patient.id} />
        )}
      </Box>
    </Box>
  );
}

export default PatientDetailView;
