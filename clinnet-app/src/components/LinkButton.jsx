// src/components/LinkButton.jsx
import React from 'react';
import { Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

/**
 * A button component that acts as a link to navigate within the application
 * Uses React Router's Link component for client-side navigation
 */
function LinkButton({ to, children, variant = "text", color = "primary", startIcon, sx = {}, ...props }) {
  return (
    <Button
      component={RouterLink}
      to={to}
      variant={variant}
      color={color}
      startIcon={startIcon}
      sx={{
        ...sx,
        ...(variant === "text" && {
          "&:hover": {
            backgroundColor: "transparent",
            textDecoration: "underline",
            ...sx["&:hover"]
          }
        })
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

export default LinkButton;