/**
 * UnifiedCard Component
 * A polymorphic, reusable card component with composition pattern
 *
 * Features:
 * - Polymorphic rendering (can render as different HTML elements)
 * - Multiple variants (default, elevated, flat, outlined, interactive)
 * - Compound component pattern (Card.Header, Card.Body, Card.Footer)
 * - Design token integration for consistent styling
 * - Full accessibility support with ARIA attributes
 * - Theme-aware styling for light/dark modes
 *
 * Replaces: EnhancedCard, ContentCard, DashboardCard, PatientCard, ServiceCard
 */

import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import { Box, Typography, Skeleton } from "@mui/material";
import { designSystem } from "../../design-system/tokens/index.js";

// Base card styles using design tokens
const StyledCard = styled(Box, {
  shouldForwardProp: (prop) =>
    !["variant", "interactive", "loading", "error"].includes(prop),
})(
  ({
    theme,
    variant = "default",
    interactive = false,
    loading = false,
    error = false,
  }) => {
    const isDark = theme.palette.mode === "dark";

    // Base styles
    const baseStyles = {
      position: "relative",
      borderRadius: designSystem.borders.radius.lg,
      transition: designSystem.transitions.combinations.normal,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
    };

    // Variant-specific styles
    const variantStyles = {
      default: {
        border: `${designSystem.borders.width[1]} solid ${theme.palette.divider}`,
        boxShadow: designSystem.shadows.semantic.card.default,
      },
      elevated: {
        border: "none",
        boxShadow: designSystem.shadows.semantic.card.elevated,
      },
      flat: {
        border: "none",
        boxShadow: "none",
        backgroundColor: "transparent",
      },
      outlined: {
        border: `${designSystem.borders.width[2]} solid ${theme.palette.divider}`,
        boxShadow: "none",
      },
      interactive: {
        border: `${designSystem.borders.width[1]} solid ${theme.palette.divider}`,
        boxShadow: designSystem.shadows.semantic.card.default,
        cursor: "pointer",
      },
    };

    // Interactive states
    const interactiveStyles =
      interactive || variant === "interactive"
        ? {
            "&:hover": {
              boxShadow: designSystem.shadows.semantic.card.hover,
              transform: "translateY(-2px)",
              borderColor: theme.palette.primary.main,
            },
            "&:focus-visible": {
              outline: `${designSystem.accessibility.focusRing.width} ${designSystem.accessibility.focusRing.style} ${theme.palette.primary.main}`,
              outlineOffset: designSystem.accessibility.focusRing.offset,
            },
            "&:active": {
              transform: "translateY(0)",
              boxShadow: designSystem.shadows.semantic.card.default,
            },
          }
        : {};

    // Loading state styles
    const loadingStyles = loading
      ? {
          pointerEvents: "none",
          opacity: 0.7,
        }
      : {};

    // Error state styles
    const errorStyles = error
      ? {
          borderColor: theme.palette.error.main,
          backgroundColor: isDark
            ? `rgba(${theme.palette.error.main
                .replace("#", "")
                .match(/.{2}/g)
                .map((hex) => parseInt(hex, 16))
                .join(", ")}, 0.05)`
            : theme.palette.error.light,
        }
      : {};

    return {
      ...baseStyles,
      ...variantStyles[variant],
      ...interactiveStyles,
      ...loadingStyles,
      ...errorStyles,
    };
  }
);

// Card Header Component
const CardHeader = styled(Box)(({ theme }) => ({
  padding: designSystem.spacing.semantic.card.padding.md,
  borderBottom: `${designSystem.borders.width[1]} solid ${theme.palette.divider}`,
  backgroundColor:
    theme.palette.mode === "dark"
      ? `rgba(${theme.palette.primary.main
          .replace("#", "")
          .match(/.{2}/g)
          .map((hex) => parseInt(hex, 16))
          .join(", ")}, 0.08)`
      : `rgba(${theme.palette.primary.main
          .replace("#", "")
          .match(/.{2}/g)
          .map((hex) => parseInt(hex, 16))
          .join(", ")}, 0.03)`,
}));

const CardHeaderContent = styled(Box)(() => ({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: designSystem.spacing.semantic.component.md,
}));

const CardHeaderText = styled(Box)(() => ({
  flex: 1,
  minWidth: 0, // Allow text truncation
}));

const CardTitle = styled(Typography)(({ theme }) => ({
  fontSize: designSystem.typography.fontSizes.lg,
  fontWeight: designSystem.typography.fontWeights.semibold,
  color: theme.palette.primary.main,
  lineHeight: designSystem.typography.lineHeights.tight,
  letterSpacing: "-0.01em",
  margin: 0,
}));

const CardSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: designSystem.typography.fontSizes.sm,
  fontWeight: designSystem.typography.fontWeights.normal,
  color: theme.palette.text.secondary,
  lineHeight: designSystem.typography.lineHeights.normal,
  marginTop: designSystem.spacing[0.5],
  margin: 0,
}));

// Card Body Component
const CardBody = styled(Box)(() => ({
  padding: designSystem.spacing.semantic.card.padding.md,
  flex: 1,
  display: "flex",
  flexDirection: "column",
}));

// Card Footer Component
const CardFooter = styled(Box)(({ theme }) => ({
  padding: designSystem.spacing.semantic.card.padding.md,
  borderTop: `${designSystem.borders.width[1]} solid ${theme.palette.divider}`,
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.background.default
      : theme.palette.background.paper,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: designSystem.spacing.semantic.component.sm,
}));

// Error Message Component
const ErrorMessage = styled(Box)(({ theme }) => ({
  padding: designSystem.spacing.semantic.component.sm,
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.contrastText,
  fontSize: designSystem.typography.fontSizes.sm,
  fontWeight: designSystem.typography.fontWeights.medium,
  borderRadius: designSystem.borders.radius.md,
  margin: designSystem.spacing.semantic.component.sm,
}));

// Main UnifiedCard Component
const UnifiedCard = forwardRef(
  (
    {
      as: Component = "div",
      variant = "default",
      interactive = false,
      loading = false,
      error = null,
      onClick,
      onKeyDown,
      className,
      style,
      children,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      role,
      tabIndex,
      ...props
    },
    ref
  ) => {
    // Handle keyboard navigation for interactive cards with enhanced accessibility
    const handleKeyDown = (event) => {
      if (onKeyDown) {
        onKeyDown(event);
      }

      if ((interactive || variant === "interactive") && onClick) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick(event);
        }
        // Support Escape key to blur the element
        if (event.key === "Escape") {
          event.target.blur();
        }
      }
    };

    // Enhanced accessibility announcements for screen readers
    const getAriaLabel = () => {
      if (ariaLabel) return ariaLabel;
      if (loading) return "Loading content";
      if (error) return `Error: ${error}`;
      if ((interactive || variant === "interactive") && onClick) {
        return "Interactive card, press Enter or Space to activate";
      }
      return undefined;
    };

    // Determine accessibility attributes with enhanced support
    const accessibilityProps = {
      "aria-label": getAriaLabel(),
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      "aria-busy": loading,
      "aria-invalid": Boolean(error),
      role:
        role ||
        ((interactive || variant === "interactive") && onClick
          ? "button"
          : undefined),
      tabIndex:
        tabIndex !== undefined
          ? tabIndex
          : (interactive || variant === "interactive") && onClick
          ? 0
          : undefined,
    };

    return (
      <StyledCard
        ref={ref}
        as={Component}
        variant={variant}
        interactive={interactive || Boolean(onClick)}
        loading={loading}
        error={Boolean(error)}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={className}
        style={style}
        {...accessibilityProps}
        {...props}
      >
        {loading ? (
          <CardBody>
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={60} />
          </CardBody>
        ) : (
          <>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {children}
          </>
        )}
      </StyledCard>
    );
  }
);

UnifiedCard.displayName = "UnifiedCard";

// Compound Components with enhanced flexibility
UnifiedCard.Header = ({
  title,
  subtitle,
  action,
  children,
  align = "left",
  variant = "default",
  ...props
}) => {
  const headerStyles = {
    center: { textAlign: "center", justifyContent: "center" },
    right: { textAlign: "right", justifyContent: "flex-end" },
    left: { textAlign: "left", justifyContent: "space-between" },
  };

  const variantStyles = {
    compact: { padding: designSystem.spacing.semantic.card.padding.sm },
    default: { padding: designSystem.spacing.semantic.card.padding.md },
    spacious: { padding: designSystem.spacing.semantic.card.padding.lg },
  };

  return (
    <CardHeader
      {...props}
      sx={{
        ...variantStyles[variant],
        ...props.sx,
      }}
    >
      <CardHeaderContent sx={{ ...headerStyles[align] }}>
        {title || subtitle ? (
          <CardHeaderText sx={{ textAlign: align }}>
            {title && (
              <CardTitle
                component="h3"
                sx={{
                  textAlign: align,
                  ...(align === "center" && { justifySelf: "center" }),
                }}
              >
                {title}
              </CardTitle>
            )}
            {subtitle && (
              <CardSubtitle sx={{ textAlign: align }}>{subtitle}</CardSubtitle>
            )}
          </CardHeaderText>
        ) : (
          <Box sx={{ flex: 1, textAlign: align }}>{children}</Box>
        )}
        {action && (
          <Box
            sx={{
              flexShrink: 0,
              ...(align === "center" && {
                position: "absolute",
                right: designSystem.spacing.semantic.card.padding.md,
                top: "50%",
                transform: "translateY(-50%)",
              }),
            }}
          >
            {action}
          </Box>
        )}
      </CardHeaderContent>
    </CardHeader>
  );
};

UnifiedCard.Body = ({
  children,
  padding = "default",
  spacing = "default",
  ...props
}) => {
  const paddingStyles = {
    none: { padding: 0 },
    compact: { padding: designSystem.spacing.semantic.card.padding.sm },
    default: { padding: designSystem.spacing.semantic.card.padding.md },
    spacious: { padding: designSystem.spacing.semantic.card.padding.lg },
  };

  const spacingStyles = {
    tight: {
      "& > * + *": { marginTop: designSystem.spacing.semantic.component.xs },
    },
    default: {
      "& > * + *": { marginTop: designSystem.spacing.semantic.component.sm },
    },
    relaxed: {
      "& > * + *": { marginTop: designSystem.spacing.semantic.component.md },
    },
    loose: {
      "& > * + *": { marginTop: designSystem.spacing.semantic.component.lg },
    },
  };

  return (
    <CardBody
      {...props}
      sx={{
        ...paddingStyles[padding],
        ...spacingStyles[spacing],
        ...props.sx,
      }}
    >
      {children}
    </CardBody>
  );
};

UnifiedCard.Footer = ({
  children,
  justify = "flex-end",
  align = "center",
  spacing = "default",
  variant = "default",
  ...props
}) => {
  const spacingValues = {
    tight: designSystem.spacing.semantic.component.xs,
    default: designSystem.spacing.semantic.component.sm,
    relaxed: designSystem.spacing.semantic.component.md,
    loose: designSystem.spacing.semantic.component.lg,
  };

  const variantStyles = {
    compact: { padding: designSystem.spacing.semantic.card.padding.sm },
    default: { padding: designSystem.spacing.semantic.card.padding.md },
    spacious: { padding: designSystem.spacing.semantic.card.padding.lg },
  };

  return (
    <CardFooter
      {...props}
      sx={{
        justifyContent: justify,
        alignItems: align,
        gap: spacingValues[spacing],
        ...variantStyles[variant],
        ...props.sx,
      }}
    >
      {children}
    </CardFooter>
  );
};

// PropTypes
UnifiedCard.propTypes = {
  as: PropTypes.elementType,
  variant: PropTypes.oneOf([
    "default",
    "elevated",
    "flat",
    "outlined",
    "interactive",
  ]),
  interactive: PropTypes.bool,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onClick: PropTypes.func,
  onKeyDown: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node.isRequired,
  "aria-label": PropTypes.string,
  "aria-labelledby": PropTypes.string,
  "aria-describedby": PropTypes.string,
  role: PropTypes.string,
  tabIndex: PropTypes.number,
};

UnifiedCard.Header.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  action: PropTypes.node,
  children: PropTypes.node,
  align: PropTypes.oneOf(["left", "center", "right"]),
  variant: PropTypes.oneOf(["compact", "default", "spacious"]),
};

UnifiedCard.Body.propTypes = {
  children: PropTypes.node.isRequired,
  padding: PropTypes.oneOf(["none", "compact", "default", "spacious"]),
  spacing: PropTypes.oneOf(["tight", "default", "relaxed", "loose"]),
};

UnifiedCard.Footer.propTypes = {
  children: PropTypes.node.isRequired,
  justify: PropTypes.oneOf([
    "flex-start",
    "center",
    "flex-end",
    "space-between",
    "space-around",
  ]),
  align: PropTypes.oneOf(["flex-start", "center", "flex-end", "stretch"]),
  spacing: PropTypes.oneOf(["tight", "default", "relaxed", "loose"]),
  variant: PropTypes.oneOf(["compact", "default", "spacious"]),
};

export default UnifiedCard;
