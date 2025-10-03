/**
 * Shadow System
 * Five-tier shadow system for proper depth hierarchy and visual layering
 */

// Base shadow definitions
export const shadows = {
    // No shadow
    none: 'none',

    // Subtle shadows for slight elevation
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',

    // Standard shadows for cards and components
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',

    // Strong shadows for modals and overlays
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

    // Inner shadows
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    innerLg: 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.1)',
};

// Dark theme shadows (more prominent for visibility)
export const darkShadows = {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
    innerLg: 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.4)',
};

// Colored shadows for interactive states
export const coloredShadows = {
    // Primary color shadows
    primary: {
        sm: '0 1px 3px 0 rgba(59, 130, 246, 0.2), 0 1px 2px 0 rgba(59, 130, 246, 0.12)',
        md: '0 4px 6px -1px rgba(59, 130, 246, 0.2), 0 2px 4px -1px rgba(59, 130, 246, 0.12)',
        lg: '0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1)',
    },

    // Success color shadows
    success: {
        sm: '0 1px 3px 0 rgba(34, 197, 94, 0.2), 0 1px 2px 0 rgba(34, 197, 94, 0.12)',
        md: '0 4px 6px -1px rgba(34, 197, 94, 0.2), 0 2px 4px -1px rgba(34, 197, 94, 0.12)',
        lg: '0 10px 15px -3px rgba(34, 197, 94, 0.2), 0 4px 6px -2px rgba(34, 197, 94, 0.1)',
    },

    // Warning color shadows
    warning: {
        sm: '0 1px 3px 0 rgba(245, 158, 11, 0.2), 0 1px 2px 0 rgba(245, 158, 11, 0.12)',
        md: '0 4px 6px -1px rgba(245, 158, 11, 0.2), 0 2px 4px -1px rgba(245, 158, 11, 0.12)',
        lg: '0 10px 15px -3px rgba(245, 158, 11, 0.2), 0 4px 6px -2px rgba(245, 158, 11, 0.1)',
    },

    // Error color shadows
    error: {
        sm: '0 1px 3px 0 rgba(239, 68, 68, 0.2), 0 1px 2px 0 rgba(239, 68, 68, 0.12)',
        md: '0 4px 6px -1px rgba(239, 68, 68, 0.2), 0 2px 4px -1px rgba(239, 68, 68, 0.12)',
        lg: '0 10px 15px -3px rgba(239, 68, 68, 0.2), 0 4px 6px -2px rgba(239, 68, 68, 0.1)',
    },
};

// Semantic shadow usage for components
export const semanticShadows = {
    // Cards and containers
    card: {
        default: shadows.sm,
        hover: shadows.md,
        elevated: shadows.lg,
    },

    // Buttons
    button: {
        default: shadows.xs,
        hover: shadows.sm,
        active: shadows.inner,
        focus: coloredShadows.primary.sm,
    },

    // Form elements
    input: {
        default: shadows.none,
        focus: coloredShadows.primary.sm,
        error: coloredShadows.error.sm,
    },

    // Navigation
    dropdown: shadows.lg,
    popover: shadows.xl,
    tooltip: shadows.md,

    // Overlays
    modal: shadows['2xl'],
    drawer: shadows.xl,

    // Data display
    table: {
        default: shadows.sm,
        sticky: shadows.md,
    },

    // Feedback
    alert: shadows.sm,
    toast: shadows.lg,

    // Interactive states
    hover: shadows.md,
    active: shadows.inner,
    focus: shadows.lg,
};

// Utility function to get theme-appropriate shadow
export const getShadow = (shadowKey, isDark = false) => {
    const shadowMap = isDark ? darkShadows : shadows;
    return shadowMap[shadowKey] || shadows.none;
};

// Utility function to get colored shadow
export const getColoredShadow = (color, size = 'sm') => {
    return coloredShadows[color]?.[size] || shadows.none;
};