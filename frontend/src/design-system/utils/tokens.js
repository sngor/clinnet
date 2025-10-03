/**
 * Design Token Utilities
 * Utility functions for accessing design tokens consistently
 */

import { designSystem } from '../tokens/index.js';

/**
 * Get spacing value by key
 * @param {string|number} key - Spacing key or multiplier
 * @returns {string} Spacing value in pixels
 */
export const getSpacing = (key) => {
    if (typeof key === 'number') {
        return `${key * 8}px`; // 8px base unit
    }
    return designSystem.spacing.scale[key] || key;
};

/**
 * Get semantic spacing value
 * @param {string} category - Spacing category (component, layout, etc.)
 * @param {string} size - Size key (xs, sm, md, lg, xl)
 * @returns {string} Spacing value
 */
export const getSemanticSpacing = (category, size) => {
    return designSystem.spacing.semantic[category]?.[size] || getSpacing(size);
};

/**
 * Get color value by path
 * @param {string} path - Color path (e.g., 'primary.main', 'neutral.500')
 * @param {'light'|'dark'} theme - Theme mode
 * @returns {string} Color value
 */
export const getColor = (path, theme = 'light') => {
    const pathArray = path.split('.');
    let color = designSystem.colors[theme];

    for (const key of pathArray) {
        color = color?.[key];
        if (!color) break;
    }

    return color || path;
};

/**
 * Get color scale value
 * @param {string} colorName - Color name (primary, neutral, etc.)
 * @param {string|number} shade - Color shade (50-900)
 * @returns {string} Color value
 */
export const getColorScale = (colorName, shade) => {
    return designSystem.colors.scales[colorName]?.[shade] || '';
};

/**
 * Get typography value by path
 * @param {string} path - Typography path (e.g., 'heading.h1.fontSize')
 * @returns {string} Typography value
 */
export const getTypography = (path) => {
    const pathArray = path.split('.');
    let value = designSystem.typography;

    for (const key of pathArray) {
        value = value?.[key];
        if (!value) break;
    }

    return value || path;
};

/**
 * Get font size by key
 * @param {string} key - Font size key (xs, sm, base, lg, etc.)
 * @returns {string} Font size value
 */
export const getFontSize = (key) => {
    return designSystem.typography.fontSizes[key] || key;
};

/**
 * Get font weight by key
 * @param {string} key - Font weight key (normal, medium, bold, etc.)
 * @returns {number} Font weight value
 */
export const getFontWeight = (key) => {
    return designSystem.typography.fontWeights[key] || key;
};

/**
 * Get line height by key
 * @param {string} key - Line height key (normal, tight, loose, etc.)
 * @returns {number} Line height value
 */
export const getLineHeight = (key) => {
    return designSystem.typography.lineHeights[key] || key;
};

/**
 * Get border radius by key
 * @param {string} key - Border radius key (sm, md, lg, etc.)
 * @returns {string} Border radius value
 */
export const getBorderRadius = (key) => {
    return designSystem.borders.radius[key] || key;
};

/**
 * Get semantic border radius for component
 * @param {string} component - Component name (button, card, input, etc.)
 * @returns {string} Border radius value
 */
export const getSemanticBorderRadius = (component) => {
    return designSystem.borders.semantic[component] || designSystem.borders.radius.md;
};

/**
 * Get shadow value by key
 * @param {string} key - Shadow key (xs, sm, md, lg, etc.)
 * @param {'light'|'dark'} theme - Theme mode
 * @returns {string} Shadow value
 */
export const getShadow = (key, theme = 'light') => {
    const shadows = theme === 'dark' ? designSystem.shadows.dark : designSystem.shadows.light;
    return shadows[key] || 'none';
};

/**
 * Get semantic shadow for component
 * @param {string} component - Component name (card, button, modal, etc.)
 * @param {string} state - Component state (default, hover, focus, etc.)
 * @param {'light'|'dark'} theme - Theme mode
 * @returns {string} Shadow value
 */
export const getSemanticShadow = (component, state = 'default', theme = 'light') => {
    const semanticShadow = designSystem.shadows.semantic[component];
    if (typeof semanticShadow === 'object') {
        return getShadow(semanticShadow[state]?.replace('shadows.', ''), theme);
    }
    return getShadow(semanticShadow?.replace('shadows.', ''), theme);
};

/**
 * Get transition value by key
 * @param {string} key - Transition key (fast, normal, slow, etc.)
 * @returns {string} Transition value
 */
export const getTransition = (key) => {
    return designSystem.transitions.combinations[key] || key;
};

/**
 * Get component transition
 * @param {string} component - Component name (button, card, input, etc.)
 * @param {string} state - Transition state (default, hover, focus, etc.)
 * @returns {string} Transition value
 */
export const getComponentTransition = (component, state = 'default') => {
    const componentTransition = designSystem.transitions.components[component];
    if (typeof componentTransition === 'object') {
        return componentTransition[state] || componentTransition.default;
    }
    return componentTransition || getTransition('normal');
};

/**
 * Get duration value by key
 * @param {string} key - Duration key (fast, normal, slow, etc.)
 * @returns {string} Duration value
 */
export const getDuration = (key) => {
    return designSystem.transitions.durations[key] || key;
};

/**
 * Get easing value by key
 * @param {string} key - Easing key (smooth, snappy, bounce, etc.)
 * @returns {string} Easing value
 */
export const getEasing = (key) => {
    return designSystem.transitions.easings[key] || key;
};

/**
 * Get z-index value by key
 * @param {string} key - Z-index key (modal, dropdown, tooltip, etc.)
 * @returns {number|string} Z-index value
 */
export const getZIndex = (key) => {
    return designSystem.layout.zIndex[key] || key;
};

/**
 * Create a complete style object for a component
 * @param {Object} config - Style configuration
 * @param {string} config.color - Color path
 * @param {string} config.fontSize - Font size key
 * @param {string} config.fontWeight - Font weight key
 * @param {string} config.spacing - Spacing key for padding
 * @param {string} config.borderRadius - Border radius key
 * @param {string} config.shadow - Shadow key
 * @param {string} config.transition - Transition key
 * @param {'light'|'dark'} theme - Theme mode
 * @returns {Object} Style object
 */
export const createComponentStyle = (config, theme = 'light') => {
    const style = {};

    if (config.color) {
        style.color = getColor(config.color, theme);
    }

    if (config.backgroundColor) {
        style.backgroundColor = getColor(config.backgroundColor, theme);
    }

    if (config.borderColor) {
        style.borderColor = getColor(config.borderColor, theme);
    }

    if (config.fontSize) {
        style.fontSize = getFontSize(config.fontSize);
    }

    if (config.fontWeight) {
        style.fontWeight = getFontWeight(config.fontWeight);
    }

    if (config.lineHeight) {
        style.lineHeight = getLineHeight(config.lineHeight);
    }

    if (config.padding) {
        style.padding = getSpacing(config.padding);
    }

    if (config.margin) {
        style.margin = getSpacing(config.margin);
    }

    if (config.borderRadius) {
        style.borderRadius = getBorderRadius(config.borderRadius);
    }

    if (config.boxShadow) {
        style.boxShadow = getShadow(config.boxShadow, theme);
    }

    if (config.transition) {
        style.transition = getTransition(config.transition);
    }

    return style;
};

/**
 * Get responsive value based on breakpoint
 * @param {Object|string} value - Responsive value object or single value
 * @param {string} breakpoint - Current breakpoint (xs, sm, md, lg, xl)
 * @returns {string} Resolved value for breakpoint
 */
export const getResponsiveValue = (value, breakpoint) => {
    if (typeof value === 'string' || typeof value === 'number') {
        return value;
    }

    if (typeof value === 'object' && value !== null) {
        // Find the appropriate value for the breakpoint
        const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
        const currentIndex = breakpointOrder.indexOf(breakpoint);

        // Look for exact match first
        if (value[breakpoint] !== undefined) {
            return value[breakpoint];
        }

        // Fall back to the closest smaller breakpoint
        for (let i = currentIndex - 1; i >= 0; i--) {
            const bp = breakpointOrder[i];
            if (value[bp] !== undefined) {
                return value[bp];
            }
        }

        // Fall back to the smallest available breakpoint
        for (const bp of breakpointOrder) {
            if (value[bp] !== undefined) {
                return value[bp];
            }
        }
    }

    return value;
};

/**
 * Validate design token value
 * @param {string} category - Token category (colors, spacing, typography, etc.)
 * @param {string} key - Token key
 * @returns {boolean} Whether the token exists
 */
export const validateToken = (category, key) => {
    const pathArray = key.split('.');
    let value = designSystem[category];

    for (const pathKey of pathArray) {
        value = value?.[pathKey];
        if (value === undefined) return false;
    }

    return true;
};

/**
 * Get all available tokens for a category
 * @param {string} category - Token category
 * @returns {Object} All tokens in the category
 */
export const getTokenCategory = (category) => {
    return designSystem[category] || {};
};

/**
 * Create CSS-in-JS style object with design tokens
 * @param {Object} styles - Style definitions using token keys
 * @param {'light'|'dark'} theme - Theme mode
 * @returns {Object} Resolved CSS-in-JS style object
 */
export const createTokenStyles = (styles, theme = 'light') => {
    const resolvedStyles = {};

    Object.entries(styles).forEach(([property, value]) => {
        if (typeof value === 'string' && value.startsWith('$')) {
            // Token reference (e.g., '$colors.primary.main')
            const tokenPath = value.substring(1);
            const [category, ...path] = tokenPath.split('.');

            switch (category) {
                case 'colors':
                    resolvedStyles[property] = getColor(path.join('.'), theme);
                    break;
                case 'spacing':
                    resolvedStyles[property] = getSpacing(path[0]);
                    break;
                case 'typography':
                    resolvedStyles[property] = getTypography(path.join('.'));
                    break;
                case 'shadows':
                    resolvedStyles[property] = getShadow(path[0], theme);
                    break;
                case 'transitions':
                    resolvedStyles[property] = getTransition(path[0]);
                    break;
                default:
                    resolvedStyles[property] = value;
            }
        } else {
            resolvedStyles[property] = value;
        }
    });

    return resolvedStyles;
};