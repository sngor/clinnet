/**
 * Responsive Breakpoint Utilities
 * Helper functions for responsive design and breakpoint management
 */

import { breakpoints } from '../tokens/index.js';

/**
 * Convert breakpoint value to number (remove 'px')
 * @param {string} breakpoint - Breakpoint value (e.g., '768px')
 * @returns {number} Numeric breakpoint value
 */
const breakpointToNumber = (breakpoint) => {
    return parseInt(breakpoint.replace('px', ''), 10);
};

/**
 * Get current breakpoint based on window width
 * @returns {string} Current breakpoint key (xs, sm, md, lg, xl, 2xl)
 */
export const getCurrentBreakpoint = () => {
    if (typeof window === 'undefined') {
        return 'md'; // Default for SSR
    }

    const width = window.innerWidth;
    const breakpointEntries = Object.entries(breakpoints)
        .map(([key, value]) => [key, breakpointToNumber(value)])
        .sort(([, a], [, b]) => b - a); // Sort descending

    for (const [key, value] of breakpointEntries) {
        if (width >= value) {
            return key;
        }
    }

    return 'xs';
};

/**
 * Check if current viewport matches a breakpoint
 * @param {string} breakpoint - Breakpoint key to check
 * @returns {boolean} Whether current viewport matches the breakpoint
 */
export const isBreakpoint = (breakpoint) => {
    return getCurrentBreakpoint() === breakpoint;
};

/**
 * Check if current viewport is at or above a breakpoint
 * @param {string} breakpoint - Minimum breakpoint key
 * @returns {boolean} Whether current viewport is at or above the breakpoint
 */
export const isBreakpointUp = (breakpoint) => {
    if (typeof window === 'undefined') {
        return false;
    }

    const width = window.innerWidth;
    const breakpointValue = breakpointToNumber(breakpoints[breakpoint]);
    return width >= breakpointValue;
};

/**
 * Check if current viewport is below a breakpoint
 * @param {string} breakpoint - Maximum breakpoint key
 * @returns {boolean} Whether current viewport is below the breakpoint
 */
export const isBreakpointDown = (breakpoint) => {
    if (typeof window === 'undefined') {
        return false;
    }

    const width = window.innerWidth;
    const breakpointValue = breakpointToNumber(breakpoints[breakpoint]);
    return width < breakpointValue;
};

/**
 * Check if current viewport is between two breakpoints
 * @param {string} minBreakpoint - Minimum breakpoint key
 * @param {string} maxBreakpoint - Maximum breakpoint key
 * @returns {boolean} Whether current viewport is between the breakpoints
 */
export const isBreakpointBetween = (minBreakpoint, maxBreakpoint) => {
    return isBreakpointUp(minBreakpoint) && isBreakpointDown(maxBreakpoint);
};

/**
 * Get media query string for a breakpoint
 * @param {string} breakpoint - Breakpoint key
 * @param {'up'|'down'|'only'} direction - Query direction
 * @returns {string} Media query string
 */
export const getMediaQuery = (breakpoint, direction = 'up') => {
    const breakpointValue = breakpoints[breakpoint];

    switch (direction) {
        case 'up':
            return `(min-width: ${breakpointValue})`;
        case 'down':
            // Subtract 0.02px to avoid overlap
            const maxWidth = breakpointToNumber(breakpointValue) - 0.02;
            return `(max-width: ${maxWidth}px)`;
        case 'only': {
            const breakpointKeys = Object.keys(breakpoints);
            const currentIndex = breakpointKeys.indexOf(breakpoint);
            const nextBreakpoint = breakpointKeys[currentIndex + 1];

            if (!nextBreakpoint) {
                return `(min-width: ${breakpointValue})`;
            }

            const maxWidth = breakpointToNumber(breakpoints[nextBreakpoint]) - 0.02;
            return `(min-width: ${breakpointValue}) and (max-width: ${maxWidth}px)`;
        }
        default:
            return `(min-width: ${breakpointValue})`;
    }
};

/**
 * Create responsive CSS media queries
 * @param {Object} styles - Styles object with breakpoint keys
 * @returns {Object} CSS-in-JS object with media queries
 */
export const createResponsiveStyles = (styles) => {
    const responsiveStyles = {};

    Object.entries(styles).forEach(([breakpoint, style]) => {
        if (breakpoints[breakpoint]) {
            const mediaQuery = `@media ${getMediaQuery(breakpoint)}`;
            responsiveStyles[mediaQuery] = style;
        } else {
            // Not a breakpoint, add as regular style
            responsiveStyles[breakpoint] = style;
        }
    });

    return responsiveStyles;
};

/**
 * Get responsive value based on current breakpoint
 * @param {Object|any} value - Responsive value object or single value
 * @returns {any} Resolved value for current breakpoint
 */
export const getResponsiveValue = (value) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return value;
    }

    const currentBreakpoint = getCurrentBreakpoint();
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

    // Look for exact match first
    if (value[currentBreakpoint] !== undefined) {
        return value[currentBreakpoint];
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

    return value;
};

/**
 * Create a responsive hook for React components
 * @returns {Object} Object with current breakpoint and helper functions
 */
export const useResponsive = () => {
    const [currentBreakpoint, setCurrentBreakpoint] = React.useState(getCurrentBreakpoint);

    React.useEffect(() => {
        const handleResize = () => {
            setCurrentBreakpoint(getCurrentBreakpoint());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        currentBreakpoint,
        isXs: currentBreakpoint === 'xs',
        isSm: currentBreakpoint === 'sm',
        isMd: currentBreakpoint === 'md',
        isLg: currentBreakpoint === 'lg',
        isXl: currentBreakpoint === 'xl',
        is2Xl: currentBreakpoint === '2xl',
        isMobile: isBreakpointDown('md'),
        isTablet: isBreakpointBetween('md', 'lg'),
        isDesktop: isBreakpointUp('lg'),
        isBreakpointUp: (bp) => isBreakpointUp(bp),
        isBreakpointDown: (bp) => isBreakpointDown(bp),
        getResponsiveValue: (value) => getResponsiveValue(value),
    };
};

/**
 * Generate responsive CSS classes
 * @param {string} property - CSS property name
 * @param {Object} values - Values for each breakpoint
 * @param {string} prefix - Class name prefix
 * @returns {Object} CSS classes object
 */
export const generateResponsiveClasses = (property, values, prefix = '') => {
    const classes = {};

    Object.entries(values).forEach(([breakpoint, value]) => {
        const className = prefix ? `${prefix}-${breakpoint}` : breakpoint;

        if (breakpoint === 'xs') {
            // Base styles (no media query)
            classes[`.${className}`] = {
                [property]: value,
            };
        } else if (breakpoints[breakpoint]) {
            // Responsive styles
            const mediaQuery = `@media ${getMediaQuery(breakpoint)}`;
            classes[`.${className}`] = {
                [mediaQuery]: {
                    [property]: value,
                },
            };
        }
    });

    return classes;
};

/**
 * Create container queries for modern browsers
 * @param {string} containerName - Container name
 * @param {Object} queries - Container queries object
 * @returns {Object} CSS-in-JS object with container queries
 */
export const createContainerQueries = (containerName, queries) => {
    const containerStyles = {};

    Object.entries(queries).forEach(([size, styles]) => {
        const containerQuery = `@container ${containerName} (min-width: ${size})`;
        containerStyles[containerQuery] = styles;
    });

    return containerStyles;
};

/**
 * Get breakpoint-specific spacing
 * @param {string} breakpoint - Breakpoint key
 * @param {string} type - Spacing type (container, section, component)
 * @returns {string} Spacing value for the breakpoint
 */
export const getBreakpointSpacing = (breakpoint, type) => {
    const spacingMap = {
        xs: { container: '16px', section: '32px', component: '8px' },
        sm: { container: '24px', section: '48px', component: '12px' },
        md: { container: '32px', section: '64px', component: '16px' },
        lg: { container: '48px', section: '96px', component: '24px' },
        xl: { container: '64px', section: '128px', component: '32px' },
        '2xl': { container: '80px', section: '160px', component: '40px' },
    };

    return spacingMap[breakpoint]?.[type] || spacingMap.md[type];
};

/**
 * Check if device supports hover
 * @returns {boolean} Whether device supports hover
 */
export const supportsHover = () => {
    if (typeof window === 'undefined') {
        return true; // Default for SSR
    }

    return window.matchMedia('(hover: hover)').matches;
};

/**
 * Check if device has a coarse pointer (touch)
 * @returns {boolean} Whether device has a coarse pointer
 */
export const hasCoarsePointer = () => {
    if (typeof window === 'undefined') {
        return false; // Default for SSR
    }

    return window.matchMedia('(pointer: coarse)').matches;
};

/**
 * Get optimal touch target size based on device
 * @returns {string} Touch target size in pixels
 */
export const getTouchTargetSize = () => {
    return hasCoarsePointer() ? '44px' : '32px';
};