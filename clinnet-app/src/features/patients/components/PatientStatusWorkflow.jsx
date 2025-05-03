// src/features/patients/components/PatientStatusWorkflow.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckoutModal from "../../billing/components/CheckoutModal";

// Define the possible patient visit statuses
const PATIENT_STATUSES = {
  SCHEDULED: "Scheduled",
  CHECKED_IN: "Checked-in",
  IN_PROGRESS: "In Progress",
  READY_FOR_CHECKOUT: "Ready for Checkout",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// Map statuses to step numbers for the stepper
const STATUS_TO_STEP = {
  [PATIENT_STATUSES.SCHEDULED]: 0,
  [PATIENT_STATUSES.CHECKED_IN]: 1,
  [PATIENT_STATUSES.IN_PROGRESS]: 2,
  [PATIENT_STATUSES.READY_FOR_CHECKOUT]: 3,
  [PATIENT_STATUSES.COMPLETED]: 4,
  [PATIENT_STATUSES.CANCELLED]: -1,
};

function PatientStatusWorkflow({ patient, appointment, onStatusChange }) {
  const [currentStatus, setCurrentStatus] = useState(appointment?.status || PATIENT_STATUSES.SCHEDULED);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [notes, setNotes] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [statusToConfirm, setStatusToConfirm] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  
  // Get the current step for the stepper
  const currentStep = STATUS_TO_STEP[currentStatus];
  
  // Define the steps for the stepper
  const steps = [
    PATIENT_STATUSES.SCHEDULED,
    PATIENT_STATUSES.CHECKED_IN,
    PATIENT_STATUSES.IN_PROGRESS,
    PATIENT_STATUSES.READY_FOR_CHECKOUT,
    PATIENT_STATUSES.COMPLETED,
  ];
  
  // Handle status change button click
  const handleStatusChangeClick = (newStatus) => {
    setStatusToConfirm(newStatus);
    setNotes("");
    setConfirmDialogOpen(true);
  };
  
  // Handle confirming the status change
  const handleConfirmStatusChange = async () => {
    if (!statusToConfirm) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the status
      setCurrentStatus(statusToConfirm);
      
      // Notify parent component
      if (onStatusChange) {
        onStatusChange(statusToConfirm, notes);
      }
      
      // Show success message
      setSuccess(`Patient status updated to ${statusToConfirm}`);
      setTimeout(() => setSuccess(null), 3000);
      
      // If the new status is "Ready for Checkout" and we're moving from "In Progress",
      // we could automatically open the checkout modal
      if (statusToConfirm === PATIENT_STATUSES.READY_FOR_CHECKOUT && 
          currentStatus === PATIENT_STATUSES.IN_PROGRESS) {
        // Wait a moment before opening the checkout modal
        setTimeout(() => setCheckoutModalOpen(true), 500);
      }
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
    } finally {
      setLoading(false);
      setConfirmDialogOpen(false);
      setStatusToConfirm(null);
    }
  };
  
  // Handle opening the checkout modal
  const handleOpenCheckout = () => {
    setCheckoutModalOpen(true);
  };
  
  // Handle checkout completion
  const handleCheckoutComplete = (checkoutData) => {
    // In a real app, you would save this data to your backend
    console.log("Checkout completed:", checkoutData);
    
    // Update the status to completed
    setCurrentStatus(PATIENT_STATUSES.COMPLETED);
    
    // Notify parent component
    if (onStatusChange) {
      onStatusChange(PATIENT_STATUSES.COMPLETED, "Payment processed and checkout completed");
    }
    
    // Show success message
    setSuccess("Checkout completed successfully");
    setTimeout(() => setSuccess(null), 3000);
    
    // Close the checkout modal
    setCheckoutModalOpen(false);
  };
  
  // Determine if checkout button should be enabled
  const isCheckoutEnabled = currentStatus === PATIENT_STATUSES.READY_FOR_CHECKOUT;
  
  // Determine which status change button to show based on current status
  const getNextStatusButton = () => {
    switch (currentStatus) {
      case PATIENT_STATUSES.SCHEDULED:
        return (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleStatusChangeClick(PATIENT_STATUSES.CHECKED_IN)}
            startIcon={<CheckCircleIcon />}
          >
            Check In
          </Button>
        );
      case PATIENT_STATUSES.CHECKED_IN:
        return (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleStatusChangeClick(PATIENT_STATUSES.IN_PROGRESS)}
          >
            Start Visit
          </Button>
        );
      case PATIENT_STATUSES.IN_PROGRESS:
        return (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleStatusChangeClick(PATIENT_STATUSES.READY_FOR_CHECKOUT)}
          >
            Ready for Checkout
          </Button>
        );
      case PATIENT_STATUSES.READY_FOR_CHECKOUT:
        return (
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenCheckout}
            startIcon={<PaymentIcon />}
          >
            Process Checkout
          </Button>
        );
      case PATIENT_STATUSES.COMPLETED:
        return null; // No next status after completed
      case PATIENT_STATUSES.CANCELLED:
        return null; // No next status after cancelled
      default:
        return null;
    }
  };
  
  // Get color for the current status
  const getStatusColor = (status) => {
    switch (status) {
      case PATIENT_STATUSES.SCHEDULED:
        return "info";
      case PATIENT_STATUSES.CHECKED_IN:
        return "primary";
      case PATIENT_STATUSES.IN_PROGRESS:
        return "warning";
      case PATIENT_STATUSES.READY_FOR_CHECKOUT:
        return "secondary";
      case PATIENT_STATUSES.COMPLETED:
        return "success";
      case PATIENT_STATUSES.CANCELLED:
        return "error";
      default:
        return "default";
    }
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Visit Status
        </Typography>
        
        {/* Status Stepper */}
        <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {/* Current Status */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Current Status
            </Typography>
            <Typography 
              variant="h6" 
              color={`${getStatusColor(currentStatus)}.main`}
              sx={{ fontWeight: "medium" }}
            >
              {currentStatus}
            </Typography>
          </Box>
          
          {/* Status Change Button */}
          <Box>
            {getNextStatusButton()}
            
            {/* Cancel button - always available unless completed or already cancelled */}
            {currentStatus !== PATIENT_STATUSES.COMPLETED && 
             currentStatus !== PATIENT_STATUSES.CANCELLED && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleStatusChangeClick(PATIENT_STATUSES.CANCELLED)}
                sx={{ ml: 1 }}
              >
                Cancel Visit
              </Button>
            )}
          </Box>
        </Box>
        
        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}
      </Box>
      
      {/* Status Change Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>
          Confirm Status Change
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to change the patient's status from <strong>{currentStatus}</strong> to <strong>{statusToConfirm}</strong>?
          </Typography>
          
          <TextField
            label="Notes (Optional)"
            multiline
            rows={3}
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            variant="outlined"
            placeholder="Add any notes about this status change"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmStatusChange} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Checkout Modal */}
      <CheckoutModal
        open={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        patient={patient}
        onCheckoutComplete={handleCheckoutComplete}
      />
    </Paper>
  );
}

export default PatientStatusWorkflow;