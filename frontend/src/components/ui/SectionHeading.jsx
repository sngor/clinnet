// src/components/ui/SectionHeading.jsx
// Consistent section heading component for Clinnet-EMR UI system
//
// Accessibility & Best Practices:
// - Uses semantic <h2> for section title
// - Optional subtitle and action button
// - Responsive spacing and layout
//
// Usage Example:
// import { SectionHeading } from '../components/ui';
// <SectionHeading title="Details" subtitle="Section details" action={<SecondaryButton>Edit</SecondaryButton>} />

import React from "react";
import { Box, Divider, Typography } from "@mui/material";

/**
 * A consistent section heading component that can be used within pages
 *
 * @param {Object} props - Component props
 * @param {string} props.title - The section title
 * @param {string} [props.subtitle] - Optional subtitle text
 * @param {React.ReactNode} [props.action] - Optional action button or component
 * @param {boolean} [props.divider=true] - Whether to show a divider below the heading
 * @param {Object} [props.sx] - Additional styles to apply to the container
 */
function SectionHeading({ title, subtitle, action, divider = true, sx = {} }) {
  return (
    <>
      <Box
        sx={{
          mb: divider ? 2 : 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          ...sx,
        }}
      >
        <Box sx={{ textAlign: "left", width: "100%" }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              mb: subtitle ? 0.5 : 0,
              textAlign: "left",
              fontWeight: 600,
              color: "primary.main",
              lineHeight: 1.4,
            }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              variant="subtitle2"
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

      {divider && <Divider sx={{ mb: 3 }} />}
    </>
  );
}

export default SectionHeading;
