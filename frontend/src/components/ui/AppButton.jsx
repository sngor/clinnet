// src/components/ui/AppButton.jsx
// Accessible and consistent button components for the Clinnet-EMR UI system
//
// Accessibility & Best Practices:
// - All buttons have visible focus styles (inherited from MUI, but can be customized via theme)
// - Color contrast meets WCAG AA for text and backgrounds
// - Icon buttons have aria-label support for screen readers
// - All variants support keyboard navigation and are focusable
// - Use PropTypes for documentation and type safety
//
// Usage Example:
// import { PrimaryButton, SecondaryButton, DangerButton, TextButton, AppIconButton } from '../components/ui';
// <PrimaryButton onClick={handleSave}>Save</PrimaryButton>
// <AppIconButton aria-label="Add" onClick={handleAdd}><AddIcon /></AppIconButton>

import React from "react";
import PropTypes from "prop-types";
import { Button, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";

// Base styled button with common properties
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: "none",
  fontWeight: 500,
  boxShadow: "none",
  "&:hover": {
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  },
}));

// Primary button (filled)
export const PrimaryButton = styled(StyledButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

// Secondary button (outlined)
export const SecondaryButton = styled(StyledButton)(({ theme }) => ({
  backgroundColor: "transparent",
  color: theme.palette.primary.main,
  border: `1px solid ${theme.palette.primary.main}`,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

// Text button (no background, no border)
export const TextButton = styled(StyledButton)(({ theme }) => ({
  backgroundColor: "transparent",
  color: theme.palette.primary.main,
  "&:hover": {
    backgroundColor: "transparent",
    textDecoration: "underline",
  },
}));

// Danger button (for destructive actions)
export const DangerButton = styled(StyledButton)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.error.dark,
  },
}));

// Icon button with consistent styling and accessibility
export const AppIconButton = styled(({ "aria-label": ariaLabel, ...props }) => (
  <IconButton aria-label={ariaLabel} tabIndex={0} {...props} />
))(({ theme }) => ({
  color: theme.palette.primary.main,
  "&:focus-visible": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
}));

// Default export is the base button
/**
 * AppButton - Base button for custom variants. Use PrimaryButton, SecondaryButton, etc. for most cases.
 * @param {object} props - Button props
 * @param {string} [props.variant] - MUI variant (contained, outlined, text)
 * @param {React.ReactNode} [props.children] - Button content
 * @param {string} [props.ariaLabel] - Accessibility label for icon-only buttons
 * @returns {JSX.Element}
 */
const AppButton = ({
  variant = "contained",
  "aria-label": ariaLabel,
  ...props
}) => {
  return <StyledButton variant={variant} aria-label={ariaLabel} {...props} />;
};

AppButton.propTypes = {
  variant: PropTypes.oneOf(["contained", "outlined", "text"]),
  children: PropTypes.node,
  "aria-label": PropTypes.string,
};

PrimaryButton.propTypes =
  SecondaryButton.propTypes =
  TextButton.propTypes =
  DangerButton.propTypes =
    AppButton.propTypes;
AppIconButton.propTypes = {
  "aria-label": PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default AppButton;
