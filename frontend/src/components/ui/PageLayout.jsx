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

import React from "react";
import { Box, Alert, Button, CircularProgress } from "@mui/material";
import PageContainer from "./PageContainer";
import PageHeading from "./PageHeading";
import { SectionContainer } from "./Container";

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
}) => {
  if (loading) {
    return (
      <PageContainer maxWidth={maxWidth}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
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
              <Button
                color="inherit"
                onClick={onRetry}
                variant="outlined"
              >
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

  return (
    <PageContainer maxWidth={maxWidth}>
      {showDebug && debugPanel}
      
      {action ? (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <PageHeading
            title={title}
            subtitle={subtitle}
          />
          {action}
        </Box>
      ) : (
        <PageHeading
          title={title}
          subtitle={subtitle}
        />
      )}
      
      <SectionContainer>
        {children}
      </SectionContainer>
    </PageContainer>
  );
};

export default PageLayout;