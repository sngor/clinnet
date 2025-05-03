// src/components/ConfirmDeleteDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

/**
 * A reusable confirmation dialog for delete operations
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when dialog is closed
 * @param {Function} props.onConfirm - Function to call when delete is confirmed
 * @param {string} props.title - Dialog title
 * @param {string} props.itemName - Name of the item being deleted
 * @param {string} props.itemType - Type of item being deleted (e.g., "user", "service")
 */
function ConfirmDeleteDialog({ open, onClose, onConfirm, title = "Confirm Deletion", itemName, itemType = "item" }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete the {itemType} "{itemName}"? 
          This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDeleteDialog;