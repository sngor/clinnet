import React from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { designSystem } from "../DesignSystem";

/**
 * Spacing utilities for consistent layout spacing
 */

// Vertical spacer component
export const VerticalSpacer = styled(Box)(({ theme, size = "md" }) => ({
  height: theme.spacing(designSystem.spacing[size] / 8),
  width: "100%",
  flexShrink: 0,
}));

// Horizontal spacer component
export const HorizontalSpacer = styled(Box)(({ theme, size = "md" }) => ({
  width: theme.spacing(designSystem.spacing[size] / 8),
  height: "100%",
  flexShrink: 0,
}));

// Stack component with consistent spacing
export const Stack = styled(Box)(
  ({
    theme,
    direction = "column",
    spacing = "md",
    align = "stretch",
    justify = "flex-start",
  }) => ({
    display: "flex",
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
    gap: theme.spacing(designSystem.spacing[spacing] / 8),
  })
);

// Grid container with consistent spacing
export const GridContainer = styled(Box)(({ theme, spacing = "md" }) => ({
  display: "grid",
  gap: theme.spacing(designSystem.spacing[spacing] / 8),
}));

// Responsive container with consistent padding
export const ResponsiveContainer = styled(Box)(
  ({ theme, padding = "responsive" }) => {
    const paddingMap = {
      none: { xs: 0, sm: 0, md: 0 },
      small: { xs: 1, sm: 2, md: 2 },
      responsive: { xs: 2, sm: 3, md: 4 },
      large: { xs: 3, sm: 4, md: 6 },
    };

    const paddingValue = paddingMap[padding] || paddingMap.responsive;

    return {
      padding: theme.spacing(paddingValue.xs),
      [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(paddingValue.sm),
      },
      [theme.breakpoints.up("md")]: {
        padding: theme.spacing(paddingValue.md),
      },
    };
  }
);

// Section divider with consistent spacing
export const SectionDivider = styled(Box)(({ theme, spacing = "lg" }) => ({
  width: "100%",
  height: "1px",
  backgroundColor: theme.palette.divider,
  margin: `${theme.spacing(designSystem.spacing[spacing] / 8)} 0`,
}));

// Content wrapper with max width and centering
export const ContentWrapper = styled(Box)(({ theme, maxWidth = "lg" }) => {
  const maxWidthMap = {
    sm: designSystem.layout.containerMaxWidth.sm,
    md: designSystem.layout.containerMaxWidth.md,
    lg: designSystem.layout.containerMaxWidth.lg,
    xl: designSystem.layout.containerMaxWidth.xl,
    xxl: designSystem.layout.containerMaxWidth.xxl,
  };

  return {
    maxWidth: maxWidthMap[maxWidth] || maxWidthMap.lg,
    margin: "0 auto",
    width: "100%",
  };
});

// Flex utilities
export const FlexRow = styled(Box)(
  ({
    theme,
    spacing = "md",
    align = "center",
    justify = "flex-start",
    wrap = "nowrap",
  }) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap,
    gap: theme.spacing(designSystem.spacing[spacing] / 8),
  })
);

export const FlexColumn = styled(Box)(
  ({ theme, spacing = "md", align = "stretch", justify = "flex-start" }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: align,
    justifyContent: justify,
    gap: theme.spacing(designSystem.spacing[spacing] / 8),
  })
);

// Responsive grid with consistent breakpoints
export const ResponsiveGrid = styled(Box)(
  ({ theme, columns = { xs: 1, sm: 2, md: 3 }, spacing = "md" }) => ({
    display: "grid",
    gap: theme.spacing(designSystem.spacing[spacing] / 8),
    gridTemplateColumns: `repeat(${columns.xs || 1}, 1fr)`,

    [theme.breakpoints.up("sm")]: {
      gridTemplateColumns: `repeat(${columns.sm || 2}, 1fr)`,
    },

    [theme.breakpoints.up("md")]: {
      gridTemplateColumns: `repeat(${columns.md || 3}, 1fr)`,
    },

    [theme.breakpoints.up("lg")]: {
      gridTemplateColumns: `repeat(${columns.lg || columns.md || 3}, 1fr)`,
    },

    [theme.breakpoints.up("xl")]: {
      gridTemplateColumns: `repeat(${
        columns.xl || columns.lg || columns.md || 3
      }, 1fr)`,
    },
  })
);

// Aspect ratio container
export const AspectRatio = styled(Box)(({ ratio = "16/9" }) => {
  const [width, height] = ratio.split("/").map(Number);
  const paddingTop = (height / width) * 100;

  return {
    position: "relative",
    width: "100%",
    paddingTop: `${paddingTop}%`,

    "& > *": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
    },
  };
});

// Sticky container with consistent positioning
export const StickyContainer = styled(Box)(
  ({ theme, top = 0, zIndex = 1 }) => ({
    position: "sticky",
    top: theme.spacing(top),
    zIndex,
    backgroundColor: theme.palette.background.paper,
  })
);

// Utility functions for spacing
export const getSpacing = (size) => (theme) =>
  theme.spacing(designSystem.spacing[size] / 8);

export const getResponsiveSpacing = (sizes) => (theme) => ({
  xs: theme.spacing(designSystem.spacing[sizes.xs || sizes] / 8),
  sm: theme.spacing(designSystem.spacing[sizes.sm || sizes] / 8),
  md: theme.spacing(designSystem.spacing[sizes.md || sizes] / 8),
  lg: theme.spacing(designSystem.spacing[sizes.lg || sizes] / 8),
  xl: theme.spacing(designSystem.spacing[sizes.xl || sizes] / 8),
});

// Common spacing patterns
export const spacingPatterns = {
  // Page-level spacing
  pageTop: { xs: designSystem.spacing.lg, sm: designSystem.spacing.xl },
  pageBottom: { xs: designSystem.spacing.xl, sm: designSystem.spacing.xxxl },

  // Section spacing
  sectionGap: { xs: designSystem.spacing.lg, sm: designSystem.spacing.xl },
  sectionPadding: { xs: designSystem.spacing.md, sm: designSystem.spacing.lg },

  // Component spacing
  componentGap: designSystem.spacing.md,
  componentPadding: designSystem.spacing.lg,

  // Form spacing
  fieldGap: designSystem.spacing.md,
  fieldPadding: designSystem.spacing.sm,

  // Card spacing
  cardPadding: { xs: designSystem.spacing.md, sm: designSystem.spacing.lg },
  cardGap: designSystem.spacing.md,
};
