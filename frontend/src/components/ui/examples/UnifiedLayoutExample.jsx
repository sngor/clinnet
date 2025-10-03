/**
 * UnifiedLayoutExample Component
 *
 * Demonstrates the usage of the unified layout system components
 * including page containers, headers, grids, flex layouts, and typography.
 */

import React from "react";
import { Box, Paper } from "@mui/material";
import {
  UnifiedPageContainer,
  UnifiedPageHeader,
  UnifiedSection,
  UnifiedGrid,
  UnifiedFlex,
  UnifiedTypography,
  Heading,
  Body,
  Caption,
  PageLayouts,
} from "../Layout/index.jsx";
import UnifiedButton from "../UnifiedButton.jsx";
import UnifiedCard from "../UnifiedCard.jsx";

const UnifiedLayoutExample = () => {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Components", href: "/components" },
    { label: "Layout System" },
  ];

  const handleAction = () => {
    console.log("Action clicked");
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      {/* Standard Page Layout */}
      <PageLayouts.Standard
        title="Layout System Demo"
        subtitle="Comprehensive examples of the unified layout components"
        breadcrumbs={breadcrumbs}
        action={
          <UnifiedButton variant="contained" onClick={handleAction}>
            Primary Action
          </UnifiedButton>
        }
      >
        {/* Typography Section */}
        <UnifiedSection
          title="Typography Hierarchy"
          subtitle="Consistent heading levels and text styling"
          titleLevel={2}
        >
          <UnifiedFlex direction="column" gap="md">
            <Heading level={3}>This is an H3 Heading</Heading>
            <Body level="large">
              This is large body text with optimal readability and line height.
            </Body>
            <Body level="medium">
              This is medium body text, the default size for most content.
            </Body>
            <Caption>This is caption text for secondary information.</Caption>
          </UnifiedFlex>
        </UnifiedSection>

        {/* Grid System Section */}
        <UnifiedSection
          title="Responsive Grid System"
          subtitle="Flexible grid layouts with mobile-first breakpoints"
          titleLevel={2}
        >
          <UnifiedGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="lg">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <UnifiedCard key={item} variant="outlined">
                <UnifiedCard.Body>
                  <Body>Grid Item {item}</Body>
                </UnifiedCard.Body>
              </UnifiedCard>
            ))}
          </UnifiedGrid>
        </UnifiedSection>
      </PageLayouts.Standard>
    </Box>
  );
};

export default UnifiedLayoutExample;
