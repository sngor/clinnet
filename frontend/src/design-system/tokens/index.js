/**
 * Design System Tokens
 * Comprehensive design token system with complete color palettes,
 * typography scales, spacing systems, and more
 */

import { lightColors, darkColors, colorScales } from './colors.js';
import {
    fontSizes,
    fontWeights,
    lineHeights,
    letterSpacing,
    fontFamilies,
    typographyHierarchy,
    responsiveTypography
} from './typography.js';
import {
    spacing,
    semanticSpacing,
    gridSpacing,
    responsiveSpacing,
    getSpacing,
    getResponsiveSpacing
} from './spacing.js';
import {
    borderRadius,
    borderWidth,
    borderStyle,
    semanticBorderRadius,
    borders,
    outlines,
    componentBorders
} from './borders.js';
import {
    shadows,
    darkShadows,
    coloredShadows,
    semanticShadows,
    getShadow,
    getColoredShadow
} from './shadows.js';
import {
    durations,
    easings,
    transitions,
    componentTransitions,
    keyframes,
    createTransition,
    combineTransitions
} from './transitions.js';

// Breakpoints for responsive design
export const breakpoints = {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
};

// Z-index scale for layering
export const zIndex = {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
};

// Accessibility constants
export const accessibility = {
    // Focus ring configuration
    focusRing: {
        width: '2px',
        style: 'solid',
        offset: '2px',
    },

    // Minimum touch target size (44px x 44px per WCAG)
    minTouchTarget: '44px',

    // WCAG contrast ratios
    contrastRatios: {
        aa: 4.5,      // WCAG AA standard
        aaa: 7,       // WCAG AAA standard
        large: 3,     // Large text AA standard
    },

    // Animation preferences
    reducedMotion: {
        duration: '0.01ms',
        easing: 'linear',
    },
};

// Complete design system object
export const designSystem = {
    // Color system
    colors: {
        light: lightColors,
        dark: darkColors,
        scales: colorScales,
    },

    // Typography system
    typography: {
        fontSizes,
        fontWeights,
        lineHeights,
        letterSpacing,
        fontFamilies,
        hierarchy: typographyHierarchy,
        responsive: responsiveTypography,
    },

    // Spacing system
    spacing: {
        scale: spacing,
        semantic: semanticSpacing,
        grid: gridSpacing,
        responsive: responsiveSpacing,
    },

    // Border system
    borders: {
        radius: borderRadius,
        width: borderWidth,
        style: borderStyle,
        semantic: semanticBorderRadius,
        combinations: borders,
        outlines,
        components: componentBorders,
    },

    // Shadow system
    shadows: {
        light: shadows,
        dark: darkShadows,
        colored: coloredShadows,
        semantic: semanticShadows,
    },

    // Transition system
    transitions: {
        durations,
        easings,
        combinations: transitions,
        components: componentTransitions,
        keyframes,
    },

    // Layout system
    layout: {
        breakpoints,
        zIndex,
    },

    // Accessibility
    accessibility,
};

// Export individual token categories
export {
    // Colors
    lightColors,
    darkColors,
    colorScales,

    // Typography
    fontSizes,
    fontWeights,
    lineHeights,
    letterSpacing,
    fontFamilies,
    typographyHierarchy,
    responsiveTypography,

    // Spacing
    spacing,
    semanticSpacing,
    gridSpacing,
    responsiveSpacing,
    getSpacing,
    getResponsiveSpacing,

    // Borders
    borderRadius,
    borderWidth,
    borderStyle,
    semanticBorderRadius,
    borders,
    outlines,
    componentBorders,

    // Shadows
    shadows,
    darkShadows,
    coloredShadows,
    semanticShadows,
    getShadow,
    getColoredShadow,

    // Transitions
    durations,
    easings,
    transitions,
    componentTransitions,
    keyframes,
    createTransition,
    combineTransitions,


};

// Default export
export default designSystem;