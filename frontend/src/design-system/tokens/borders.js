/**
 * Border System
 * Consistent border radius, width, and style tokens
 */

// Border radius scale
export const borderRadius = {
    none: '0px',
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
    full: '9999px',
};

// Border widths
export const borderWidth = {
    0: '0px',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
};

// Border styles
export const borderStyle = {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
    double: 'double',
    none: 'none',
};

// Semantic border radius for components
export const semanticBorderRadius = {
    // Form elements
    input: borderRadius.md,
    button: borderRadius.md,
    checkbox: borderRadius.sm,
    radio: borderRadius.full,

    // Cards and containers
    card: borderRadius.lg,
    modal: borderRadius.xl,
    popover: borderRadius.lg,
    tooltip: borderRadius.md,

    // Navigation
    tab: borderRadius.md,
    pill: borderRadius.full,

    // Media
    avatar: borderRadius.full,
    image: borderRadius.lg,

    // Feedback
    alert: borderRadius.lg,
    badge: borderRadius.full,

    // Data display
    table: borderRadius.lg,
    tag: borderRadius.md,
};

// Common border combinations
export const borders = {
    // Standard borders
    thin: `${borderWidth[1]} ${borderStyle.solid}`,
    medium: `${borderWidth[2]} ${borderStyle.solid}`,
    thick: `${borderWidth[4]} ${borderStyle.solid}`,

    // Dashed borders
    dashed: `${borderWidth[1]} ${borderStyle.dashed}`,
    dashedMedium: `${borderWidth[2]} ${borderStyle.dashed}`,

    // Focus borders (will be combined with colors)
    focus: `${borderWidth[2]} ${borderStyle.solid}`,

    // None
    none: borderStyle.none,
};

// Outline styles for focus states
export const outlines = {
    none: 'none',
    thin: `${borderWidth[1]} ${borderStyle.solid}`,
    medium: `${borderWidth[2]} ${borderStyle.solid}`,
    thick: `${borderWidth[4]} ${borderStyle.solid}`,
    offset: '2px',
};

// Component-specific border configurations
export const componentBorders = {
    button: {
        default: borders.thin,
        focus: borders.focus,
        radius: semanticBorderRadius.button,
    },

    input: {
        default: borders.thin,
        focus: borders.focus,
        error: borders.medium,
        radius: semanticBorderRadius.input,
    },

    card: {
        default: borders.thin,
        elevated: borders.none,
        radius: semanticBorderRadius.card,
    },

    table: {
        cell: borders.thin,
        header: borders.medium,
        radius: semanticBorderRadius.table,
    },

    modal: {
        default: borders.none,
        radius: semanticBorderRadius.modal,
    },

    alert: {
        default: borders.thin,
        radius: semanticBorderRadius.alert,
    },
};