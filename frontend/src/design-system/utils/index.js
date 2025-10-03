/**
 * Design System Utilities
 * Comprehensive utility functions for design system usage
 */

// Token utilities
export {
    getSpacing,
    getSemanticSpacing,
    getColor,
    getColorScale,
    getTypography,
    getFontSize,
    getFontWeight,
    getLineHeight,
    getBorderRadius,
    getSemanticBorderRadius,
    getShadow,
    getSemanticShadow,
    getTransition,
    getComponentTransition,
    getDuration,
    getEasing,
    getZIndex,
    createComponentStyle,
    getResponsiveValue,
    validateToken,
    getTokenCategory,
    createTokenStyles,
} from './tokens.js';

// CSS Variables utilities
export {
    setCSSVariable,
    getCSSVariable,
    removeCSSVariable,
    setCSSVariables,
    applyTheme,
    setThemeAttribute,
    getCurrentTheme,
    toggleTheme,
    getSystemTheme,
    setupSystemThemeListener,
    initializeTheme,
    cssVar,
    cssVarWithFallback,
    generateCSSVariables,
    applyDesignTokens,
    validateCSSVariable,
    getAllCSSVariables,
} from './cssVariables.js';

// Responsive utilities
export {
    getCurrentBreakpoint,
    isBreakpoint,
    isBreakpointUp,
    isBreakpointDown,
    isBreakpointBetween,
    getMediaQuery,
    createResponsiveStyles,
    getResponsiveValue as getResponsiveValueByBreakpoint,
    useResponsive,
    generateResponsiveClasses,
    createContainerQueries,
    getBreakpointSpacing,
    supportsHover,
    hasCoarsePointer,
    getTouchTargetSize,
} from './responsive.js';

// Accessibility utilities
export {
    getContrastRatio,
    meetsContrastRequirement,
    getAccessibleColorPair,
    generateFocusRing,
    generateAccessibleButtonStyles,
    generateAccessibleFormStyles,
    isFocusable,
    getFocusableElements,
    trapFocus,
    generateAriaAttributes,
    prefersReducedMotion,
    getAccessibleDuration,
    getAccessibleEasing,
    announceToScreenReader,
} from './accessibility.js';

// Combined utility functions
export const designSystemUtils = {
    // Token access
    tokens: {
        getSpacing,
        getColor,
        getTypography,
        getShadow,
        getTransition,
    },

    // Theme management
    theme: {
        applyTheme,
        toggleTheme,
        getCurrentTheme,
        getSystemTheme,
        initializeTheme,
    },

    // Responsive design
    responsive: {
        getCurrentBreakpoint,
        isBreakpointUp,
        isBreakpointDown,
        getMediaQuery,
        createResponsiveStyles,
    },

    // Accessibility
    accessibility: {
        getContrastRatio,
        meetsContrastRequirement,
        generateFocusRing,
        trapFocus,
        announceToScreenReader,
    },

    // CSS utilities
    css: {
        setCSSVariable,
        getCSSVariable,
        cssVar,
        generateCSSVariables,
    },
};

export default designSystemUtils;