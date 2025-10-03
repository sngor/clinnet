import React from "react";
import { Button, IconButton, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { designSystem } from "../DesignSystem";

const StyledButton = styled(Button)(({ theme, size = "medium" }) => {
  const sizeConfig = designSystem.components.button.sizes[size];

  return {
    borderRadius: theme.spacing(designSystem.borderRadius.sm / 8),
    textTransform: "none",
    fontWeight: designSystem.typography.fontWeights.semibold,
    letterSpacing: "0.025em",
    transition: designSystem.transitions.normal,
    boxShadow: "none",
    minHeight: sizeConfig.height,
    paddingLeft: theme.spacing(sizeConfig.padding.x / 8),
    paddingRight: theme.spacing(sizeConfig.padding.x / 8),
    paddingTop: theme.spacing(sizeConfig.padding.y / 8),
    paddingBottom: theme.spacing(sizeConfig.padding.y / 8),
    fontSize: designSystem.typography.fontSizes[sizeConfig.fontSize],

    "&:hover": {
      transform: designSystem.hover.lift,
      boxShadow: designSystem.shadows.md,
    },

    "&:active": {
      transform: "translateY(0)",
    },

    "&.Mui-disabled": {
      transform: "none",
      boxShadow: "none",
    },

    // Enhanced focus styles for accessibility
    "&:focus-visible": {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: "2px",
    },
  };
});

const StyledIconButton = styled(IconButton)(({ theme, size = "medium" }) => {
  const sizeMap = {
    small: 32,
    medium: 40,
    large: 48,
  };

  return {
    borderRadius: theme.spacing(designSystem.borderRadius.sm / 8),
    transition: designSystem.transitions.normal,
    width: sizeMap[size],
    height: sizeMap[size],

    "&:hover": {
      transform: designSystem.hover.scaleSmall,
      backgroundColor: theme.palette.action.hover,
    },

    "&:active": {
      transform: "scale(0.95)",
    },

    "&:focus-visible": {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: "2px",
    },
  };
});

/**
 * Unified button component with consistent styling
 * Replaces: EnhancedButton, AppButton, TextButton variations
 */
const UnifiedButton = ({
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
          size={16}
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
 * Unified icon button component
 */
export const UnifiedIconButton = ({
  children,
  loading = false,
  disabled = false,
  color = "default",
  size = "medium",
  onClick,
  tooltip,
  sx = {},
  ...props
}) => {
  return (
    <StyledIconButton
      color={color}
      size={size}
      disabled={disabled || loading}
      onClick={onClick}
      title={tooltip}
      sx={sx}
      {...props}
    >
      {loading ? (
        <CircularProgress size={16} sx={{ color: "inherit" }} />
      ) : (
        children
      )}
    </StyledIconButton>
  );
};

export default UnifiedButton;
