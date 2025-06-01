// src/components/LinkButton.jsx
import React from "react";
import { TextButton } from "./ui/AppButton"; // Changed import
import { Link as RouterLink } from "react-router-dom";

/**
 * A button component that acts as a link to navigate within the application
 * Uses React Router's Link component for client-side navigation
 * Based on TextButton from AppButton.jsx
 */
function LinkButton({
  to,
  children,
  color = "primary",
  startIcon,
  sx = {},
  ...props
}) {
  return (
    <TextButton
      component={RouterLink}
      to={to}
      color={color}
      startIcon={startIcon}
      sx={{
        ...sx,
        backgroundColor: "transparent",
        boxShadow: "none !important", // Force remove box shadow
        borderRadius: 0,
        padding: 0,
        minWidth: "unset",
        outline: "none",
        "&:hover, &:focus, &:active": {
          backgroundColor: "transparent",
          boxShadow: "none !important", // Force remove box shadow on hover/focus/active
          outline: "none",
        },
        "& .MuiButton-label, & .MuiButton-startIcon, & .MuiButton-endIcon": {
          textDecoration: "underline",
        },
      }}
      {...props}
    >
      {children}
    </TextButton>
  );
}

export default LinkButton;
