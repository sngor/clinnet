// src/features/appointments/components/WalkInFormModal.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Divider,
  Autocomplete,
} from "@mui/material";

// Mock data for doctors
const mockDoctors = [
  { id: 1, name: "Dr. Smith", specialty: "General Medicine" },
  { id: 2, name: "Dr. Jones", specialty: "Cardiology" },
  { id: 3, name: "Dr. Wilson", specialty: "Pediatrics" },
  { id: 4, name: "Dr. Taylor", specialty: "Dermatology" },
];

function WalkInFormModal({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    reason: "",
    doctorId: "",
    doctorName: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.patientName.trim()) {
      newErrors.patientName = "Patient name is required";
    }

    if (!formData.patientPhone.trim()) {
      newErrors.patientPhone = "Phone number is required";
    } else if (!/^[0-9+\-() ]{10,15}$/.test(formData.patientPhone)) {
      newErrors.patientPhone = "Please enter a valid phone number";
    }

    if (
      formData.patientEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.patientEmail)
    ) {
      newErrors.patientEmail = "Please enter a valid email address";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Reason for visit is required";
    }

    if (!formData.doctorId) {
      newErrors.doctorId = "Please select a doctor";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Format data in DynamoDB structure for compatibility with patient service
      const patientId = `${Date.now()}`; // Simple ID generation
      const walkInData = {
        ...formData,
        patient: {
          id: patientId,
          PK: `PAT#${patientId}`,
          SK: "PROFILE#1",
          GSI1PK: "CLINIC#DEFAULT",
          GSI1SK: `PAT#${patientId}`,
          GSI2PK: `PAT#${patientId}`,
          GSI2SK: "PROFILE#1",
          type: "PATIENT",
          firstName: formData.patientName.split(" ")[0],
          lastName: formData.patientName.split(" ").slice(1).join(" "),
          phone: formData.patientPhone,
          email: formData.patientEmail,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      onSubmit(walkInData);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      patientName: "",
      patientPhone: "",
      patientEmail: "",
      reason: "",
      doctorId: "",
      doctorName: "",
      notes: "",
    });
    setSelectedDoctor(null);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 2,
          fontWeight: 500,
        }}
      >
        Register Walk-In Patient
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 500 }}>
          Enter patient information to register a walk-in appointment
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography
              variant="subtitle2"
              color="primary"
              sx={{ mb: 1, fontWeight: 500 }}
            >
              Patient Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              name="patientName"
              label="Patient Name"
              fullWidth
              required
              value={formData.patientName}
              onChange={handleChange}
              error={!!errors.patientName}
              helperText={errors.patientName}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              name="patientPhone"
              label="Phone Number"
              fullWidth
              required
              value={formData.patientPhone}
              onChange={handleChange}
              error={!!errors.patientPhone}
              helperText={errors.patientPhone}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="patientEmail"
              label="Email Address"
              fullWidth
              type="email"
              value={formData.patientEmail}
              onChange={handleChange}
              error={!!errors.patientEmail}
              helperText={errors.patientEmail}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography
              variant="subtitle2"
              color="primary"
              sx={{ mb: 1, fontWeight: 500 }}
            >
              Appointment Details
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="reason"
              label="Reason for Visit"
              fullWidth
              required
              value={formData.reason}
              onChange={handleChange}
              error={!!errors.reason}
              helperText={errors.reason}
            />
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              options={mockDoctors}
              getOptionLabel={(option) =>
                `${option.name} (${option.specialty})`
              }
              value={selectedDoctor}
              onChange={(event, newValue) => {
                setSelectedDoctor(newValue);
                if (newValue) {
                  setFormData({
                    ...formData,
                    doctorId: newValue.id,
                    doctorName: newValue.name,
                  });

                  // Clear error when field is edited
                  if (errors.doctorId) {
                    setErrors((prev) => ({
                      ...prev,
                      doctorId: null,
                    }));
                  }
                } else {
                  setFormData({
                    ...formData,
                    doctorId: "",
                    doctorName: "",
                  });
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Doctor"
                  required
                  error={!!errors.doctorId}
                  helperText={errors.doctorId}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="notes"
              label="Additional Notes"
              fullWidth
              multiline
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter any additional information about the patient or visit"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}
      >
        <Button onClick={handleClose} sx={{ color: "text.secondary" }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ px: 3 }}>
          Register Walk-In
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default WalkInFormModal;
