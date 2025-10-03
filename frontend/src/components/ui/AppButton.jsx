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

import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import {
  Button,
  IconButton,
  Tooltip,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

// Base styled button with common properties
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: "none",
  fontWeight: 600,
  fontSize: "1rem",
  minHeight: 40,
  minWidth: 100,
  padding: "8px 20px",
  boxShadow: "none",
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.background.paper,
  transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
  "&:hover": {
    boxShadow: theme.shadows[3],
    backgroundColor: theme.palette.action.hover,
  },
  "&:focus-visible": {
    outline: `3px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
  "&:disabled": {
    opacity: 0.6,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  // Enhanced touch target for mobile devices
  [theme.breakpoints.down("sm")]: {
    minHeight: 44,
    padding: "10px 16px",
    fontSize: "0.9375rem",
    // Increase touch target without affecting visual size
    "&::before": {
      content: '""',
      position: "absolute",
      top: -8,
      right: -8,
      bottom: -8,
      left: -8,
      zIndex: -1,
    },
  },
}));

// Primary button (filled)
export const PrimaryButton = styled(StyledButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
  },
  "&:disabled": {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  },
}));

// Secondary button (outlined)
export const SecondaryButton = styled(StyledButton)(({ theme }) => ({
  backgroundColor: "transparent",
  color: theme.palette.primary.main,
  border: `1.5px solid ${theme.palette.primary.main}`,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    borderColor: theme.palette.primary.dark,
  },
  "&:disabled": {
    borderColor: theme.palette.action.disabled,
    color: theme.palette.action.disabled,
  },
}));

// Text button (no background, no border)
export const TextButton = styled(StyledButton)(({ theme }) => ({
  backgroundColor: "transparent",
  color: theme.palette.primary.main,
  minWidth: 64,
  padding: "8px 12px",
  "&:hover": {
    // Remove background and only underline text on hover
    backgroundColor: "transparent",
    textDecoration: "underline",
  },
  "&:disabled": {
    color: theme.palette.action.disabled,
  },
}));

// Danger button (for destructive actions)
export const DangerButton = styled(StyledButton)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.error.dark,
    color: theme.palette.error.contrastText,
  },
  "&:disabled": {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  },
}));

/**
 * AppIconButton component for icon-only buttons with optional tooltip
 */
export const AppIconButton = forwardRef(
  (
    {
      icon,
      color = "primary",
      size = "medium",
      tooltip,
      onClick,
      disabled = false,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const IconComponent = icon;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    // Use provided aria-label, or tooltip, or a default derived from icon
    const buttonAriaLabel =
      ariaLabel ||
      tooltip ||
      (IconComponent ? IconComponent.displayName || "Icon button" : "Button");

    // Adjust size for mobile
    const effectiveSize = isMobile && size === "medium" ? "large" : size;

    const button = (
      <IconButton
        onClick={onClick}
        color={color}
        size={effectiveSize}
        disabled={disabled}
        ref={ref}
        aria-label={buttonAriaLabel}
        sx={{
          // Enhanced touch target for mobile
          ...(isMobile && {
            p: 1.2,
            "& .MuiSvgIcon-root": {
              fontSize: "1.3rem",
            },
          }),
        }}
        {...props}
      >
        {IconComponent ? <IconComponent /> : null}
      </IconButton>
    );

    if (tooltip) {
      return (
        <Tooltip title={tooltip} arrow>
          {button}
        </Tooltip>
      );
    }

    return button;
  }
);

// Add display name for better debugging
AppIconButton.displayName = "AppIconButton";

/**
 * AppButton - Base button for custom variants. Use PrimaryButton, SecondaryButton, etc. for most cases.
 * @param {object} props - Button props
 * @param {string} [props.variant] - MUI variant (contained, outlined, text)
 * @param {React.ReactNode} [props.children] - Button content
 * @param {string} [props.ariaLabel] - Accessibility label for icon-only buttons
 * @param {boolean} [props.fullWidth] - If true, button takes full width
 * @param {string} [props.size] - Button size: small, medium, large
 * @param {boolean} [props.loading] - If true, shows loading spinner and disables button
 * @param {React.ReactNode} [props.startIcon] - Icon at the start
 * @param {React.ReactNode} [props.endIcon] - Icon at the end
 * @returns {JSX.Element}
 */
const AppButton = ({
  variant = "contained",
  "aria-label": ariaLabel,
  fullWidth = false,
  size = "medium",
  loading = false,
  startIcon,
  endIcon,
  children,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      aria-label={ariaLabel}
      fullWidth={fullWidth}
      size={size}
      disabled={loading || props.disabled}
      startIcon={
        loading ? <CircularProgress size={20} color="inherit" /> : startIcon
      }
      endIcon={endIcon}
      {...props}
    >
      {loading ? <span style={{ opacity: 0.7 }}>{children}</span> : children}
    </StyledButton>
  );
};

AppButton.propTypes = {
  variant: PropTypes.oneOf(["contained", "outlined", "text"]),
  children: PropTypes.node,
  "aria-label": PropTypes.string,
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  loading: PropTypes.bool,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  disabled: PropTypes.bool,
};

PrimaryButton.propTypes =
  SecondaryButton.propTypes =
  TextButton.propTypes =
  DangerButton.propTypes =
    AppButton.propTypes;
AppIconButton.propTypes = {
  "aria-label": PropTypes.string.isRequired,
  children: PropTypes.node,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  disabled: PropTypes.bool,
};

export default AppButton;
