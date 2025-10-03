/**
 * CSS Custom Properties Utilities
 * Dynamic theme switching and CSS variable management
 */

import { designSystem } from '../tokens/index.js';

/**
 * Set a CSS custom property on the document root
 * @param {string} property - CSS property name (without --)
 * @param {string} value - CSS property value
 */
export const setCSSVariable = (property, value) => {
    document.documentElement.style.setProperty(`--${property}`, value);
};

/**
 * Get a CSS custom property value from the document root
 * @param {string} property - CSS property name (without --)
 * @returns {string} CSS property value
 */
export const getCSSVariable = (property) => {
    return getComputedStyle(document.documentElement).getPropertyValue(`--${property}`).trim();
};

/**
 * Remove a CSS custom property from the document root
 * @param {string} property - CSS property name (without --)
 */
export const removeCSSVariable = (property) => {
    document.documentElement.style.removeProperty(`--${property}`);
};

/**
 * Set multiple CSS custom properties at once
 * @param {Object} properties - Object with property names as keys and values as values
 */
export const setCSSVariables = (properties) => {
    Object.entries(properties).forEach(([property, value]) => {
        setCSSVariable(property, value);
    });
};

/**
 * Apply theme to CSS custom properties
 * @param {'light' | 'dark'} theme - Theme mode
 */
export const applyTheme = (theme) => {
    const colors = designSystem.colors[theme];

    if (!colors) {
        console.warn(`Theme "${theme}" not found`);
        return;
    }

    // Apply semantic color variables
    setCSSVariables({
        'color-primary-main': colors.primary.main,
        'color-primary-light': colors.primary.light,
        'color-primary-dark': colors.primary.dark,
        'color-primary-contrast': colors.primary.contrastText,

        'color-secondary-main': colors.secondary.main,
        'color-secondary-light': colors.secondary.light,
        'color-secondary-dark': colors.secondary.dark,
        'color-secondary-contrast': colors.secondary.contrastText,

        'color-background-default': colors.background.default,
        'color-background-paper': colors.background.paper,
        'color-background-elevated': colors.background.elevated,
        'color-background-overlay': colors.background.overlay,

        'color-surface-primary': colors.surface.primary,
        'color-surface-secondary': colors.surface.secondary,
        'color-surface-tertiary': colors.surface.tertiary,
        'color-surface-disabled': colors.surface.disabled,

        'color-text-primary': colors.text.primary,
        'color-text-secondary': colors.text.secondary,
        'color-text-disabled': colors.text.disabled,
        'color-text-inverse': colors.text.inverse,

        'color-border-primary': colors.border.primary,
        'color-border-secondary': colors.border.secondary,
        'color-border-focus': colors.border.focus,
        'color-border-error': colors.border.error,

        'color-success-main': colors.success.main,
        'color-success-light': colors.success.light,
        'color-success-dark': colors.success.dark,
        'color-success-contrast': colors.success.contrastText,

        'color-warning-main': colors.warning.main,
        'color-warning-light': colors.warning.light,
        'color-warning-dark': colors.warning.dark,
        'color-warning-contrast': colors.warning.contrastText,

        'color-error-main': colors.error.main,
        'color-error-light': colors.error.light,
        'color-error-dark': colors.error.dark,
        'color-error-contrast': colors.error.contrastText,

        'color-info-main': colors.info.main,
        'color-info-light': colors.info.light,
        'color-info-dark': colors.info.dark,
        'color-info-contrast': colors.info.contrastText,
    });

    // Apply theme-specific shadows
    const shadows = theme === 'dark' ? designSystem.shadows.dark : designSystem.shadows.light;
    setCSSVariables({
        'shadow-xs': shadows.xs,
        'shadow-sm': shadows.sm,
        'shadow-md': shadows.md,
        'shadow-lg': shadows.lg,
        'shadow-xl': shadows.xl,
        'shadow-2xl': shadows['2xl'],
        'shadow-inner': shadows.inner,
        'shadow-inner-lg': shadows.innerLg,
    });
};

/**
 * Set theme attribute on document element
 * @param {'light' | 'dark' | 'auto'} theme - Theme mode
 */
export const setThemeAttribute = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
};

/**
 * Get current theme from document attribute
 * @returns {'light' | 'dark' | 'auto'} Current theme mode
 */
export const getCurrentTheme = () => {
    return document.documentElement.getAttribute('data-theme') || 'light';
};

/**
 * Toggle between light and dark themes
 * @returns {'light' | 'dark'} New theme mode
 */
export const toggleTheme = () => {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setThemeAttribute(newTheme);
    return newTheme;
};

/**
 * Detect system color scheme preference
 * @returns {'light' | 'dark'} System preferred theme
 */
export const getSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
};

/**
 * Set up system theme change listener
 * @param {Function} callback - Callback function to execute when system theme changes
 * @returns {Function} Cleanup function to remove the listener
 */
export const setupSystemThemeListener = (callback) => {
    if (typeof window === 'undefined' || !window.matchMedia) {
        return () => { }; // No-op cleanup function
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
        const systemTheme = e.matches ? 'dark' : 'light';
        callback(systemTheme);
    };

    // Use the newer addEventListener if available, fallback to addListener
    if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
    }
};

/**
 * Initialize theme system
 * @param {'light' | 'dark' | 'auto'} initialTheme - Initial theme mode
 * @param {Function} onThemeChange - Callback for theme changes
 */
export const initializeTheme = (initialTheme = 'auto', onThemeChange) => {
    // Set initial theme
    if (initialTheme === 'auto') {
        const systemTheme = getSystemTheme();
        setThemeAttribute('auto');
        if (onThemeChange) onThemeChange(systemTheme);
    } else {
        setThemeAttribute(initialTheme);
        if (onThemeChange) onThemeChange(initialTheme);
    }

    // Set up system theme listener for auto mode
    const cleanup = setupSystemThemeListener((systemTheme) => {
        if (getCurrentTheme() === 'auto' && onThemeChange) {
            onThemeChange(systemTheme);
        }
    });

    return cleanup;
};

/**
 * Create a CSS variable reference string
 * @param {string} property - CSS property name (without --)
 * @returns {string} CSS var() function string
 */
export const cssVar = (property) => `var(--${property})`;

/**
 * Create a CSS variable reference with fallback
 * @param {string} property - CSS property name (without --)
 * @param {string} fallback - Fallback value
 * @returns {string} CSS var() function string with fallback
 */
export const cssVarWithFallback = (property, fallback) => `var(--${property}, ${fallback})`;

/**
 * Generate CSS custom properties from design tokens
 * @param {Object} tokens - Design tokens object
 * @param {string} prefix - Prefix for CSS property names
 * @returns {Object} CSS custom properties object
 */
export const generateCSSVariables = (tokens, prefix = '') => {
    const variables = {};

    const processTokens = (obj, currentPrefix = '') => {
        Object.entries(obj).forEach(([key, value]) => {
            const propertyName = currentPrefix ? `${currentPrefix}-${key}` : key;

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                processTokens(value, propertyName);
            } else {
                const cssProperty = prefix ? `${prefix}-${propertyName}` : propertyName;
                variables[cssProperty] = value;
            }
        });
    };

    processTokens(tokens);
    return variables;
};

/**
 * Apply design tokens as CSS custom properties
 * @param {Object} tokens - Design tokens object
 * @param {string} prefix - Prefix for CSS property names
 */
export const applyDesignTokens = (tokens, prefix = '') => {
    const variables = generateCSSVariables(tokens, prefix);
    setCSSVariables(variables);
};

/**
 * Validate CSS custom property value
 * @param {string} property - CSS property name
 * @param {string} value - CSS property value
 * @returns {boolean} Whether the value is valid
 */
export const validateCSSVariable = (property, value) => {
    try {
        const testElement = document.createElement('div');
        testElement.style.setProperty(`--${property}`, value);
        return testElement.style.getPropertyValue(`--${property}`) === value;
    } catch {
        return false;
    }
};

/**
 * Get all CSS custom properties from the document
 * @returns {Object} Object with all CSS custom properties
 */
export const getAllCSSVariables = () => {
    const styles = getComputedStyle(document.documentElement);
    const variables = {};

    for (let i = 0; i < styles.length; i++) {
        const property = styles[i];
        if (property.startsWith('--')) {
            const value = styles.getPropertyValue(property).trim();
            variables[property.substring(2)] = value;
        }
    }

    return variables;
};