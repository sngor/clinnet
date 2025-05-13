// src/components/ui/Container.jsx
import React from "react";
import { Box, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

// Legacy page container - use the new PageContainer component instead
const LegacyPageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

// Section container with bottom margin (responsive)
export const SectionContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down("sm")]: {
    marginBottom: theme.spacing(2),
  },
}));

// Card container with consistent, responsive styling
export const CardContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
  },
}));

// Flexible box for layouts (responsive gap)
export const FlexBox = styled(Box)(
  ({
    theme,
    direction = "row",
    justify = "flex-start",
    align = "center",
    spacing = { xs: 1, sm: 2 },
    wrap = "nowrap",
  }) => ({
    display: "flex",
    flexDirection: direction,
    justifyContent: justify,
    alignItems: align,
    flexWrap: wrap,
    gap:
      typeof spacing === "object"
        ? theme.spacing(spacing.xs)
        : theme.spacing(spacing),
    "@media (min-width:600px)": {
      gap:
        typeof spacing === "object" && spacing.sm
          ? theme.spacing(spacing.sm)
          : undefined,
    },
  })
);
