// src/components/patients/PersonalInfoTab.jsx
import React from "react";
import { Grid, Typography, TextField, Box } from "@mui/material";

function PersonalInfoTab({
  patient,
  isEditing,
  editedPatient,
  handleInputChange,
}) {
  // Safety check for null/undefined patient or editedPatient
  if (!patient) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1">
          Patient information is not available.
        </Typography>
      </Box>
    );
  }

  // Ensure editedPatient exists to prevent null reference errors
  const safeEditedPatient = editedPatient || patient;

  return (
    <Grid container spacing={3}>
      <Grid sx={{ width: { xs: "100%", md: "50%" }, p: 1.5 }}>
        <Grid container spacing={2}>
          <Grid sx={{ width: "100%" }}>
            <Typography variant="subtitle1" fontWeight={500} gutterBottom>
              Contact Information
            </Typography>
          </Grid>

          <Grid sx={{ width: { xs: "100%", sm: "50%" }, p: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              First Name
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                name="firstName"
                value={safeEditedPatient.firstName || ""}
                onChange={handleInputChange}
                size="small"
                margin="dense"
              />
            ) : (
              <Typography variant="body1">
                {patient.firstName || "N/A"}
              </Typography>
            )}
          </Grid>

          <Grid sx={{ width: { xs: "100%", sm: "50%" }, p: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Last Name
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                name="lastName"
                value={safeEditedPatient.lastName || ""}
                onChange={handleInputChange}
                size="small"
                margin="dense"
              />
            ) : (
              <Typography variant="body1">
                {patient.lastName || "N/A"}
              </Typography>
            )}
          </Grid>

          <Grid sx={{ width: "100%", p: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Address
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                name="address"
                value={safeEditedPatient.address || ""}
                onChange={handleInputChange}
                size="small"
                margin="dense"
                multiline
                rows={2}
              />
            ) : (
              <Typography variant="body1">
                {patient.address || "N/A"}
              </Typography>
            )}
          </Grid>

          <Grid sx={{ width: { xs: "100%", sm: "50%" }, p: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              City
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                name="city"
                value={safeEditedPatient.city || ""}
                onChange={handleInputChange}
                size="small"
                margin="dense"
              />
            ) : (
              <Typography variant="body1">{patient.city || "N/A"}</Typography>
            )}
          </Grid>

          <Grid sx={{ width: { xs: "100%", sm: "50%" }, p: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              State
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                name="state"
                value={safeEditedPatient.state || ""}
                onChange={handleInputChange}
                size="small"
                margin="dense"
              />
            ) : (
              <Typography variant="body1">{patient.state || "N/A"}</Typography>
            )}
          </Grid>

          <Grid sx={{ width: { xs: "100%", sm: "50%" }, p: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Zip Code
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                name="zipCode"
                value={safeEditedPatient.zipCode || ""}
                onChange={handleInputChange}
                size="small"
                margin="dense"
              />
            ) : (
              <Typography variant="body1">
                {patient.zipCode || "N/A"}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Grid>

      <Grid sx={{ width: { xs: "100%", md: "50%" }, p: 1.5 }}>
        <Grid container spacing={2}>
          <Grid sx={{ width: "100%" }}>
            <Typography variant="subtitle1" fontWeight={500} gutterBottom>
              Emergency Contact
            </Typography>
          </Grid>

          <Grid sx={{ width: { xs: "100%", sm: "50%" }, p: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Emergency Contact Name
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                name="emergencyContactName"
                value={safeEditedPatient.emergencyContactName || ""}
                onChange={handleInputChange}
                size="small"
                margin="dense"
              />
            ) : (
              <Typography variant="body1">
                {patient.emergencyContactName || "N/A"}
              </Typography>
            )}
          </Grid>

          <Grid sx={{ width: { xs: "100%", sm: "50%" }, p: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Emergency Contact Phone
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                name="emergencyContactPhone"
                value={safeEditedPatient.emergencyContactPhone || ""}
                onChange={handleInputChange}
                size="small"
                margin="dense"
              />
            ) : (
              <Typography variant="body1">
                {patient.emergencyContactPhone || "N/A"}
              </Typography>
            )}
          </Grid>

          <Grid sx={{ width: "100%", p: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Relationship
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                name="emergencyContactRelationship"
                value={safeEditedPatient.emergencyContactRelationship || ""}
                onChange={handleInputChange}
                size="small"
                margin="dense"
              />
            ) : (
              <Typography variant="body1">
                {patient.emergencyContactRelationship || "N/A"}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default PersonalInfoTab;
