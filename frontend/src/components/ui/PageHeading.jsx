// src/components/ui/PageHeading.jsx
// Consistent page heading component for Clinnet-EMR UI system
//
// Accessibility & Best Practices:
// - Uses semantic <h1> for page title
// - Optional subtitle and action button
// - Responsive spacing and layout
// - Use as the first element in a page for accessibility
//
// Usage Example:
// import { PageHeading } from '../components/ui';
// <PageHeading title="Patients" subtitle="Manage all patients" action={<PrimaryButton>Add</PrimaryButton>} />

import React from "react";
import { Box, Divider, Typography } from "@mui/material";

/**
 * A consistent page heading component that can be used across all pages
 *
 * @param {Object} props - Component props
 * @param {string} props.title - The page title
 * @param {string} [props.subtitle] - Optional subtitle text
 * @param {React.ReactNode} [props.action] - Optional action button or component
 * @param {boolean} [props.divider=false] - Whether to show a divider below the heading
 * @param {Object} [props.sx] - Additional styles to apply to the container
 */
function PageHeading({ title, subtitle, action, divider = false, sx = {} }) {
  return (
    <>
      <Box
        sx={{
          mb: divider ? 1.5 : { xs: 2.5, md: 4 }, // Reduced margin on mobile
          display: "flex",
          flexDirection: { xs: "column", md: "row" }, // Stack on mobile and tablets
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: { xs: 1.5, md: 2 }, // Tighter spacing on mobile
          pb: { xs: 1.5, md: 2 }, // Less padding on mobile
          borderBottom: divider ? "none" : "1px solid",
          borderColor: "divider",
          ...sx,
        }}
      >
        <Box sx={{ textAlign: "left", width: "100%" }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              color: (theme) => theme.palette.primary.main,
              fontWeight: 700,
              lineHeight: 1.3,
              mb: 1,
              textAlign: "left",
              fontSize: { xs: "1.75rem", sm: "2rem", md: "2.125rem" }, // Responsive font size
            }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{
                mt: 0.5,
                mb: 0,
                textAlign: "left",
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {action && (
          <Box
            sx={{
              alignSelf: { xs: "flex-start", sm: "center" },
              flexShrink: 0,
            }}
          >
            {action}
          </Box>
        )}
      </Box>

      {divider && <Divider sx={{ mb: 4 }} />}
    </>
  );
}

export default PageHeading;
