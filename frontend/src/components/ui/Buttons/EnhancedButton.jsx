import React from "react";
import { Button, IconButton, Fab, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledButton = styled(Button)(({ theme, variant, size = "medium" }) => {
  const sizeStyles = {
    small: {
      padding: "6px 16px",
      fontSize: "0.875rem",
      minHeight: 32,
    },
    medium: {
      padding: "10px 20px",
      fontSize: "0.9375rem",
      minHeight: 40,
    },
    large: {
      padding: "12px 24px",
      fontSize: "1rem",
      minHeight: 48,
    },
  };

  return {
    borderRadius: theme.spacing(1.5),
    textTransform: "none",
    fontWeight: theme.typography.fontWeightSemiBold,
    letterSpacing: "0.025em",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "none",
    ...sizeStyles[size],

    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: theme.shadows[4],
    },

    "&:active": {
      transform: "translateY(0)",
    },

    "&.Mui-disabled": {
      transform: "none",
      boxShadow: "none",
    },

    // Variant-specific styles
    ...(variant === "contained" && {
      "&:hover": {
        boxShadow: theme.shadows[6],
      },
    }),

    ...(variant === "outlined" && {
      borderWidth: "2px",
      "&:hover": {
        borderWidth: "2px",
      },
    }),
  };
});

const StyledIconButton = styled(IconButton)(({ theme, size = "medium" }) => {
  const sizeStyles = {
    small: { width: 32, height: 32 },
    medium: { width: 40, height: 40 },
    large: { width: 48, height: 48 },
  };

  return {
    borderRadius: theme.spacing(1),
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    ...sizeStyles[size],

    "&:hover": {
      transform: "scale(1.05)",
    },

    "&:active": {
      transform: "scale(0.95)",
    },
  };
});

/**
 * Enhanced button with consistent styling
 */
const EnhancedButton = ({
  children,
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  variant = "contained",
  color = "primary",
  size = "medium",
  fullWidth = false,
  onClick,
  sx = {},
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      color={color}
      size={size}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      onClick={onClick}
      startIcon={!loading && startIcon}
      endIcon={!loading && endIcon}
      sx={sx}
      {...props}
    >
      {loading && (
        <CircularProgress
          size={20}
          sx={{
            color: "inherit",
            mr: 1,
          }}
        />
      )}
      {children}
    </StyledButton>
  );
};

/**
 * Enhanced icon button
 */
export const EnhancedIconButton = ({
  children,
  loading = false,
  disabled = false,
  color = "default",
  size = "medium",
  onClick,
  sx = {},
  ...props
}) => {
  return (
    <StyledIconButton
      color={color}
      size={size}
      disabled={disabled || loading}
      onClick={onClick}
      sx={sx}
      {...props}
    >
      {loading ? (
        <CircularProgress size={20} sx={{ color: "inherit" }} />
      ) : (
        children
      )}
    </StyledIconButton>
  );
};

export default EnhancedButton;
