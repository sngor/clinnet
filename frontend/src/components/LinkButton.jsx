// src/components/LinkButton.jsx
import React from 'react';
import { TextButton } from './ui/AppButton'; // Changed import
import { Link as RouterLink } from 'react-router-dom';

/**
 * A button component that acts as a link to navigate within the application
 * Uses React Router's Link component for client-side navigation
 * Based on TextButton from AppButton.jsx
 */
function LinkButton({ to, children, color = "primary", startIcon, sx = {}, ...props }) { // Removed variant prop
  return (
    <TextButton // Changed to TextButton
      component={RouterLink}
      to={to}
      color={color}
      startIcon={startIcon}
      sx={sx} // Simplified sx, TextButton handles its own hover
      {...props}
    >
      {children}
    </TextButton>
  );
}

export default LinkButton;