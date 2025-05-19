// src/components/ui/Container.jsx
// Consistent layout containers for Clinnet-EMR UI system
//
// Accessibility & Best Practices:
// - Use SectionContainer for page sections
// - Use CardContainer for grouped content
// - Use FlexBox for flexible layouts
//
// Usage Example:
// import { SectionContainer, CardContainer, FlexBox } from '../components/ui';
// <SectionContainer><CardContainer>...</CardContainer></SectionContainer>

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

// IMPORTANT USAGE NOTE:
// DO NOT nest CardContainer inside SectionContainer - use only one container type at a time
// - Use PageContainer for the entire page
// - Use SectionContainer for grouping content with just spacing (no visual container)
// - Use CardContainer when you need a visual container with shadow and border

// Section container with bottom margin (responsive)
// Use for grouping content with spacing only - NO VISUAL STYLING
export const SectionContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down("sm")]: {
    marginBottom: theme.spacing(2),
  },
}));

// Card container with consistent, responsive styling
// Use for content that needs visual distinction with shadow and border
export const CardContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  background: theme.palette.background.paper,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(4), // Added margin bottom like SectionContainer
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
  },
}));

// Flexible box for layouts (responsive gap)
export const FlexBox = styled(Box, {
  shouldForwardProp: (prop) =>
    ![
      "direction",
      "justify",
      "align",
      "spacing",
      "wrap",
      "center",
      "gap",
    ].includes(prop),
})(
  ({
    theme,
    direction = "row",
    justify = "flex-start",
    align = "center",
    spacing = { xs: 1, sm: 2 },
    wrap = "nowrap",
    center = false,
    gap,
  }) => ({
    display: "flex",
    flexDirection: direction,
    justifyContent: center ? "center" : justify,
    alignItems: center ? "center" : align,
    flexWrap: wrap,
    gap:
      gap !== undefined
        ? gap
        : typeof spacing === "object"
        ? theme.spacing(spacing.xs)
        : theme.spacing(spacing),
    "@media (min-width:600px)": {
      gap:
        gap !== undefined
          ? gap
          : typeof spacing === "object" && spacing.sm
          ? theme.spacing(spacing.sm)
          : undefined,
    },
  })
);
