// src/components/ui/DialogHeading.jsx
// Consistent dialog heading component for Clinnet-EMR UI system
//
// Accessibility & Best Practices:
// - Uses <DialogTitle> for accessibility
// - Optional icon for context
//
// Usage Example:
// import { DialogHeading } from '../components/ui';
// <DialogHeading title="Edit Patient" icon={<EditIcon />} />

import React from "react";
import { Box, DialogTitle } from "@mui/material";

/**
 * A consistent dialog heading component that can be used across all dialogs
 *
 * @param {Object} props - Component props
 * @param {string} props.title - The dialog title
 * @param {React.ReactNode} [props.icon] - Optional icon to display before the title
 * @param {Object} [props.sx] - Additional styles to apply to the container
 */
function DialogHeading({ title, icon, sx = {} }) {
  return (
    <DialogTitle
      sx={{
        bgcolor: "primary.main",
        color: "primary.contrastText",
        px: 3,
        py: 2,
        fontWeight: 600,
        fontSize: "1.25rem",
        display: "flex",
        alignItems: "center",
        lineHeight: 1.4,
        ...sx,
      }}
    >
      {icon && (
        <Box sx={{ mr: 1.5, display: "flex", alignItems: "center" }}>
          {icon}
        </Box>
      )}
      {title}
    </DialogTitle>
  );
}

export default DialogHeading;
