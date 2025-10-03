import React from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { designSystem } from "../DesignSystem";
import { UnifiedPageContainer, UnifiedPageHeader } from "./UnifiedLayout";

const StyledPageWrapper = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  flexDirection: "column",
}));

const StyledContentArea = styled(Box)(({ theme }) => ({
  flex: 1,
  width: "100%",
  display: "flex",
  flexDirection: "column",
}));

/**
 * Standardized page layout that ensures consistent width, spacing, and behavior across all pages
 * This component should be used as the root wrapper for all pages in the application
 */
const StandardPageLayout = ({
  title,
  subtitle,
  action,
  breadcrumbs = [],
  loading = false,
  error = null,
  maxWidth = "lg", // Consistent default max width
  children,
  showBackButton = false,
  onBack,
  containerProps = {},
  headerProps = {},
  ...props
}) => {
  // Determine the appropriate max width based on page type
  const getMaxWidth = () => {
    // Form pages should be narrower
    if (
      title?.toLowerCase().includes("new") ||
      title?.toLowerCase().includes("edit") ||
      title?.toLowerCase().includes("add") ||
      title?.toLowerCase().includes("settings")
    ) {
      return "md";
    }

    // Management/list pages should be wider
    if (
      title?.toLowerCase().includes("management") ||
      title?.toLowerCase().includes("list") ||
      title?.toLowerCase().includes("dashboard")
    ) {
      return "xl";
    }

    // Default to lg for most pages
    return maxWidth;
  };

  const finalMaxWidth = getMaxWidth();

  return (
    <StyledPageWrapper {...props}>
      <StyledContentArea>
        <UnifiedPageContainer
          maxWidth={finalMaxWidth}
          sx={{
            px: { xs: 2, sm: 3, md: 4 }, // Consistent responsive padding
            py: { xs: 2, sm: 3 }, // Consistent vertical padding
            ...containerProps?.sx,
          }}
          {...containerProps}
        >
          <UnifiedPageHeader
            title={title}
            subtitle={subtitle}
            action={action}
            breadcrumbs={breadcrumbs}
            loading={loading}
            error={error}
            showBackButton={showBackButton}
            onBack={onBack}
            sx={{
              mb: { xs: 3, sm: 4 }, // Consistent bottom margin
              ...headerProps?.sx,
            }}
            {...headerProps}
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: { xs: 2, sm: 3 }, // Consistent gap between content sections
              flex: 1,
            }}
          >
            {children}
          </Box>
        </UnifiedPageContainer>
      </StyledContentArea>
    </StyledPageWrapper>
  );
};

/**
 * Specialized layout for dashboard pages with wider content area
 */
export const DashboardPageLayout = (props) => (
  <StandardPageLayout maxWidth="xl" {...props} />
);

/**
 * Specialized layout for form pages with narrower content area
 */
export const FormPageLayout = (props) => (
  <StandardPageLayout maxWidth="md" {...props} />
);

/**
 * Specialized layout for management/list pages with extra wide content area
 */
export const ManagementPageLayout = (props) => (
  <StandardPageLayout maxWidth="xl" {...props} />
);

/**
 * Specialized layout for detail pages with medium content area
 */
export const DetailPageLayout = (props) => (
  <StandardPageLayout maxWidth="lg" {...props} />
);

/**
 * Specialized layout for settings pages with narrow content area
 */
export const SettingsPageLayout = (props) => (
  <StandardPageLayout maxWidth="md" {...props} />
);

export default StandardPageLayout;
