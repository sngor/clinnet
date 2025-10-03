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
  // Use consistent width for all pages
  const finalMaxWidth = maxWidth;

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
 * Specialized layout for dashboard pages - now uses consistent width
 */
export const DashboardPageLayout = (props) => (
  <StandardPageLayout maxWidth="lg" {...props} />
);

/**
 * Specialized layout for form pages - now uses consistent width
 */
export const FormPageLayout = (props) => (
  <StandardPageLayout maxWidth="lg" {...props} />
);

/**
 * Specialized layout for management/list pages - now uses consistent width
 */
export const ManagementPageLayout = (props) => (
  <StandardPageLayout maxWidth="lg" {...props} />
);

/**
 * Specialized layout for detail pages - now uses consistent width
 */
export const DetailPageLayout = (props) => (
  <StandardPageLayout maxWidth="lg" {...props} />
);

/**
 * Specialized layout for settings pages - now uses consistent width
 */
export const SettingsPageLayout = (props) => (
  <StandardPageLayout maxWidth="lg" {...props} />
);

export default StandardPageLayout;
