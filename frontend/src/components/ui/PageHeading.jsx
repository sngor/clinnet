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
 * @param {React.ReactNode} [props.menuIcon] - Optional menu icon (for mobile sticky)
 * @param {Object} [props.sx] - Additional styles to apply to the container
 */
function PageHeading({
  title,
  subtitle,
  action,
  divider = false,
  menuIcon,
  sx = {},
}) {
  return (
    <>
      <Box
        sx={{
          mb: divider ? 1.5 : { xs: 2.5, md: 4 },
          display: "flex",
          flexDirection: { xs: "row", md: "row" },
          justifyContent: "flex-start", // Align left
          alignItems: { xs: "center", md: "center" },
          gap: { xs: 1.5, md: 2 },
          pb: { xs: 1.5, md: 2 },
          borderBottom: divider ? "none" : "1px solid",
          borderColor: "divider",
          position: { xs: "sticky", md: "static" },
          top: { xs: 0, md: "auto" },
          zIndex: { xs: 1101, md: "auto" },
          // Remove background, borderRadius, and boxShadow:
          // background: { xs: "rgba(255,255,255,0.85)", md: "none" },
          // backdropFilter: { xs: "blur(8px)", md: "none" },
          // WebkitBackdropFilter: { xs: "blur(8px)", md: "none" },
          // boxShadow: { xs: "0 2px 8px rgba(67,97,238,0.04)", md: "none" },
          pl: { xs: 0, md: 0 },
          pr: { xs: 1, md: 0 },
          minHeight: { xs: 56, md: "auto" },
          // borderRadius: { xs: 3, md: 0 },
          mt: { xs: 1, md: 0 },
          mx: { xs: 1, md: 0 },
          // Make sure it overlays content below
          ...sx,
        }}
      >
        {/* Menu icon for mobile, left of headline */}
        {menuIcon && (
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              justifyContent: "center",
              mr: 1.5,
              flexShrink: 0,
              width: 44,
              height: 44,
              borderRadius: 2, // Rounded corners, not pill
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              background: "rgba(255,255,255,0.7)",
              boxShadow: "0 2px 8px rgba(67,97,238,0.08)",
            }}
          >
            {menuIcon}
          </Box>
        )}

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
              fontSize: { xs: "1.75rem", sm: "2rem", md: "2.125rem" },
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
