// src/features/appointments/components/WalkInFormModal.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  // Add Select for Doctor if needed later
} from "@mui/material";

function WalkInFormModal({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    patientName: "",
    reason: "",
    // doctorId: '', // Add later if needed
  });
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientName.trim())
      newErrors.patientName = "Patient name is required";
    if (!formData.reason.trim())
      newErrors.reason = "Reason for visit is required";
    // Add validation for doctor selection if added
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      onSubmit(formData); // Pass data up
      // Reset form for next time (optional, could be done on open)
      setFormData({ patientName: "", reason: "" });
      setErrors({});
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add Walk-in Patient</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="patientName"
            label="Patient Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.patientName}
            onChange={handleChange}
            error={!!errors.patientName}
            helperText={errors.patientName}
          />
          <TextField
            margin="dense"
            name="reason"
            label="Reason for Visit"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.reason}
            onChange={handleChange}
            error={!!errors.reason}
            helperText={errors.reason}
          />
          {/* Add Doctor Select dropdown here later */}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Check-in Walk-in
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default WalkInFormModal;
