// src/components/ConfirmDeleteDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box
  // CircularProgress is no longer needed here as AppButton handles it
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { SecondaryButton, DangerButton } from './ui/AppButton'; // Added AppButton imports

/**
 * A reusable confirmation dialog for delete operations
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when closing the dialog
 * @param {Function} props.onConfirm - Function to call when confirming the delete
 * @param {string} props.itemName - Name of the item being deleted
 * @param {string} props.itemType - Type of item being deleted (e.g., "user", "patient")
 * @param {boolean} props.loading - Whether a delete operation is in progress
 */
function ConfirmDeleteDialog({ 
  open, 
  onClose, 
  onConfirm, 
  itemName = 'this item', 
  itemType = 'item',
  loading = false
}) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>Confirm Delete</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WarningIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="body1">
            Are you sure you want to delete {itemType} <strong>{itemName}</strong>?
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          This action cannot be undone. All data associated with this {itemType} will be permanently removed.
        </Typography>
      </DialogContent>
      <DialogActions>
        <SecondaryButton // Changed to SecondaryButton
          onClick={onClose} 
          disabled={loading}
        >
          Cancel
        </SecondaryButton>
        <DangerButton // Changed to DangerButton
          onClick={onConfirm} 
          disabled={loading}
          loading={loading} // Pass loading prop to DangerButton
        >
          {`Delete ${itemType}`}
        </DangerButton>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDeleteDialog;