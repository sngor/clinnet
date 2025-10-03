/**
 * UnifiedPageHeader Component
 *
 * A standardized page header with title hierarchy, subtitle, and action placement.
 * Supports breadcrumbs and consistent styling across all pages.
 *
 * Features:
 * - Semantic heading levels (H1, H2, H3)
 * - Consistent typography hierarchy
 * - Flexible action placement
 * - Breadcrumb support
 * - Responsive layout
 * - Theme-aware styling
 */

import React from "react";
import { styled } from "@mui/material/styles";
import { Box, Typography, Breadcrumbs, Link } from "@mui/material";
import { ChevronRight as ChevronRightIcon } from "@mui/icons-material";
import {
  spacing,
  semanticSpacing,
} from "../../../design-system/tokens/spacing.js";
import { typographyHierarchy } from "../../../design-system/tokens/typography.js";
import { breakpoints } from "../../../design-system/tokens/index.js";

const StyledPageHeader = styled(Box, {
  shouldForwardProp: (prop) => !["variant", "hasActions"].includes(prop),
})(({ theme, variant = "default", hasActions }) => ({
  display: "flex",
  flexDirection: "column",
  gap: spacing[3], // 24px
  marginBottom: spacing[6], // 48px

  // Responsive margin
  [`@media (min-width: ${breakpoints.md})`]: {
    marginBottom: spacing[8], // 64px
  },

  // Variant-specific styling
  ...(variant === "hero" && {
    textAlign: "center",
    paddingTop: spacing[8], // 64px
    paddingBottom: spacing[8], // 64px
    marginBottom: spacing[12], // 96px

    [`@media (min-width: ${breakpoints.md})`]: {
      paddingTop: spacing[12], // 96px
      paddingBottom: spacing[12], // 96px
      marginBottom: spacing[16], // 128px
    },
  }),

  ...(variant === "compact" && {
    gap: spacing[2], // 16px
    marginBottom: spacing[4], // 32px

    [`@media (min-width: ${breakpoints.md})`]: {
      marginBottom: spacing[6], // 48px
    },
  }),
}));

const StyledHeaderContent = styled(Box, {
  shouldForwardProp: (prop) => !["hasActions"].includes(prop),
})(({ hasActions }) => ({
  display: "flex",
  flexDirection: "column",
  gap: spacing[2], // 16px

  [`@media (min-width: ${breakpoints.md})`]: {
    ...(hasActions && {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing[4], // 32px
    }),
  },
}));

const StyledTitleSection = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  gap: spacing[1], // 8px
  flex: 1,
  minWidth: 0, // Allow text truncation
}));

const StyledActionSection = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  gap: spacing[2], // 16px
  flexShrink: 0,

  [`@media (min-width: ${breakpoints.sm})`]: {
    flexDirection: "row",
    alignItems: "center",
  },
}));

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  marginBottom: spacing[2], // 16px

  "& .MuiBreadcrumbs-separator": {
    marginLeft: spacing[1], // 8px
    marginRight: spacing[1], // 8px
  },

  "& .MuiBreadcrumbs-li": {
    display: "flex",
    alignItems: "center",
  },

  "& a": {
    color: theme.palette.text.secondary,
    textDecoration: "none",
    fontSize: typographyHierarchy.body.small.fontSize,
    fontWeight: typographyHierarchy.body.small.fontWeight,
    transition: theme.transitions?.create(["color"], {
      duration: theme.transitions?.duration?.shortest || "0.15s",
    }),

    "&:hover": {
      color: theme.palette.primary.main,
      textDecoration: "underline",
    },

    "&:focus": {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: "2px",
      borderRadius: "2px",
    },
  },

  "& .MuiBreadcrumbs-li:last-child": {
    color: theme.palette.text.primary,
    fontWeight: typographyHierarchy.label.medium.fontWeight,
  },
}));

const StyledTitle = styled(Typography, {
  shouldForwardProp: (prop) => !["level"].includes(prop),
})(({ level = 1 }) => {
  const headingStyles = {
    1: typographyHierarchy.heading.h1,
    2: typographyHierarchy.heading.h2,
    3: typographyHierarchy.heading.h3,
  };

  const styles = headingStyles[level] || headingStyles[1];

  return {
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    lineHeight: styles.lineHeight,
    letterSpacing: styles.letterSpacing,
    margin: 0,
    wordBreak: "break-word",

    // Responsive font sizes for mobile
    [`@media (max-width: ${breakpoints.md})`]: {
      fontSize:
        level === 1
          ? typographyHierarchy.heading.h2.fontSize
          : level === 2
          ? typographyHierarchy.heading.h3.fontSize
          : typographyHierarchy.heading.h4.fontSize,
    },
  };
});

const StyledSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: typographyHierarchy.body.large.fontSize,
  fontWeight: typographyHierarchy.body.large.fontWeight,
  lineHeight: typographyHierarchy.body.large.lineHeight,
  color: theme.palette.text.secondary,
  margin: 0,
  wordBreak: "break-word",

  [`@media (max-width: ${breakpoints.md})`]: {
    fontSize: typographyHierarchy.body.medium.fontSize,
  },
}));

/**
 * UnifiedPageHeader Component
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Page title (required)
 * @param {string} props.subtitle - Optional subtitle
 * @param {React.ReactNode} props.action - Action buttons or components
 * @param {Array<{label: string, href?: string, onClick?: function}>} props.breadcrumbs - Breadcrumb items
 * @param {'default'|'compact'|'hero'} props.variant - Header variant
 * @param {1|2|3} props.level - Semantic heading level
 * @param {string} props.className - Additional CSS classes
 * @param {React.CSSProperties} props.style - Inline styles
 */
const UnifiedPageHeader = React.forwardRef(
  (
    {
      title,
      subtitle,
      action,
      breadcrumbs,
      variant = "default",
      level = 1,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const hasActions = Boolean(action);
    const headingComponent = `h${level}`;

    return (
      <StyledPageHeader
        ref={ref}
        variant={variant}
        hasActions={hasActions}
        className={className}
        style={style}
        {...props}
      >
        {breadcrumbs && breadcrumbs.length > 0 && (
          <StyledBreadcrumbs
            separator={<ChevronRightIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;

              if (isLast) {
                return (
                  <Typography key={index} component="span" aria-current="page">
                    {crumb.label}
                  </Typography>
                );
              }

              if (crumb.href) {
                return (
                  <Link key={index} href={crumb.href} underline="hover">
                    {crumb.label}
                  </Link>
                );
              }

              if (crumb.onClick) {
                return (
                  <Link
                    key={index}
                    component="button"
                    onClick={crumb.onClick}
                    underline="hover"
                    sx={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {crumb.label}
                  </Link>
                );
              }

              return (
                <Typography key={index} component="span">
                  {crumb.label}
                </Typography>
              );
            })}
          </StyledBreadcrumbs>
        )}

        <StyledHeaderContent hasActions={hasActions}>
          <StyledTitleSection>
            <StyledTitle component={headingComponent} level={level}>
              {title}
            </StyledTitle>

            {subtitle && (
              <StyledSubtitle component="p">{subtitle}</StyledSubtitle>
            )}
          </StyledTitleSection>

          {action && <StyledActionSection>{action}</StyledActionSection>}
        </StyledHeaderContent>
      </StyledPageHeader>
    );
  }
);

UnifiedPageHeader.displayName = "UnifiedPageHeader";

export default UnifiedPageHeader;
