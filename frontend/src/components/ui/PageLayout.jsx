// src/components/ui/PageLayout.jsx
// Consistent page layout component for Clinnet-EMR UI system
//
// Accessibility & Best Practices:
// - Provides consistent structure for all pages
// - Handles loading and error states
// - Includes standard header and content areas
//
// Usage Example:
// import { PageLayout } from '../components/ui';
// <PageLayout
//   title="Page Title"
//   subtitle="Page description"
//   loading={loading}
//   error={error}
//   onRetry={handleRetry}
//   action={<Button>Action</Button>}
// >
//   {/* Page content */}
// </PageLayout>

import React, { useContext } from "react";
import { Box, Alert, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import PageContainer from "./PageContainer";
import PageHeading from "./PageHeading";
import LoadingIndicator from "../ui/LoadingIndicator";
import { MenuIconContext } from "../Layout/AppLayout"; // Import the context

/**
 * A consistent layout component for all pages
 */
const PageLayout = ({
  children,
  title,
  subtitle,
  loading = false,
  error = null,
  onRetry = null,
  action = null,
  maxWidth = "lg",
  showDebug = false,
  debugPanel = null,
  menuIcon = null, // <-- Add menuIcon prop
}) => {
  if (loading) {
    return (
      <PageContainer maxWidth={maxWidth}>
        <LoadingIndicator size="large" message="Loading page..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer maxWidth={maxWidth}>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            onRetry && (
              <Button color="inherit" onClick={onRetry} variant="outlined">
                Retry
              </Button>
            )
          }
        >
          {typeof error === "string"
            ? error
            : error?.message || "An unknown error occurred."}
        </Alert>
      </PageContainer>
    );
  }

  // Use menuIcon from context if not provided
  const contextMenuIcon = useContext(MenuIconContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const effectiveMenuIcon =
    !isMobile && (menuIcon !== undefined ? menuIcon : contextMenuIcon);

  return (
    <PageContainer maxWidth={maxWidth}>
      {showDebug && debugPanel}

      {action ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <PageHeading
            title={title}
            subtitle={subtitle}
            action={action}
            menuIcon={effectiveMenuIcon}
          />
        </Box>
      ) : (
        <PageHeading
          title={title}
          subtitle={subtitle}
          menuIcon={effectiveMenuIcon}
        />
      )}

      {/* Remove SectionContainer, render children directly */}
      {children}
    </PageContainer>
  );
};

export default PageLayout;
