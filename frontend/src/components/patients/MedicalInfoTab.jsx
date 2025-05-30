// src/components/patients/MedicalInfoTab.jsx
import React from "react";
import {
  Grid,
  Typography,
  TextField,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Button,
} from "@mui/material";

function MedicalInfoTab({
  patient,
  isEditing,
  editedPatient,
  handleInputChange,
  onEditClick,
}) {
  // Safety check for null/undefined patient
  if (!patient) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1">
          Medical information is not available.
        </Typography>
      </Box>
    );
  }

  // Use editedPatient if editing, otherwise patient
  const allergies =
    (isEditing ? editedPatient?.allergies : patient.allergies) || [];
  const medications =
    (isEditing ? editedPatient?.medications : patient.medications) || [];
  const medicalHistory =
    (isEditing ? editedPatient?.medicalHistory : patient.medicalHistory) || [];
  const notes = isEditing ? editedPatient?.notes : patient.notes;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Medical Information</Typography>
        {!isEditing && typeof onEditClick === "function" && (
          <Button
            variant="outlined"
            size="small"
            onClick={onEditClick}
            sx={{ ml: 2 }}
          >
            Edit
          </Button>
        )}
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight={500} gutterBottom>
            Allergies
          </Typography>
          {isEditing ? (
            <TextField
              fullWidth
              name="allergies"
              label="Allergies (comma separated)"
              value={
                Array.isArray(allergies)
                  ? allergies.join(", ")
                  : allergies || ""
              }
              onChange={(e) =>
                handleInputChange({
                  target: {
                    name: "allergies",
                    value: e.target.value
                      .split(",")
                      .map((a) => a.trim())
                      .filter(Boolean),
                  },
                })
              }
              size="small"
              margin="dense"
            />
          ) : allergies.length > 0 ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
              {allergies.map((allergy, index) => (
                <Chip
                  key={index}
                  label={allergy}
                  color="error"
                  variant="outlined"
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              No known allergies
            </Typography>
          )}
          <Typography variant="subtitle1" fontWeight={500} gutterBottom>
            Current Medications
          </Typography>
          {isEditing ? (
            <TextField
              fullWidth
              name="medications"
              label="Medications (comma separated)"
              value={
                Array.isArray(medications)
                  ? medications.map((m) => m.name).join(", ")
                  : medications || ""
              }
              onChange={(e) =>
                handleInputChange({
                  target: {
                    name: "medications",
                    value: e.target.value
                      .split(",")
                      .map((m) => ({ name: m.trim() }))
                      .filter((m) => m.name),
                  },
                })
              }
              size="small"
              margin="dense"
            />
          ) : medications.length > 0 ? (
            <List dense>
              {medications.map((medication, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={medication.name || medication}
                    secondary={
                      medication.dosage && medication.frequency
                        ? `${medication.dosage}, ${medication.frequency}`
                        : undefined
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No current medications
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight={500} gutterBottom>
            Medical History
          </Typography>
          {isEditing ? (
            <TextField
              fullWidth
              name="medicalHistory"
              label="Medical History (comma separated)"
              value={
                Array.isArray(medicalHistory)
                  ? medicalHistory.map((m) => m.condition).join(", ")
                  : medicalHistory || ""
              }
              onChange={(e) =>
                handleInputChange({
                  target: {
                    name: "medicalHistory",
                    value: e.target.value
                      .split(",")
                      .map((m) => ({ condition: m.trim() }))
                      .filter((m) => m.condition),
                  },
                })
              }
              size="small"
              margin="dense"
            />
          ) : medicalHistory.length > 0 ? (
            <List dense>
              {medicalHistory.map((condition, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={condition.condition || condition}
                    secondary={
                      condition.diagnosedDate
                        ? `Diagnosed: ${condition.diagnosedDate}`
                        : undefined
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No medical history recorded
            </Typography>
          )}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={500} gutterBottom>
              Notes
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                name="notes"
                label="Notes"
                value={notes || ""}
                onChange={handleInputChange}
                size="small"
                margin="dense"
                multiline
                rows={3}
              />
            ) : (
              <Paper
                variant="outlined"
                sx={{ p: 2, bgcolor: "background.default" }}
              >
                <Typography variant="body2">
                  {notes || "No medical notes available for this patient."}
                </Typography>
              </Paper>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default MedicalInfoTab;
