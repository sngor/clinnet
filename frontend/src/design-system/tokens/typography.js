/**
 * Typography Scale System
 * Optimized font sizes, line heights, and font weights
 * Mobile-first responsive typography
 */

// Font size scale (rem units for accessibility)
export const fontSizes = {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
};

// Font weights
export const fontWeights = {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
};

// Line heights optimized for readability
export const lineHeights = {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
};

// Letter spacing
export const letterSpacing = {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
};

// Font families
export const fontFamilies = {
    sans: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
    ].join(', '),
    serif: [
        'Georgia',
        'Cambria',
        '"Times New Roman"',
        'Times',
        'serif',
    ].join(', '),
    mono: [
        '"Fira Code"',
        'Consolas',
        '"Liberation Mono"',
        'Menlo',
        'Courier',
        'monospace',
    ].join(', '),
};

// Typography hierarchy definitions
export const typographyHierarchy = {
    // Display text (hero sections)
    display: {
        large: {
            fontSize: fontSizes['7xl'],
            fontWeight: fontWeights.bold,
            lineHeight: lineHeights.none,
            letterSpacing: letterSpacing.tight,
        },
        medium: {
            fontSize: fontSizes['6xl'],
            fontWeight: fontWeights.bold,
            lineHeight: lineHeights.tight,
            letterSpacing: letterSpacing.tight,
        },
        small: {
            fontSize: fontSizes['5xl'],
            fontWeight: fontWeights.semibold,
            lineHeight: lineHeights.tight,
            letterSpacing: letterSpacing.normal,
        },
    },

    // Headings
    heading: {
        h1: {
            fontSize: fontSizes['4xl'],
            fontWeight: fontWeights.bold,
            lineHeight: lineHeights.tight,
            letterSpacing: letterSpacing.tight,
            marginBottom: '1.5rem',
        },
        h2: {
            fontSize: fontSizes['3xl'],
            fontWeight: fontWeights.semibold,
            lineHeight: lineHeights.snug,
            letterSpacing: letterSpacing.tight,
            marginBottom: '1.25rem',
        },
        h3: {
            fontSize: fontSizes['2xl'],
            fontWeight: fontWeights.semibold,
            lineHeight: lineHeights.snug,
            letterSpacing: letterSpacing.normal,
            marginBottom: '1rem',
        },
        h4: {
            fontSize: fontSizes.xl,
            fontWeight: fontWeights.medium,
            lineHeight: lineHeights.snug,
            letterSpacing: letterSpacing.normal,
            marginBottom: '0.75rem',
        },
        h5: {
            fontSize: fontSizes.lg,
            fontWeight: fontWeights.medium,
            lineHeight: lineHeights.normal,
            letterSpacing: letterSpacing.normal,
            marginBottom: '0.5rem',
        },
        h6: {
            fontSize: fontSizes.base,
            fontWeight: fontWeights.semibold,
            lineHeight: lineHeights.normal,
            letterSpacing: letterSpacing.wide,
            marginBottom: '0.5rem',
        },
    },

    // Body text
    body: {
        large: {
            fontSize: fontSizes.lg,
            fontWeight: fontWeights.normal,
            lineHeight: lineHeights.relaxed,
            letterSpacing: letterSpacing.normal,
        },
        medium: {
            fontSize: fontSizes.base,
            fontWeight: fontWeights.normal,
            lineHeight: lineHeights.normal,
            letterSpacing: letterSpacing.normal,
        },
        small: {
            fontSize: fontSizes.sm,
            fontWeight: fontWeights.normal,
            lineHeight: lineHeights.normal,
            letterSpacing: letterSpacing.normal,
        },
    },

    // Labels and UI text
    label: {
        large: {
            fontSize: fontSizes.base,
            fontWeight: fontWeights.medium,
            lineHeight: lineHeights.normal,
            letterSpacing: letterSpacing.normal,
        },
        medium: {
            fontSize: fontSizes.sm,
            fontWeight: fontWeights.medium,
            lineHeight: lineHeights.normal,
            letterSpacing: letterSpacing.normal,
        },
        small: {
            fontSize: fontSizes.xs,
            fontWeight: fontWeights.medium,
            lineHeight: lineHeights.normal,
            letterSpacing: letterSpacing.wide,
        },
    },

    // Caption and helper text
    caption: {
        fontSize: fontSizes.xs,
        fontWeight: fontWeights.normal,
        lineHeight: lineHeights.normal,
        letterSpacing: letterSpacing.normal,
    },

    // Code and monospace
    code: {
        inline: {
            fontSize: fontSizes.sm,
            fontWeight: fontWeights.normal,
            fontFamily: fontFamilies.mono,
            lineHeight: lineHeights.normal,
        },
        block: {
            fontSize: fontSizes.sm,
            fontWeight: fontWeights.normal,
            fontFamily: fontFamilies.mono,
            lineHeight: lineHeights.relaxed,
        },
    },
};

// Responsive typography breakpoints
export const responsiveTypography = {
    mobile: {
        display: {
            large: { fontSize: fontSizes['5xl'] },
            medium: { fontSize: fontSizes['4xl'] },
            small: { fontSize: fontSizes['3xl'] },
        },
        heading: {
            h1: { fontSize: fontSizes['3xl'] },
            h2: { fontSize: fontSizes['2xl'] },
            h3: { fontSize: fontSizes.xl },
        },
    },
    tablet: {
        display: {
            large: { fontSize: fontSizes['6xl'] },
            medium: { fontSize: fontSizes['5xl'] },
            small: { fontSize: fontSizes['4xl'] },
        },
        heading: {
            h1: { fontSize: fontSizes['4xl'] },
            h2: { fontSize: fontSizes['3xl'] },
            h3: { fontSize: fontSizes['2xl'] },
        },
    },
};