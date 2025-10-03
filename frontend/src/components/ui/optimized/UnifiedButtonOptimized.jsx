/**
 * Optimized UnifiedButton Component
 * Performance-optimized version with React.memo, useMemo, and efficient re-renders
 */

import React, { forwardRef, useMemo, memo, useCallback } from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import { Box, CircularProgress } from "@mui/material";
import { designSystem } from "../../../design-system/tokens/index.js";
import {
  PerformanceUtils,
  usePerformanceTracking,
  BundleSizeAnalyzer,
} from "../../../design-system/utils/performance.js";

// Register component size for bundle analysis
BundleSizeAnalyzer.registerComponent("UnifiedButtonOptimized", 8);

// Memoized style calculations with efficient caching
const createButtonStyles = PerformanceUtils.memoize(
  (theme, variant, size, color, loading, disabled, fullWidth, iconOnly) => {
    const isDark = theme.palette.mode === "dark";

    // Size configurations
    const sizeConfig = {
      xs: {
        fontSize: designSystem.typography.fontSizes.xs,
        fontWeight: designSystem.typography.fontWeights.medium,
        padding: designSystem.spacing.semantic.button.padding.xs,
        minHeight: "32px",
        borderRadius: designSystem.borders.radius.md,
        gap: designSystem.spacing[1],
      },
      sm: {
        fontSize: designSystem.typography.fontSizes.sm,
        fontWeight: designSystem.typography.fontWeights.medium,
        padding: designSystem.spacing.semantic.button.padding.sm,
        minHeight: "36px",
        borderRadius: designSystem.borders.radius.md,
        gap: designSystem.spacing[1.5],
      },
      md: {
        fontSize: designSystem.typography.fontSizes.base,
        fontWeight: designSystem.typography.fontWeights.medium,
        padding: designSystem.spacing.semantic.button.padding.md,
        minHeight: designSystem.accessibility.minTouchTarget,
        borderRadius: designSystem.borders.radius.lg,
        gap: designSystem.spacing[2],
      },
      lg: {
        fontSize: designSystem.typography.fontSizes.lg,
        fontWeight: designSystem.typography.fontWeights.medium,
        padding: designSystem.spacing.semantic.button.padding.lg,
        minHeight: "48px",
        borderRadius: designSystem.borders.radius.lg,
        gap: designSystem.spacing[2],
      },
      xl: {
        fontSize: designSystem.typography.fontSizes.xl,
        fontWeight: designSystem.typography.fontWeights.semibold,
        padding: designSystem.spacing.semantic.button.padding.xl,
        minHeight: "56px",
        borderRadius: designSystem.borders.radius.xl,
        gap: designSystem.spacing[2.5],
      },
    };

    // Color configurations
    const colorConfig = {
      primary: {
        main: theme.palette.primary.main,
        light: theme.palette.primary.light,
        dark: theme.palette.primary.dark,
        contrastText: theme.palette.primary.contrastText,
      },
      secondary: {
        main: theme.palette.secondary.main,
        light: theme.palette.secondary.light,
        dark: theme.palette.secondary.dark,
        contrastText: theme.palette.secondary.contrastText,
      },
      success: {
        main: theme.palette.success.main,
        light: theme.palette.success.light,
        dark: theme.palette.success.dark,
        contrastText: theme.palette.success.contrastText,
      },
      warning: {
        main: theme.palette.warning.main,
        light: theme.palette.warning.light,
        dark: theme.palette.warning.dark,
        contrastText: theme.palette.warning.contrastText,
      },
      error: {
        main: theme.palette.error.main,
        light: theme.palette.error.light,
        dark: theme.palette.error.dark,
        contrastText: theme.palette.error.contrastText,
      },
    };

    const currentSize = sizeConfig[size];
    const currentColor = colorConfig[color];

    // Base styles
    const baseStyles = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: currentSize.gap,
      fontFamily: designSystem.typography.fontFamilies.sans,
      fontSize: currentSize.fontSize,
      fontWeight: currentSize.fontWeight,
      lineHeight: designSystem.typography.lineHeights.none,
      letterSpacing: designSystem.typography.letterSpacing.normal,
      textDecoration: "none",
      textAlign: "center",
      whiteSpace: "nowrap",
      userSelect: "none",
      cursor: disabled || loading ? "not-allowed" : "pointer",
      border: "none",
      borderRadius: currentSize.borderRadius,
      padding: iconOnly ? currentSize.minHeight : currentSize.padding,
      minHeight: currentSize.minHeight,
      minWidth: iconOnly ? currentSize.minHeight : fullWidth ? "100%" : "auto",
      width: fullWidth ? "100%" : "auto",
      position: "relative",
      overflow: "hidden",
      transition: designSystem.transitions.combinations.normal,
      outline: "none",

      // Icon-only button adjustments
      ...(iconOnly && {
        aspectRatio: "1",
        padding: 0,
        minWidth: currentSize.minHeight,
        width: currentSize.minHeight,
      }),
    };

    // Variant-specific styles
    const variantStyles = {
      contained: {
        backgroundColor: currentColor.main,
        color: currentColor.contrastText,
        boxShadow:
          designSystem.shadows.semantic.button?.default ||
          designSystem.shadows.light.sm,

        "&:hover":
          !disabled && !loading
            ? {
                backgroundColor: currentColor.dark,
                boxShadow:
                  designSystem.shadows.semantic.button?.hover ||
                  designSystem.shadows.light.md,
                transform: "translateY(-1px)",
              }
            : {},

        "&:active":
          !disabled && !loading
            ? {
                backgroundColor: currentColor.dark,
                boxShadow:
                  designSystem.shadows.semantic.button?.active ||
                  designSystem.shadows.light.sm,
                transform: "translateY(0)",
              }
            : {},
      },

      outlined: {
        backgroundColor: "transparent",
        color: currentColor.main,
        border: `${designSystem.borders.width[2]} solid ${currentColor.main}`,

        "&:hover":
          !disabled && !loading
            ? {
                backgroundColor: isDark
                  ? `rgba(${currentColor.main
                      .replace("#", "")
                      .match(/.{2}/g)
                      .map((hex) => parseInt(hex, 16))
                      .join(", ")}, 0.08)`
                  : currentColor.light,
                borderColor: currentColor.dark,
              }
            : {},

        "&:active":
          !disabled && !loading
            ? {
                backgroundColor: isDark
                  ? `rgba(${currentColor.main
                      .replace("#", "")
                      .match(/.{2}/g)
                      .map((hex) => parseInt(hex, 16))
                      .join(", ")}, 0.12)`
                  : currentColor.light,
              }
            : {},
      },

      text: {
        backgroundColor: "transparent",
        color: currentColor.main,

        "&:hover":
          !disabled && !loading
            ? {
                backgroundColor: isDark
                  ? `rgba(${currentColor.main
                      .replace("#", "")
                      .match(/.{2}/g)
                      .map((hex) => parseInt(hex, 16))
                      .join(", ")}, 0.08)`
                  : `rgba(${currentColor.main
                      .replace("#", "")
                      .match(/.{2}/g)
                      .map((hex) => parseInt(hex, 16))
                      .join(", ")}, 0.04)`,
              }
            : {},

        "&:active":
          !disabled && !loading
            ? {
                backgroundColor: isDark
                  ? `rgba(${currentColor.main
                      .replace("#", "")
                      .match(/.{2}/g)
                      .map((hex) => parseInt(hex, 16))
                      .join(", ")}, 0.12)`
                  : `rgba(${currentColor.main
                      .replace("#", "")
                      .match(/.{2}/g)
                      .map((hex) => parseInt(hex, 16))
                      .join(", ")}, 0.08)`,
              }
            : {},
      },

      ghost: {
        backgroundColor: "transparent",
        color: theme.palette.text.primary,
        border: `${designSystem.borders.width[1]} solid transparent`,

        "&:hover":
          !disabled && !loading
            ? {
                backgroundColor: theme.palette.action.hover,
                borderColor: theme.palette.divider,
              }
            : {},

        "&:active":
          !disabled && !loading
            ? {
                backgroundColor: theme.palette.action.selected,
              }
            : {},
      },
    };

    // Disabled state styles
    const disabledStyles =
      disabled || loading
        ? {
            opacity: 0.6,
            cursor: "not-allowed",
            pointerEvents: "none",

            "&:hover": {
              transform: "none",
              boxShadow:
                variant === "contained"
                  ? designSystem.shadows.semantic.button?.default ||
                    designSystem.shadows.light.sm
                  : "none",
            },
          }
        : {};

    // Focus styles
    const focusStyles = {
      "&:focus-visible": {
        outline: `${designSystem.accessibility.focusRing.width} ${designSystem.accessibility.focusRing.style} ${currentColor.main}`,
        outlineOffset: designSystem.accessibility.focusRing.offset,
        zIndex: designSystem.zIndex?.docked || 10,

        ...(variant === "contained" && {
          outline: `${designSystem.accessibility.focusRing.width} ${designSystem.accessibility.focusRing.style} ${currentColor.contrastText}`,
          boxShadow: `0 0 0 4px rgba(${currentColor.main
            .replace("#", "")
            .match(/.{2}/g)
            .map((hex) => parseInt(hex, 16))
            .join(", ")}, 0.3)`,
        }),
      },

      "&:focus": {
        zIndex: designSystem.zIndex?.docked || 10,
      },

      "@media (prefers-contrast: high)": {
        "&:focus-visible": {
          outline: `3px solid ${currentColor.main}`,
          outlineOffset: "2px",
        },
      },

      "@media (prefers-reduced-motion: reduce)": {
        transition: "none",
        "&:hover": { transform: "none" },
        "&:active": { transform: "none" },
      },
    };

    return {
      ...baseStyles,
      ...variantStyles[variant],
      ...disabledStyles,
      ...focusStyles,
    };
  },
  (theme, variant, size, color, loading, disabled, fullWidth, iconOnly) =>
    `${theme.palette.mode}-${variant}-${size}-${color}-${loading}-${disabled}-${fullWidth}-${iconOnly}`
);

// Optimized styled component
const StyledButton = styled(Box, {
  shouldForwardProp: (prop) =>
    ![
      "variant",
      "size",
      "color",
      "loading",
      "disabled",
      "fullWidth",
      "iconOnly",
    ].includes(prop),
})(
  ({
    theme,
    variant = "contained",
    size = "md",
    color = "primary",
    loading = false,
    disabled = false,
    fullWidth = false,
    iconOnly = false,
  }) => {
    return createButtonStyles(
      theme,
      variant,
      size,
      color,
      loading,
      disabled,
      fullWidth,
      iconOnly
    );
  }
);

// Memoized loading spinner
const LoadingSpinner = memo(
  styled(CircularProgress)(({ theme, size }) => {
    const spinnerSizes = {
      xs: 14,
      sm: 16,
      md: 18,
      lg: 20,
      xl: 22,
    };

    return {
      color: "inherit",
      size: spinnerSizes[size] || 18,
    };
  })
);

// Memoized icon wrapper
const IconWrapper = memo(
  styled(Box, {
    shouldForwardProp: (prop) =>
      !["position", "size", "iconOnly"].includes(prop),
  })(({ position, size = "md", iconOnly = false }) => {
    const iconSizes = {
      xs: "14px",
      sm: "16px",
      md: "18px",
      lg: "20px",
      xl: "24px",
    };

    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      lineHeight: 1,

      "& > svg": {
        display: "block",
        width: iconSizes[size],
        height: iconSizes[size],
        fontSize: iconSizes[size],
        transition: designSystem.transitions.combinations.fast,
      },

      ...(iconOnly && {
        "& > svg": {
          width: iconSizes[size],
          height: iconSizes[size],
        },
      }),

      ...(position === "start" && { order: -1 }),
      ...(position === "end" && { order: 1 }),
    };
  })
);

// Memoized accessibility props calculator
const useAccessibilityProps = PerformanceUtils.memoize(
  (
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    loading,
    disabled,
    children,
    iconOnly,
    role,
    tabIndex,
    type
  ) => {
    const getAriaLabel = () => {
      if (ariaLabel) return ariaLabel;
      if (iconOnly) {
        if (loading) return "Loading";
        return "Button";
      }
      if (loading) return `Loading: ${children}`;
      return undefined;
    };

    const getAriaDescription = () => {
      const descriptions = [];
      if (loading) descriptions.push("Button is currently loading");
      if (disabled) descriptions.push("Button is disabled");
      return descriptions.length > 0 ? descriptions.join(", ") : undefined;
    };

    return {
      "aria-label": getAriaLabel(),
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy || getAriaDescription(),
      "aria-busy": loading,
      "aria-disabled": disabled || loading,
      role: role || "button",
      tabIndex:
        tabIndex !== undefined ? tabIndex : disabled || loading ? -1 : 0,
      type: type,
    };
  },
  (
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    loading,
    disabled,
    children,
    iconOnly,
    role,
    tabIndex,
    type
  ) =>
    `${ariaLabel}-${ariaLabelledBy}-${ariaDescribedBy}-${loading}-${disabled}-${children}-${iconOnly}-${role}-${tabIndex}-${type}`
);

// Main optimized UnifiedButton component
const UnifiedButtonOptimized = memo(
  forwardRef(
    (
      {
        as: Component = "button",
        variant = "contained",
        size = "md",
        color = "primary",
        loading = false,
        disabled = false,
        fullWidth = false,
        startIcon,
        endIcon,
        children,
        onClick,
        onKeyDown,
        className,
        style,
        type = "button",
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
      usePerformanceTracking("UnifiedButtonOptimized", [
        variant,
        size,
        color,
        loading,
        disabled,
      ]);

      // Memoized calculations
      const iconOnly = useMemo(
        () => !children && (startIcon || endIcon),
        [children, startIcon, endIcon]
      );

      // Memoized keyboard handler
      const handleKeyDown = useCallback(
        (event) => {
          if (onKeyDown) {
            onKeyDown(event);
          }

          if (onClick && !disabled && !loading) {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onClick(event);
            }
            if (event.key === "Escape") {
              event.target.blur();
            }
          }
        },
        [onKeyDown, onClick, disabled, loading]
      );

      // Memoized click handler
      const handleClick = useCallback(
        (event) => {
          if (!disabled && !loading && onClick) {
            onClick(event);
          }
        },
        [disabled, loading, onClick]
      );

      // Memoized accessibility props
      const accessibilityProps = useMemo(
        () =>
          useAccessibilityProps(
            ariaLabel,
            ariaLabelledBy,
            ariaDescribedBy,
            loading,
            disabled,
            children,
            iconOnly,
            role,
            tabIndex,
            Component === "button" ? type : undefined
          ),
        [
          ariaLabel,
          ariaLabelledBy,
          ariaDescribedBy,
          loading,
          disabled,
          children,
          iconOnly,
          role,
          tabIndex,
          Component,
          type,
        ]
      );

      // Memoized content rendering
      const buttonContent = useMemo(
        () => (
          <>
            {loading && (
              <IconWrapper size={size} iconOnly={iconOnly}>
                <LoadingSpinner size={size} />
              </IconWrapper>
            )}

            {!loading && startIcon && (
              <IconWrapper position="start" size={size} iconOnly={iconOnly}>
                {startIcon}
              </IconWrapper>
            )}

            {!loading && children && (
              <Box
                component="span"
                sx={{
                  opacity: loading ? 0.7 : 1,
                  transition: designSystem.transitions.combinations.fast,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                {children}
              </Box>
            )}

            {!loading && endIcon && (
              <IconWrapper position="end" size={size} iconOnly={iconOnly}>
                {endIcon}
              </IconWrapper>
            )}
          </>
        ),
        [loading, startIcon, endIcon, children, size, iconOnly]
      );

      return (
        <StyledButton
          ref={ref}
          as={Component}
          variant={variant}
          size={size}
          color={color}
          loading={loading}
          disabled={disabled}
          fullWidth={fullWidth}
          iconOnly={iconOnly}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={className}
          style={style}
          {...accessibilityProps}
          {...props}
        >
          {buttonContent}
        </StyledButton>
      );
    }
  ),
  (prevProps, nextProps) => {
    // Custom comparison for React.memo
    const essentialProps = [
      "variant",
      "size",
      "color",
      "loading",
      "disabled",
      "fullWidth",
      "startIcon",
      "endIcon",
      "children",
      "onClick",
      "className",
      "style",
    ];

    return essentialProps.every((prop) => {
      if (prop === "onClick") {
        // Compare function references
        return prevProps[prop] === nextProps[prop];
      }
      return PerformanceUtils.shallowEqual(prevProps[prop], nextProps[prop]);
    });
  }
);

UnifiedButtonOptimized.displayName = "UnifiedButtonOptimized";

// PropTypes (same as original)
UnifiedButtonOptimized.propTypes = {
  as: PropTypes.elementType,
  variant: PropTypes.oneOf(["contained", "outlined", "text", "ghost"]),
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "success",
    "warning",
    "error",
  ]),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  children: PropTypes.node,
  onClick: PropTypes.func,
  onKeyDown: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  type: PropTypes.string,
  "aria-label": PropTypes.string,
  "aria-labelledby": PropTypes.string,
  "aria-describedby": PropTypes.string,
  role: PropTypes.string,
  tabIndex: PropTypes.number,
};

export default UnifiedButtonOptimized;
