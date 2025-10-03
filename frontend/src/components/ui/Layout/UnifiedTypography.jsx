/**
 * UnifiedTypography Component
 *
 * A comprehensive typography system that enforces consistent heading hierarchy
 * and provides semantic text styling across all pages.
 *
 * Features:
 * - Semantic heading level enforcement (H1-H6)
 * - Consistent typography hierarchy from design tokens
 * - Responsive font sizes
 * - Body text and caption styling with optimal readability
 * - Theme-aware text colors
 * - Accessibility-compliant contrast ratios
 */

import React from "react";
import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";
import {
  typographyHierarchy,
  responsiveTypography,
} from "../../../design-system/tokens/typography.js";
import { breakpoints } from "../../../design-system/tokens/index.js";

// Base styled typography component
const StyledTypography = styled(Typography, {
  shouldForwardProp: (prop) =>
    !["variant", "level", "responsive"].includes(prop),
})(({ theme, variant, level, responsive = true }) => {
  let styles = {};

  // Heading styles
  if (variant === "heading" && level) {
    const headingKey = `h${level}`;
    const headingStyles = typographyHierarchy.heading[headingKey];

    if (headingStyles) {
      styles = {
        fontSize: headingStyles.fontSize,
        fontWeight: headingStyles.fontWeight,
        lineHeight: headingStyles.lineHeight,
        letterSpacing: headingStyles.letterSpacing,
        margin: 0,
        marginBottom: headingStyles.marginBottom,
      };

      // Responsive font sizes for mobile
      if (responsive) {
        const mobileStyles = responsiveTypography.mobile.heading?.[headingKey];
        const tabletStyles = responsiveTypography.tablet.heading?.[headingKey];

        if (mobileStyles) {
          styles[`@media (max-width: ${breakpoints.sm})`] = {
            fontSize: mobileStyles.fontSize,
          };
        }

        if (tabletStyles) {
          styles[
            `@media (min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.lg})`
          ] = {
            fontSize: tabletStyles.fontSize,
          };
        }
      }
    }
  }

  // Display text styles
  else if (variant === "display") {
    const displaySize = level || "medium";
    const displayStyles = typographyHierarchy.display[displaySize];

    if (displayStyles) {
      styles = {
        fontSize: displayStyles.fontSize,
        fontWeight: displayStyles.fontWeight,
        lineHeight: displayStyles.lineHeight,
        letterSpacing: displayStyles.letterSpacing,
      };

      // Responsive display text
      if (responsive) {
        const mobileStyles = responsiveTypography.mobile.display?.[displaySize];
        const tabletStyles = responsiveTypography.tablet.display?.[displaySize];

        if (mobileStyles) {
          styles[`@media (max-width: ${breakpoints.sm})`] = {
            fontSize: mobileStyles.fontSize,
          };
        }

        if (tabletStyles) {
          styles[
            `@media (min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.lg})`
          ] = {
            fontSize: tabletStyles.fontSize,
          };
        }
      }
    }
  }

  // Body text styles
  else if (variant === "body") {
    const bodySize = level || "medium";
    const bodyStyles = typographyHierarchy.body[bodySize];

    if (bodyStyles) {
      styles = {
        fontSize: bodyStyles.fontSize,
        fontWeight: bodyStyles.fontWeight,
        lineHeight: bodyStyles.lineHeight,
        letterSpacing: bodyStyles.letterSpacing,
      };
    }
  }

  // Label styles
  else if (variant === "label") {
    const labelSize = level || "medium";
    const labelStyles = typographyHierarchy.label[labelSize];

    if (labelStyles) {
      styles = {
        fontSize: labelStyles.fontSize,
        fontWeight: labelStyles.fontWeight,
        lineHeight: labelStyles.lineHeight,
        letterSpacing: labelStyles.letterSpacing,
      };
    }
  }

  // Caption styles
  else if (variant === "caption") {
    const captionStyles = typographyHierarchy.caption;
    styles = {
      fontSize: captionStyles.fontSize,
      fontWeight: captionStyles.fontWeight,
      lineHeight: captionStyles.lineHeight,
      letterSpacing: captionStyles.letterSpacing,
      color: theme.palette.text.secondary,
    };
  }

  // Code styles
  else if (variant === "code") {
    const codeType = level || "inline";
    const codeStyles = typographyHierarchy.code[codeType];

    if (codeStyles) {
      styles = {
        fontSize: codeStyles.fontSize,
        fontWeight: codeStyles.fontWeight,
        fontFamily: codeStyles.fontFamily,
        lineHeight: codeStyles.lineHeight,
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.05)",
        padding: codeType === "inline" ? "2px 4px" : "12px 16px",
        borderRadius: "4px",
        border: `1px solid ${theme.palette.divider}`,
      };

      if (codeType === "block") {
        styles.display = "block";
        styles.whiteSpace = "pre-wrap";
        styles.overflowX = "auto";
      }
    }
  }

  return {
    ...styles,
    // Ensure proper word breaking for long text
    wordBreak: "break-word",
    // Smooth transitions for theme changes
    transition: theme.transitions?.create(["color"], {
      duration: theme.transitions?.duration?.shortest || "0.15s",
    }),
  };
});

/**
 * UnifiedTypography Component
 *
 * @param {Object} props - Component props
 * @param {'heading'|'display'|'body'|'label'|'caption'|'code'} props.variant - Typography variant
 * @param {number|string} props.level - Level/size within the variant (e.g., 1-6 for headings, 'large'/'medium'/'small' for body)
 * @param {React.ElementType} props.component - HTML element to render (auto-determined if not provided)
 * @param {boolean} props.responsive - Whether to apply responsive font sizes
 * @param {'primary'|'secondary'|'disabled'} props.color - Text color variant
 * @param {string} props.className - Additional CSS classes
 * @param {React.CSSProperties} props.style - Inline styles
 * @param {React.ReactNode} props.children - Text content
 */
const UnifiedTypography = React.forwardRef(
  (
    {
      variant = "body",
      level,
      component,
      responsive = true,
      color = "primary",
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    // Auto-determine component if not provided
    let autoComponent = component;

    if (!autoComponent) {
      if (variant === "heading" && level) {
        autoComponent = `h${level}`;
      } else if (variant === "display") {
        autoComponent = "h1";
      } else if (variant === "body") {
        autoComponent = "p";
      } else if (variant === "label") {
        autoComponent = "span";
      } else if (variant === "caption") {
        autoComponent = "span";
      } else if (variant === "code") {
        autoComponent = level === "block" ? "pre" : "code";
      } else {
        autoComponent = "span";
      }
    }

    return (
      <StyledTypography
        ref={ref}
        component={autoComponent}
        variant={variant}
        level={level}
        responsive={responsive}
        color={color}
        className={className}
        style={style}
        {...props}
      >
        {children}
      </StyledTypography>
    );
  }
);

UnifiedTypography.displayName = "UnifiedTypography";

// Convenience components for common use cases
export const Heading = React.forwardRef((props, ref) => (
  <UnifiedTypography ref={ref} variant="heading" {...props} />
));

export const Display = React.forwardRef((props, ref) => (
  <UnifiedTypography ref={ref} variant="display" {...props} />
));

export const Body = React.forwardRef((props, ref) => (
  <UnifiedTypography ref={ref} variant="body" {...props} />
));

export const Label = React.forwardRef((props, ref) => (
  <UnifiedTypography ref={ref} variant="label" {...props} />
));

export const Caption = React.forwardRef((props, ref) => (
  <UnifiedTypography ref={ref} variant="caption" {...props} />
));

export const Code = React.forwardRef((props, ref) => (
  <UnifiedTypography ref={ref} variant="code" {...props} />
));

// Set display names for convenience components
Heading.displayName = "Heading";
Display.displayName = "Display";
Body.displayName = "Body";
Label.displayName = "Label";
Caption.displayName = "Caption";
Code.displayName = "Code";

export default UnifiedTypography;
