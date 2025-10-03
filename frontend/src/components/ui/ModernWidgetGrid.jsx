// Modern widget grid system for consistent layout across dashboards
import React from "react";
import { Box, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";

const GridContainer = styled(Box)(({ theme, spacing }) => ({
  display: "grid",
  gap: theme.spacing(spacing || 3),
  width: "100%",

  // Responsive grid configurations
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",

  [theme.breakpoints.up("sm")]: {
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  },

  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  },

  [theme.breakpoints.up("lg")]: {
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  },
}));

const ResponsiveGrid = styled(Box)(({ theme, columns, spacing }) => ({
  display: "grid",
  gap: theme.spacing(spacing || 3),
  width: "100%",

  // Default mobile: 1 column
  gridTemplateColumns: "1fr",

  // Tablet: 2 columns
  [theme.breakpoints.up("sm")]: {
    gridTemplateColumns: `repeat(${Math.min(columns?.sm || 2, 2)}, 1fr)`,
  },

  // Desktop: 3-4 columns
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: `repeat(${columns?.md || 3}, 1fr)`,
  },

  // Large desktop: 4-6 columns
  [theme.breakpoints.up("lg")]: {
    gridTemplateColumns: `repeat(${columns?.lg || 4}, 1fr)`,
  },

  // Extra large: up to 6 columns
  [theme.breakpoints.up("xl")]: {
    gridTemplateColumns: `repeat(${columns?.xl || columns?.lg || 4}, 1fr)`,
  },
}));

/**
 * Modern widget grid for organizing dashboard widgets
 */
const ModernWidgetGrid = ({
  children,
  variant = "auto", // auto, responsive, custom
  columns = { sm: 2, md: 3, lg: 4, xl: 4 },
  spacing = 3,
  sx = {},
  ...props
}) => {
  if (variant === "responsive") {
    return (
      <ResponsiveGrid columns={columns} spacing={spacing} sx={sx} {...props}>
        {children}
      </ResponsiveGrid>
    );
  }

  if (variant === "custom") {
    return (
      <Box sx={sx} {...props}>
        {children}
      </Box>
    );
  }

  // Default auto-fit grid
  return (
    <GridContainer spacing={spacing} sx={sx} {...props}>
      {children}
    </GridContainer>
  );
};

/**
 * Widget section for grouping related widgets
 */
export const WidgetSection = ({
  title,
  subtitle,
  action,
  children,
  spacing = 3,
  sx = {},
  ...props
}) => {
  return (
    <Box sx={{ mb: 4, ...sx }} {...props}>
      {(title || subtitle || action) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            mb: spacing,
            pb: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box>
            {title && (
              <Box
                component="h2"
                sx={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "text.primary",
                  m: 0,
                  mb: subtitle ? 0.5 : 0,
                }}
              >
                {title}
              </Box>
            )}
            {subtitle && (
              <Box
                component="p"
                sx={{
                  fontSize: "0.875rem",
                  color: "text.secondary",
                  m: 0,
                }}
              >
                {subtitle}
              </Box>
            )}
          </Box>
          {action && <Box>{action}</Box>}
        </Box>
      )}
      {children}
    </Box>
  );
};

/**
 * Predefined grid layouts for common dashboard patterns
 */
export const DashboardMetrics = ({ children, ...props }) => (
  <ModernWidgetGrid
    variant="responsive"
    columns={{ sm: 2, md: 4, lg: 4, xl: 6 }}
    {...props}
  >
    {children}
  </ModernWidgetGrid>
);

export const ContentWidgets = ({ children, ...props }) => (
  <ModernWidgetGrid
    variant="responsive"
    columns={{ sm: 1, md: 2, lg: 3, xl: 3 }}
    {...props}
  >
    {children}
  </ModernWidgetGrid>
);

export const DetailWidgets = ({ children, ...props }) => (
  <ModernWidgetGrid
    variant="responsive"
    columns={{ sm: 1, md: 2, lg: 2, xl: 3 }}
    {...props}
  >
    {children}
  </ModernWidgetGrid>
);

export default ModernWidgetGrid;
