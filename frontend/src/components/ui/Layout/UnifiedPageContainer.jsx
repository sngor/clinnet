/**
 * UnifiedPageContainer Component
 *
 * A flexible page container with configurable max-width and padding.
 * Provides consistent page-level spacing and responsive behavior.
 *
 * Features:
 * - Configurable max-width with responsive breakpoints
 * - Design token-based padding system
 * - Responsive padding that adapts to screen size
 * - Semantic HTML structure
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

const StyledPageContainer = styled(Box, {
  shouldForwardProp: (prop) => !["maxWidth", "paddingSize"].includes(prop),
})(({ theme, maxWidth = "lg", paddingSize = "md" }) => {
  // Max width configurations
  const maxWidthMap = {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
    full: "100%",
  };

  // Responsive padding based on screen size and paddingSize prop
  const getPadding = (size) => {
    const paddingMap = {
      xs: {
        mobile: spacing[4], // 32px
        tablet: spacing[6], // 48px
        desktop: spacing[8], // 64px
      },
      sm: {
        mobile: spacing[6], // 48px
        tablet: spacing[8], // 64px
        desktop: spacing[12], // 96px
      },
      md: {
        mobile: spacing[8], // 64px
        tablet: spacing[12], // 96px
        desktop: spacing[16], // 128px
      },
      lg: {
        mobile: spacing[12], // 96px
        tablet: spacing[16], // 128px
        desktop: spacing[20], // 160px
      },
      xl: {
        mobile: spacing[16], // 128px
        tablet: spacing[20], // 160px
        desktop: spacing[24], // 192px
      },
    };

    return paddingMap[size] || paddingMap.md;
  };

  const paddingValues = getPadding(paddingSize);

  return {
    width: "100%",
    maxWidth: maxWidthMap[maxWidth] || maxWidthMap.lg,
    marginLeft: "auto",
    marginRight: "auto",
    paddingLeft: paddingValues.mobile,
    paddingRight: paddingValues.mobile,

    // Responsive padding
    [`@media (min-width: ${breakpoints.md})`]: {
      paddingLeft: paddingValues.tablet,
      paddingRight: paddingValues.tablet,
    },

    [`@media (min-width: ${breakpoints.lg})`]: {
      paddingLeft: paddingValues.desktop,
      paddingRight: paddingValues.desktop,
    },

    // Ensure proper box-sizing
    boxSizing: "border-box",

    // Smooth transitions for responsive changes
    transition: theme.transitions?.create(["padding"], {
      duration: theme.transitions?.duration?.standard || "0.2s",
      easing: theme.transitions?.easing?.easeInOut || "ease-in-out",
    }),
  };
});

/**
 * UnifiedPageContainer Component
 *
 * @param {Object} props - Component props
 * @param {'sm'|'md'|'lg'|'xl'|'2xl'|'full'} props.maxWidth - Maximum width of the container
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} props.paddingSize - Size of horizontal padding
 * @param {React.ElementType} props.as - HTML element or component to render as
 * @param {string} props.className - Additional CSS classes
 * @param {React.CSSProperties} props.style - Inline styles
 * @param {React.ReactNode} props.children - Child components
 */
const UnifiedPageContainer = React.forwardRef(
  (
    {
      maxWidth = "lg",
      paddingSize = "md",
      as = "div",
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <StyledPageContainer
        ref={ref}
        component={as}
        maxWidth={maxWidth}
        paddingSize={paddingSize}
        className={className}
        style={style}
        {...props}
      >
        {children}
      </StyledPageContainer>
    );
  }
);

UnifiedPageContainer.displayName = "UnifiedPageContainer";

export default UnifiedPageContainer;
