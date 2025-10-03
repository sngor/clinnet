import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { designSystem } from "../DesignSystem";

const StyledCard = styled(Card)(
  ({ theme, variant = "default", interactive = false, size = "medium" }) => {
    const variants = {
      default: {
        borderRadius: theme.spacing(designSystem.borderRadius.lg / 8),
        boxShadow: designSystem.shadows.md,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      },
      elevated: {
        borderRadius: theme.spacing(designSystem.borderRadius.lg / 8),
        boxShadow: designSystem.shadows.lg,
        border: "none",
        backgroundColor: theme.palette.background.paper,
      },
      flat: {
        borderRadius: theme.spacing(designSystem.borderRadius.md / 8),
        boxShadow: "none",
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      },
      outlined: {
        borderRadius: theme.spacing(designSystem.borderRadius.lg / 8),
        boxShadow: "none",
        border: `2px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      },
    };

    const sizes = {
      small: { padding: theme.spacing(2) },
      medium: { padding: theme.spacing(3) },
      large: { padding: theme.spacing(4) },
    };

    return {
      ...variants[variant],
      transition: designSystem.transitions.normal,
      overflow: "hidden",
      position: "relative",
      ...(interactive && {
        cursor: "pointer",
        "&:hover": {
          transform: designSystem.hover.lift,
          boxShadow: designSystem.shadows.lg,
          borderColor: theme.palette.primary.main,
        },
        "&:active": {
          transform: "translateY(0)",
        },
      }),
      "& .MuiCardContent-root": {
        ...sizes[size],
        "&:last-child": {
          paddingBottom: sizes[size].padding,
        },
      },
    };
  }
);

const StyledCardHeader = styled(CardHeader)(({ theme, size = "medium" }) => {
  const sizes = {
    small: { padding: theme.spacing(2) },
    medium: { padding: theme.spacing(3) },
    large: { padding: theme.spacing(4) },
  };

  return {
    ...sizes[size],
    paddingBottom: theme.spacing(1),
    "& .MuiCardHeader-title": {
      fontSize: theme.typography.h5.fontSize,
      fontWeight: designSystem.typography.fontWeights.semibold,
      color: theme.palette.text.primary,
      lineHeight: designSystem.typography.lineHeights.tight,
    },
    "& .MuiCardHeader-subheader": {
      fontSize: theme.typography.body2.fontSize,
      color: theme.palette.text.secondary,
      marginTop: theme.spacing(0.5),
      lineHeight: designSystem.typography.lineHeights.normal,
    },
  };
});

/**
 * Unified card component with consistent styling across all variants
 * Replaces: EnhancedCard, ContentCard, DashboardCard variations
 */
const UnifiedCard = ({
  variant = "default",
  size = "medium",
  interactive = false,
  title,
  subtitle,
  headerAction,
  actions,
  children,
  onClick,
  elevation,
  sx = {},
  ...props
}) => {
  // Override variant if elevation is provided for backward compatibility
  const finalVariant = elevation !== undefined ? "elevated" : variant;

  return (
    <StyledCard
      variant={finalVariant}
      size={size}
      interactive={interactive}
      onClick={onClick}
      sx={sx}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <StyledCardHeader
          size={size}
          title={title}
          subheader={subtitle}
          action={headerAction}
        />
      )}

      <CardContent>{children}</CardContent>

      {actions && (
        <CardActions
          sx={{
            px: size === "small" ? 2 : size === "large" ? 4 : 3,
            pb: size === "small" ? 2 : size === "large" ? 4 : 3,
            pt: 0,
          }}
        >
          {actions}
        </CardActions>
      )}
    </StyledCard>
  );
};

export default UnifiedCard;
