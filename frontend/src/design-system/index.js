/**
 * Design System - Main Entry Point
 * Enhanced Design System Foundation with comprehensive tokens,
 * CSS custom properties, and utility functions
 */

// Design tokens
export * from './tokens/index.js';
export { default as designSystem } from './tokens/index.js';

// Utilities
export * from './utils/index.js';
export { default as designSystemUtils } from './utils/index.js';

// CSS Variables (for importing in CSS files)
export { default as cssVariables } from './css/variables.css';

// Re-export commonly used items for convenience
export {
    // Core design system
    designSystem,

    // Token utilities
    getSpacing,
    getColor,
    getTypography,
    getShadow,
    getTransition,

    // Theme utilities
    applyTheme,
    toggleTheme,
    getCurrentTheme,
    initializeTheme,

    // Responsive utilities
    getCurrentBreakpoint,
    isBreakpointUp,
    isBreakpointDown,
    useResponsive,

    // Accessibility utilities
    getContrastRatio,
    meetsContrastRequirement,
    generateFocusRing,
    trapFocus,

    // CSS utilities
    setCSSVariable,
    getCSSVariable,
    cssVar,
} from './utils/index.js';

// Version and metadata
export const DESIGN_SYSTEM_VERSION = '1.0.0';
export const DESIGN_SYSTEM_NAME = 'Healthcare UI Design System';

// Default configuration
export const defaultConfig = {
    theme: 'auto',
    reducedMotion: false,
    highContrast: false,
    fontSize: 'base',
    spacing: 'normal',
};

/**
 * Initialize the design system
 * @param {Object} config - Configuration options
 * @returns {Function} Cleanup function
 */
export const initializeDesignSystem = (config = defaultConfig) => {
    const { theme, ...otherConfig } = { ...defaultConfig, ...config };

    // Initialize theme system
    const themeCleanup = initializeTheme(theme);

    // Apply any additional configuration
    if (otherConfig.reducedMotion) {
        document.documentElement.style.setProperty('--duration-fast', '0.01ms');
        document.documentElement.style.setProperty('--duration-normal', '0.01ms');
        document.documentElement.style.setProperty('--duration-slow', '0.01ms');
    }

    // Return cleanup function
    return () => {
        themeCleanup();
    };
};

// Export design system as default
export default {
    ...designSystem,
    utils: designSystemUtils,
    initialize: initializeDesignSystem,
    version: DESIGN_SYSTEM_VERSION,
    name: DESIGN_SYSTEM_NAME,
};