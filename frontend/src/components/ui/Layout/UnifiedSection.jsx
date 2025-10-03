/**
 * UnifiedSection Component
 *
 * A reusable section component for consistent content organization.
 * Provides standardized spacing, optional titles, and semantic markup.
 *
 * Features:
 * - Consistent section spacing
 * - Optional section titles with proper hierarchy
 * - Semantic HTML structure
 * - Design token-based spacing
 * - Responsive behavior
 * - Theme-aware styling
 */

import React from "react";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import {
  spacing,
  semanticSpacing,
} from "../../../design-system/tokens/spacing.js";
import { breakpoints } from "../../../design-system/tokens/index.js";
import UnifiedTypography from "./UnifiedTypography.jsx";

const StyledSection = styled(Box, {
  shouldForwardProp: (prop) => !["spacing", "variant"].includes(prop),
})(({ spacing: spacingSize = "md", variant = "default" }) => {
  // Spacing size mapping
  const spacingMap = {
    xs: {
      marginBottom: semanticSpacing.section.xs,
      padding: spacing[4], // 32px
    },
    sm: {
      marginBottom: semanticSpacing.section.sm,
      padding: spacing[6], // 48px
    },
    md: {
      marginBottom: semanticSpacing.section.md,
      padding: spacing[8], // 64px
    },
    lg: {
      marginBottom: semanticSpacing.section.lg,
      padding: spacing[12], // 96px
    },
    xl: {
      marginBottom: semanticSpacing.section.xl,
      padding: spacing[16], // 128px
    },
  };

  const sectionSpacing = spacingMap[spacingSize] || spacingMap.md;

  const baseStyles = {
    width: "100%",
    marginBottom: sectionSpacing.marginBottom,
  };

  // Variant-specific styling
  if (variant === "padded") {
    return {
      ...baseStyles,
      padding: sectionSpacing.padding,

      // Responsive padding
      [`@media (max-width: ${breakpoints.md})`]: {
        padding: spacing[4], // 32px on mobile
      },
    };
  }

  if (variant === "card") {
    return {
      ...baseStyles,
      padding: sectionSpacing.padding,
      backgroundColor: "var(--color-surface)",
      borderRadius: "var(--border-radius-lg)",
      border: "1px solid var(--color-border)",

      // Responsive padding
      [`@media (max-width: ${breakpoints.md})`]: {
        padding: spacing[4], // 32px on mobile
      },
    };
  }

  if (variant === "hero") {
    return {
      ...baseStyles,
      padding: `${spacing[16]} 0`, // 128px top/bottom
      textAlign: "center",

      // Responsive padding
      [`@media (max-width: ${breakpoints.md})`]: {
        padding: `${spacing[12]} 0`, // 96px on mobile
      },
    };
  }

  return baseStyles;
});

const StyledSectionHeader = styled(Box)(({ theme }) => ({
  marginBottom: spacing[6], // 48px

  [`@media (max-width: ${breakpoints.md})`]: {
    marginBottom: spacing[4], // 32px on mobile
  },
}));

const StyledSectionContent = styled(Box)(() => ({
  width: "100%",
}));

/**
 * UnifiedSection Component
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Optional section title
 * @param {string} props.subtitle - Optional section subtitle
 * @param {2|3|4|5|6} props.titleLevel - Heading level for the title
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} props.spacing - Section spacing size
 * @param {'default'|'padded'|'card'|'hero'} props.variant - Section variant
 * @param {React.ElementType} props.as - HTML element to render as
 * @param {string} props.className - Additional CSS classes
 * @param {React.CSSProperties} props.style - Inline styles
 * @param {React.ReactNode} props.children - Section content
 */
const UnifiedSection = React.forwardRef(
  (
    {
      title,
      subtitle,
      titleLevel = 2,
      spacing = "md",
      variant = "default",
      as = "section",
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const hasHeader = title || subtitle;

    return (
      <StyledSection
        ref={ref}
        component={as}
        spacing={spacing}
        variant={variant}
        className={className}
        style={style}
        {...props}
      >
        {hasHeader && (
          <StyledSectionHeader>
            {title && (
              <UnifiedTypography
                variant="heading"
                level={titleLevel}
                component={`h${titleLevel}`}
              >
                {title}
              </UnifiedTypography>
            )}

            {subtitle && (
              <UnifiedTypography
                variant="body"
                level="large"
                color="secondary"
                component="p"
                style={{ marginTop: spacing[2] }} // 16px
              >
                {subtitle}
              </UnifiedTypography>
            )}
          </StyledSectionHeader>
        )}

        <StyledSectionContent>{children}</StyledSectionContent>
      </StyledSection>
    );
  }
);

UnifiedSection.displayName = "UnifiedSection";

export default UnifiedSection;
