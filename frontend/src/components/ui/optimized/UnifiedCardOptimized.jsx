/**
 * Optimized UnifiedCard Component
 * Performance-optimized version with React.memo, useMemo, and lazy loading
 */

import React, { forwardRef, useMemo, memo, lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import { Box, Typography, Skeleton } from "@mui/material";
import { designSystem } from "../../../design-system/tokens/index.js";
import {
  PerformanceUtils,
  usePerformanceTracking,
  BundleSizeAnalyzer,
} from "../../../design-system/utils/performance.js";

// Register component size for bundle analysis
BundleSizeAnalyzer.registerComponent("UnifiedCardOptimized", 12);

// Lazy load heavy components
const LazyErrorMessage = lazy(() => import("./components/ErrorMessage"));
const LazyLoadingState = lazy(() => import("./components/LoadingState"));

// Memoized style calculations
const createCardStyles = PerformanceUtils.memoize(
  (theme, variant, interactive, loading, error) => {
    const isDark = theme.palette.mode === "dark";

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

    const loadingStyles = loading
      ? {
          pointerEvents: "none",
          opacity: 0.7,
        }
      : {};

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
  },
  (theme, variant, interactive, loading, error) =>
    `${theme.palette.mode}-${variant}-${interactive}-${loading}-${error}`
);

// Optimized styled component with memoized styles
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
    return createCardStyles(theme, variant, interactive, loading, error);
  }
);

// Memoized compound components
const CardHeader = memo(
  styled(Box)(({ theme }) => ({
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
  }))
);

const CardBody = memo(
  styled(Box)(() => ({
    padding: designSystem.spacing.semantic.card.padding.md,
    flex: 1,
    display: "flex",
    flexDirection: "column",
  }))
);

const CardFooter = memo(
  styled(Box)(({ theme }) => ({
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
  }))
);

// Optimized loading skeleton component
const OptimizedLoadingSkeleton = memo(({ children }) => (
  <CardBody>
    <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
    <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" width="100%" height={60} />
  </CardBody>
));

// Memoized accessibility props calculator
const useAccessibilityProps = PerformanceUtils.memoize(
  (
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    loading,
    error,
    interactive,
    onClick,
    role,
    tabIndex
  ) => {
    const getAriaLabel = () => {
      if (ariaLabel) return ariaLabel;
      if (loading) return "Loading content";
      if (error) return `Error: ${error}`;
      if (interactive || onClick) {
        return "Interactive card, press Enter or Space to activate";
      }
      return undefined;
    };

    return {
      "aria-label": getAriaLabel(),
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      "aria-busy": loading,
      "aria-invalid": Boolean(error),
      role: role || (interactive || onClick ? "button" : undefined),
      tabIndex:
        tabIndex !== undefined
          ? tabIndex
          : interactive || onClick
          ? 0
          : undefined,
    };
  },
  (
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    loading,
    error,
    interactive,
    onClick,
    role,
    tabIndex
  ) =>
    `${ariaLabel}-${ariaLabelledBy}-${ariaDescribedBy}-${loading}-${error}-${interactive}-${Boolean(
      onClick
    )}-${role}-${tabIndex}`
);

// Main optimized UnifiedCard component
const UnifiedCardOptimized = memo(
  forwardRef(
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
      // Performance tracking
      usePerformanceTracking("UnifiedCardOptimized", [
        variant,
        interactive,
        loading,
        error,
      ]);

      // Memoized keyboard handler
      const handleKeyDown = useMemo(() => {
        if (!onKeyDown && !onClick) return undefined;

        return (event) => {
          if (onKeyDown) {
            onKeyDown(event);
          }

          if ((interactive || onClick) && onClick) {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onClick(event);
            }
            if (event.key === "Escape") {
              event.target.blur();
            }
          }
        };
      }, [onKeyDown, onClick, interactive]);

      // Memoized accessibility props
      const accessibilityProps = useMemo(
        () =>
          useAccessibilityProps(
            ariaLabel,
            ariaLabelledBy,
            ariaDescribedBy,
            loading,
            error,
            interactive,
            onClick,
            role,
            tabIndex
          ),
        [
          ariaLabel,
          ariaLabelledBy,
          ariaDescribedBy,
          loading,
          error,
          interactive,
          onClick,
          role,
          tabIndex,
        ]
      );

      // Memoized click handler
      const handleClick = useMemo(() => {
        if (!onClick) return undefined;
        return onClick;
      }, [onClick]);

      // Render loading state with suspense
      if (loading) {
        return (
          <StyledCard
            ref={ref}
            as={Component}
            variant={variant}
            interactive={false}
            loading={true}
            error={false}
            className={className}
            style={style}
            {...accessibilityProps}
            {...props}
          >
            <Suspense fallback={<OptimizedLoadingSkeleton />}>
              <LazyLoadingState />
            </Suspense>
          </StyledCard>
        );
      }

      return (
        <StyledCard
          ref={ref}
          as={Component}
          variant={variant}
          interactive={interactive || Boolean(onClick)}
          loading={false}
          error={Boolean(error)}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={className}
          style={style}
          {...accessibilityProps}
          {...props}
        >
          {error && (
            <Suspense
              fallback={<Box sx={{ p: 2, color: "error.main" }}>{error}</Box>}
            >
              <LazyErrorMessage error={error} />
            </Suspense>
          )}
          {children}
        </StyledCard>
      );
    }
  ),
  (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    // Only re-render if essential props change
    const essentialProps = [
      "variant",
      "interactive",
      "loading",
      "error",
      "onClick",
      "children",
      "className",
      "style",
    ];

    return essentialProps.every((prop) =>
      PerformanceUtils.shallowEqual(prevProps[prop], nextProps[prop])
    );
  }
);

UnifiedCardOptimized.displayName = "UnifiedCardOptimized";

// Optimized compound components with memoization
UnifiedCardOptimized.Header = memo(
  ({
    title,
    subtitle,
    action,
    children,
    align = "left",
    variant = "default",
    ...props
  }) => {
    const headerStyles = useMemo(
      () => ({
        center: { textAlign: "center", justifyContent: "center" },
        right: { textAlign: "right", justifyContent: "flex-end" },
        left: { textAlign: "left", justifyContent: "space-between" },
      }),
      []
    );

    const variantStyles = useMemo(
      () => ({
        compact: { padding: designSystem.spacing.semantic.card.padding.sm },
        default: { padding: designSystem.spacing.semantic.card.padding.md },
        spacious: { padding: designSystem.spacing.semantic.card.padding.lg },
      }),
      []
    );

    const headerContent = useMemo(() => {
      if (title || subtitle) {
        return (
          <Box sx={{ flex: 1, minWidth: 0, textAlign: align }}>
            {title && (
              <Typography
                component="h3"
                sx={{
                  fontSize: designSystem.typography.fontSizes.lg,
                  fontWeight: designSystem.typography.fontWeights.semibold,
                  color: "primary.main",
                  lineHeight: designSystem.typography.lineHeights.tight,
                  letterSpacing: "-0.01em",
                  margin: 0,
                  textAlign: align,
                }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                sx={{
                  fontSize: designSystem.typography.fontSizes.sm,
                  fontWeight: designSystem.typography.fontWeights.normal,
                  color: "text.secondary",
                  lineHeight: designSystem.typography.lineHeights.normal,
                  marginTop: designSystem.spacing[0.5],
                  margin: 0,
                  textAlign: align,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        );
      }

      return <Box sx={{ flex: 1, textAlign: align }}>{children}</Box>;
    }, [title, subtitle, children, align]);

    return (
      <CardHeader
        {...props}
        sx={{
          ...variantStyles[variant],
          ...props.sx,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: designSystem.spacing.semantic.component.md,
            ...headerStyles[align],
          }}
        >
          {headerContent}
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
        </Box>
      </CardHeader>
    );
  },
  (prevProps, nextProps) => {
    return PerformanceUtils.shallowEqual(prevProps, nextProps);
  }
);

UnifiedCardOptimized.Body = memo(
  ({ children, padding = "default", spacing = "default", ...props }) => {
    const paddingStyles = useMemo(
      () => ({
        none: { padding: 0 },
        compact: { padding: designSystem.spacing.semantic.card.padding.sm },
        default: { padding: designSystem.spacing.semantic.card.padding.md },
        spacious: { padding: designSystem.spacing.semantic.card.padding.lg },
      }),
      []
    );

    const spacingStyles = useMemo(
      () => ({
        tight: {
          "& > * + *": {
            marginTop: designSystem.spacing.semantic.component.xs,
          },
        },
        default: {
          "& > * + *": {
            marginTop: designSystem.spacing.semantic.component.sm,
          },
        },
        relaxed: {
          "& > * + *": {
            marginTop: designSystem.spacing.semantic.component.md,
          },
        },
        loose: {
          "& > * + *": {
            marginTop: designSystem.spacing.semantic.component.lg,
          },
        },
      }),
      []
    );

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
  },
  (prevProps, nextProps) => {
    return PerformanceUtils.shallowEqual(prevProps, nextProps);
  }
);

UnifiedCardOptimized.Footer = memo(
  ({
    children,
    justify = "flex-end",
    align = "center",
    spacing = "default",
    variant = "default",
    ...props
  }) => {
    const spacingValues = useMemo(
      () => ({
        tight: designSystem.spacing.semantic.component.xs,
        default: designSystem.spacing.semantic.component.sm,
        relaxed: designSystem.spacing.semantic.component.md,
        loose: designSystem.spacing.semantic.component.lg,
      }),
      []
    );

    const variantStyles = useMemo(
      () => ({
        compact: { padding: designSystem.spacing.semantic.card.padding.sm },
        default: { padding: designSystem.spacing.semantic.card.padding.md },
        spacious: { padding: designSystem.spacing.semantic.card.padding.lg },
      }),
      []
    );

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
  },
  (prevProps, nextProps) => {
    return PerformanceUtils.shallowEqual(prevProps, nextProps);
  }
);

// PropTypes (same as original)
UnifiedCardOptimized.propTypes = {
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

export default UnifiedCardOptimized;
