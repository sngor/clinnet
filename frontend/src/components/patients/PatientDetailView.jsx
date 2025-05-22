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
  const [isEditing, setIsEditing] = useState(false);
  const [tabValue, setTabValue] = useState(0);

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
      // Safety check
      if (!patient || !patient.id) {
        console.error(
          "Cannot save changes: patient or patient ID is undefined"
        );
        return;
      }

      // Format data for API following DynamoDB structure
      const patientData = {
        firstName: editedPatient.firstName,
        lastName: editedPatient.lastName,
        dateOfBirth: editedPatient.dateOfBirth || editedPatient.dob,
        phone: editedPatient.phone,
        email: editedPatient.email,
        address: editedPatient.address,
        insuranceProvider: editedPatient.insuranceProvider,
        insuranceNumber: editedPatient.insuranceNumber,
        status: editedPatient.status || "Active",
        updatedAt: new Date().toISOString(),
      };

      // Only include DynamoDB-specific fields if they exist in the original patient
      if (patient.PK) patientData.PK = patient.PK;
      if (patient.SK) patientData.SK = patient.SK;
      if (patient.GSI1PK) patientData.GSI1PK = patient.GSI1PK;
      if (patient.GSI1SK) patientData.GSI1SK = patient.GSI1SK;
      if (patient.GSI2PK) patientData.GSI2PK = patient.GSI2PK;
      if (patient.GSI2SK) patientData.GSI2SK = patient.GSI2SK;
      patientData.id = patient.id;
      patientData.type = "PATIENT";

      console.log("Updating patient with data:", patientData);
      
      try {
        await updatePatient(patient.id, patientData);
        
        // Update local state
        setIsEditing(false);
        
        // Refresh patients list
        if (refreshPatients) {
          refreshPatients();
        }
        
        // Close the dialog if needed
        if (onClose) {
          onClose();
        }
      } catch (updateError) {
        console.error("Error during updatePatient:", updateError);
        
        // Fallback: Try to update using a direct API call if the service method fails
        try {
          const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
          const response = await fetch(`${API_ENDPOINT}/patients/${patient.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-HTTP-Method-Override': 'PUT'
            },
            body: JSON.stringify(patientData)
          });
          
          if (response.ok) {
            console.log("Patient updated successfully via fallback method");
            setIsEditing(false);
            if (refreshPatients) refreshPatients();
            if (onClose) onClose();
          } else {
            throw new Error(`API responded with status: ${response.status}`);
          }
        } catch (fallbackError) {
          console.error("Fallback update method also failed:", fallbackError);
          alert("Could not update patient information. Please try again later.");
        }
      }
    } catch (error) {
      console.error("Error updating patient:", error);
      alert("An error occurred while saving patient information.");
    }
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedPatient((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {patient.firstName} {patient.lastName}
        </Typography>

        {isEditing ? (
          <Box>
            <Button
              startIcon={<SaveIcon />}
              variant="contained"
              color="secondary"
              onClick={handleSaveChanges}
              sx={{ mr: 1 }}
            >
              Save
            </Button>
            <Button
              startIcon={<CancelIcon />}
              variant="outlined"
              color="inherit"
              onClick={handleCancelEdit}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
          </Box>
        ) : (
          <Button
            startIcon={<EditIcon />}
            variant="contained"
            color="secondary"
            onClick={handleEditClick}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
        )}

        <IconButton color="inherit" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Patient summary */}
      <Box sx={{ p: 2, bgcolor: "background.default" }}>
        <Grid container spacing={2}>
          <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1 }}>
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

          <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1 }}>
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

          <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1 }}>
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

          <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1 }}>
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
                SelectProps={{
                  native: true,
                }}
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
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Personal Info" />
          <Tab label="Medical Info" />
          <Tab label="Appointments" />
          {(mode === "doctor" || mode === "admin") && (
            <Tab label="Medical Records" />
          )}
        </Tabs>
      </Box>

      {/* Tab content */}
      <Box sx={{ p: 2, flexGrow: 1, overflow: "auto" }}>
        {tabValue === 0 && (
          <PersonalInfoTab
            patient={patient}
            isEditing={isEditing}
            editedPatient={editedPatient}
            handleInputChange={handleInputChange}
          />
        )}
        {tabValue === 1 && (
          <MedicalInfoTab patient={patient} isEditing={isEditing} />
        )}
        {tabValue === 2 && <AppointmentsTab patientId={patient.id} />}
        {tabValue === 3 && (mode === "doctor" || mode === "admin") && (
          <MedicalRecordsTab patientId={patient.id} />
        )}
      </Box>
    </Box>
  );
}

export default PatientDetailView;
