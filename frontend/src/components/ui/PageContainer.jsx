// src/components/ui/PageContainer.jsx
// Consistent page container for Clinnet-EMR UI system
//
// Accessibility & Best Practices:
// - Uses <Container> for responsive layout
// - Use as outermost wrapper for pages
//
// Usage Example:
// import { PageContainer } from '../components/ui';
// <PageContainer><PageHeading ... /></PageContainer>

import React from "react";
import { Container } from "@mui/material";

/**
 * A consistent container for all pages to ensure consistent spacing and responsiveness
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The content to display
 * @param {Object} [props.sx] - Additional styles to apply
 *
 * Example usage for responsive padding:
 * <PageContainer sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
 *   ...
 * </PageContainer>
 */
const PageContainer = ({
  children,
  maxWidth = "lg",
  padding = 3,
  ...props
}) => {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{ py: padding }}
      {...props}
      aria-label={props["aria-label"] || "Page container"} // Ensure aria-label is provided
    >
      {children}
    </Container>
  );
};

export default PageContainer;
