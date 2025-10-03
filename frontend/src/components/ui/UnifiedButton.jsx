/**
 * UnifiedButton Component
 * A comprehensive, polymorphic button system with consistent styling
 *
 * Features:
 * - Polymorphic rendering (can render as different HTML elements)
 * - Multiple variants (contained, outlined, text, ghost)
 * - Multiple sizes (xs, sm, md, lg, xl)
 * - Icon composition with consistent spacing
 * - Loading states with smooth transitions
 * - Full accessibility support with ARIA attributes
 * - Theme-aware styling for light/dark modes
 * - Design token integration for consistent styling
 *
 * Replaces: EnhancedButton, AppButton, PrimaryButton, SecondaryButton, TextButton, LinkButton
 */

import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import { Box, CircularProgress } from "@mui/material";
import { designSystem } from "../../design-system/tokens/index.js";

// Base button styles using design tokens
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

    // Enhanced focus styles for accessibility across all variants
    const focusStyles = {
      "&:focus-visible": {
        outline: `${designSystem.accessibility.focusRing.width} ${designSystem.accessibility.focusRing.style} ${currentColor.main}`,
        outlineOffset: designSystem.accessibility.focusRing.offset,
        zIndex: designSystem.zIndex?.docked || 10,

        // Enhanced focus ring for different variants
        ...(variant === "contained" && {
          outline: `${designSystem.accessibility.focusRing.width} ${designSystem.accessibility.focusRing.style} ${currentColor.contrastText}`,
          boxShadow: `0 0 0 4px rgba(${currentColor.main
            .replace("#", "")
            .match(/.{2}/g)
            .map((hex) => parseInt(hex, 16))
            .join(", ")}, 0.3)`,
        }),

        ...(variant === "outlined" && {
          boxShadow: `0 0 0 2px rgba(${currentColor.main
            .replace("#", "")
            .match(/.{2}/g)
            .map((hex) => parseInt(hex, 16))
            .join(", ")}, 0.2)`,
        }),

        ...(variant === "text" && {
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
        }),

        ...(variant === "ghost" && {
          backgroundColor: theme.palette.action.focus,
          borderColor: currentColor.main,
        }),
      },

      // Ensure focus is visible even when using mouse
      "&:focus": {
        zIndex: designSystem.zIndex?.docked || 10,
      },

      // High contrast mode support
      "@media (prefers-contrast: high)": {
        "&:focus-visible": {
          outline: `3px solid ${currentColor.main}`,
          outlineOffset: "2px",
        },
      },

      // Reduced motion support
      "@media (prefers-reduced-motion: reduce)": {
        transition: "none",

        "&:hover": {
          transform: "none",
        },

        "&:active": {
          transform: "none",
        },
      },
    };

    return {
      ...baseStyles,
      ...variantStyles[variant],
      ...disabledStyles,
      ...focusStyles,
    };
  }
);

// Loading spinner component
const LoadingSpinner = styled(CircularProgress)(({ theme, size }) => {
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
});

// Enhanced icon wrapper with size-aware scaling and consistent spacing
const IconWrapper = styled(Box, {
  shouldForwardProp: (prop) => !["position", "size", "iconOnly"].includes(prop),
})(({ position, size = "md", iconOnly = false }) => {
  // Icon size mapping based on button size
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

    // Icon-only button specific styles
    ...(iconOnly && {
      "& > svg": {
        width: iconSizes[size],
        height: iconSizes[size],
      },
    }),

    // Position-specific adjustments (gap is handled by parent flexbox)
    ...(position === "start" && {
      order: -1,
    }),

    ...(position === "end" && {
      order: 1,
    }),
  };
});

// Main UnifiedButton Component
const UnifiedButton = forwardRef(
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
    // Determine if this is an icon-only button
    const iconOnly = !children && (startIcon || endIcon);

    // Enhanced keyboard navigation with comprehensive support
    const handleKeyDown = (event) => {
      if (onKeyDown) {
        onKeyDown(event);
      }

      if (onClick && !disabled && !loading) {
        // Standard activation keys
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick(event);
        }

        // Escape key to blur the element (useful for focus management)
        if (event.key === "Escape") {
          event.target.blur();
        }
      }
    };

    // Comprehensive accessibility attributes with enhanced ARIA support
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

      if (loading) {
        descriptions.push("Button is currently loading");
      }

      if (disabled) {
        descriptions.push("Button is disabled");
      }

      // Add variant information for screen readers
      if (variant === "outlined") {
        descriptions.push("Outlined button");
      } else if (variant === "text") {
        descriptions.push("Text button");
      } else if (variant === "ghost") {
        descriptions.push("Ghost button");
      }

      return descriptions.length > 0 ? descriptions.join(", ") : undefined;
    };

    const accessibilityProps = {
      "aria-label": getAriaLabel(),
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy || getAriaDescription(),
      "aria-busy": loading,
      "aria-disabled": disabled || loading,
      "aria-pressed":
        variant === "contained" && !disabled && !loading ? "false" : undefined,
      role: role || (Component !== "button" ? "button" : undefined),
      tabIndex:
        tabIndex !== undefined ? tabIndex : disabled || loading ? -1 : 0,
      type: Component === "button" ? type : undefined,
    };

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
        onClick={!disabled && !loading ? onClick : undefined}
        onKeyDown={handleKeyDown}
        className={className}
        style={style}
        {...accessibilityProps}
        {...props}
      >
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
      </StyledButton>
    );
  }
);

UnifiedButton.displayName = "UnifiedButton";

// PropTypes
UnifiedButton.propTypes = {
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

export default UnifiedButton;
