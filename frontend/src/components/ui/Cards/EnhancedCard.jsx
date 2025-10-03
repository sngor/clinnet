import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Box,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { designSystem } from "../DesignSystem";

const StyledCard = styled(Card)(
  ({ theme, variant = "default", interactive = false }) => {
    const variants = {
      default: {
        borderRadius: theme.spacing(2),
        boxShadow: theme.shadows[2],
        border: `1px solid ${theme.palette.divider}`,
      },
      elevated: {
        borderRadius: theme.spacing(2.5),
        boxShadow: theme.shadows[4],
        border: "none",
      },
      flat: {
        borderRadius: theme.spacing(1.5),
        boxShadow: "none",
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      },
      outlined: {
        borderRadius: theme.spacing(2),
        boxShadow: "none",
        border: `2px solid ${theme.palette.divider}`,
      },
    };

    return {
      ...variants[variant],
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      ...(interactive && {
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[6],
          borderColor: theme.palette.primary.main,
        },
      }),
    };
  }
);

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  paddingBottom: theme.spacing(1),
  "& .MuiCardHeader-title": {
    fontSize: theme.typography.h5.fontSize,
    fontWeight: theme.typography.fontWeightSemiBold,
    color: theme.palette.text.primary,
  },
  "& .MuiCardHeader-subheader": {
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  paddingTop: theme.spacing(1),
  "&:last-child": {
    paddingBottom: theme.spacing(3),
  },
}));

/**
 * Enhanced card component with consistent styling
 */
const EnhancedCard = ({
  variant = "default",
  interactive = false,
  title,
  subtitle,
  headerAction,
  actions,
  children,
  onClick,
  sx = {},
  ...props
}) => {
  return (
    <StyledCard
      variant={variant}
      interactive={interactive}
      onClick={onClick}
      sx={sx}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <StyledCardHeader
          title={title}
          subheader={subtitle}
          action={headerAction}
        />
      )}

      <StyledCardContent>{children}</StyledCardContent>

      {actions && (
        <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>{actions}</CardActions>
      )}
    </StyledCard>
  );
};

export default EnhancedCard;
