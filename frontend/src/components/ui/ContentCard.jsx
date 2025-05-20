// src/components/ui/ContentCard.jsx
// Consistent content card for Clinnet-EMR UI system
//
// Accessibility & Best Practices:
// - Uses <Paper> for grouping content
// - Optional title, subtitle, and action
// - Responsive padding and layout
//
// Usage Example:
// import { ContentCard } from '../components/ui';
// <ContentCard title="Summary" action={<TextButton>Edit</TextButton>}>...</ContentCard>

import React from "react";
import { Paper, Box, Typography, Divider } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.25,
  boxShadow: "0 10px 30px rgba(67, 97, 238, 0.05)",
  overflow: "hidden",
  border: "1px solid rgba(231, 236, 248, 0.8)",
  // Removed transition and hover effects for main content
}));

/**
 * A consistent content card component for displaying content with an optional title
 *
 * @param {Object} props - Component props
 * @param {string} [props.title] - Optional title for the card
 * @param {string} [props.subtitle] - Optional subtitle for the card
 * @param {React.ReactNode} [props.action] - Optional action button or component
 * @param {React.ReactNode} props.children - The content to display in the card
 * @param {number} [props.elevation=1] - The elevation of the card
 * @param {boolean} [props.divider=false] - Whether to show a divider below the heading
 * @param {Object} [props.sx] - Additional styles to apply to the card
 * @param {Object} [props.contentSx] - Additional styles to apply to the content container
 * @param {boolean} [props.noPadding=false] - Whether to disable padding
 */
const ContentCard = ({
  children,
  title,
  subtitle,
  action,
  elevation = 1,
  divider = false,
  sx = {},
  contentSx = {},
  noPadding = false,
  ...props
}) => {
  return (
    <StyledPaper
      elevation={elevation}
      sx={sx}
      {...props}
      aria-label={props["aria-label"] || title || "Content card"}
    >
      {title && (
        <Box
          sx={{
            p: 2.5,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            background:
              "linear-gradient(to right, rgba(67, 97, 238, 0.03), rgba(255, 255, 255, 0))",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 600,
                  color: "primary.main",
                  fontSize: "1.25rem",
                  letterSpacing: "-0.01em",
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            {action && <Box>{action}</Box>}
          </Box>
        </Box>
      )}
      <Box
        sx={{
          p: noPadding ? 0 : 3,
          ...(contentSx || {}),
        }}
      >
        {children}
      </Box>
    </StyledPaper>
  );
};

export default ContentCard;
