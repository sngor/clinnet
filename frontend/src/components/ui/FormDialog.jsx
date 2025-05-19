// src/components/ui/FormDialog.jsx
// Consistent form dialog for Clinnet-EMR UI system
//
// Accessibility & Best Practices:
// - Uses <Dialog> and <form> for accessibility
// - Keyboard and screen reader accessible
// - Loading and disabled states for submit
//
// Usage Example:
// import { FormDialog } from '../components/ui';
// <FormDialog open={open} onClose={close} title="Edit" onSubmit={handleSubmit}>...</FormDialog>

import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  Box,
} from "@mui/material";
import DialogHeading from "./DialogHeading";

/**
 * A consistent form dialog component for displaying forms in a dialog
 *
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Callback for closing the dialog
 * @param {string} props.title - The dialog title
 * @param {React.ReactNode} [props.icon] - Optional icon to display in the title
 * @param {React.ReactNode} props.children - The form content
 * @param {string} [props.submitText='Submit'] - Text for the submit button
 * @param {string} [props.cancelText='Cancel'] - Text for the cancel button
 * @param {Function} props.onSubmit - Callback for submitting the form
 * @param {boolean} [props.loading=false] - Whether the form is submitting
 * @param {boolean} [props.disabled=false] - Whether the submit button is disabled
 * @param {string} [props.maxWidth='sm'] - The maximum width of the dialog
 * @param {boolean} [props.fullWidth=true] - Whether the dialog takes up the full width
 * @param {Object} [props.sx] - Additional styles to apply to the dialog
 */
function FormDialog({
  open,
  onClose,
  title,
  icon,
  children,
  submitText = "Submit",
  cancelText = "Cancel",
  onSubmit,
  loading = false,
  disabled = false,
  maxWidth = "sm",
  fullWidth = true,
  sx = {},
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? null : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      sx={sx}
    >
      <DialogHeading title={title} icon={icon} />

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>{children}</DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Box sx={{ display: "flex", gap: 2, ml: "auto" }}>
            <Button onClick={onClose} disabled={loading} variant="outlined">
              {cancelText}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={disabled || loading}
            >
              {submitText}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default FormDialog;
