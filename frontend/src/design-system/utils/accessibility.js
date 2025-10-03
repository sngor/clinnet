/**
 * Accessibility Utilities
 * Helper functions for accessibility compliance and WCAG standards
 */

import { designSystem } from '../tokens/index.js';

/**
 * Calculate relative luminance of a color
 * @param {string} color - Hex color string (e.g., '#ffffff')
 * @returns {number} Relative luminance value (0-1)
 */
const getRelativeLuminance = (color) => {
    // Remove # if present
    const hex = color.replace('#', '');

    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Apply gamma correction
    const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    // Calculate relative luminance
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
};

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - First color (hex)
 * @param {string} color2 - Second color (hex)
 * @returns {number} Contrast ratio (1-21)
 */
export const getContrastRatio = (color1, color2) => {
    const lum1 = getRelativeLuminance(color1);
    const lum2 = getRelativeLuminance(color2);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if color combination meets WCAG contrast requirements
 * @param {string} foreground - Foreground color (hex)
 * @param {string} background - Background color (hex)
 * @param {'AA'|'AAA'} level - WCAG compliance level
 * @param {'normal'|'large'} textSize - Text size category
 * @returns {boolean} Whether combination meets requirements
 */
export const meetsContrastRequirement = (foreground, background, level = 'AA', textSize = 'normal') => {
    const ratio = getContrastRatio(foreground, background);

    const requirements = {
        AA: { normal: 4.5, large: 3 },
        AAA: { normal: 7, large: 4.5 },
    };

    return ratio >= requirements[level][textSize];
};

/**
 * Get accessible color pair from design system
 * @param {string} colorPath - Color path (e.g., 'primary.main')
 * @param {string} backgroundPath - Background color path
 * @param {'light'|'dark'} theme - Theme mode
 * @param {'AA'|'AAA'} level - WCAG compliance level
 * @returns {Object} Color pair with accessibility info
 */
export const getAccessibleColorPair = (colorPath, backgroundPath, theme = 'light', level = 'AA') => {
    const foreground = getColorFromPath(colorPath, theme);
    const background = getColorFromPath(backgroundPath, theme);

    const ratio = getContrastRatio(foreground, background);
    const meetsAA = meetsContrastRequirement(foreground, background, 'AA');
    const meetsAAA = meetsContrastRequirement(foreground, background, 'AAA');

    return {
        foreground,
        background,
        ratio: Math.round(ratio * 100) / 100,
        meetsAA,
        meetsAAA,
        meetsRequirement: level === 'AA' ? meetsAA : meetsAAA,
    };
};

/**
 * Helper function to get color from design system path
 * @param {string} path - Color path
 * @param {'light'|'dark'} theme - Theme mode
 * @returns {string} Color value
 */
const getColorFromPath = (path, theme) => {
    const pathArray = path.split('.');
    let color = designSystem.colors[theme];

    for (const key of pathArray) {
        color = color?.[key];
        if (!color) break;
    }

    return color || '#000000';
};

/**
 * Generate focus ring styles
 * @param {string} color - Focus ring color
 * @param {string} width - Focus ring width
 * @param {string} offset - Focus ring offset
 * @returns {Object} Focus ring styles
 */
export const generateFocusRing = (
    color = 'var(--color-border-focus)',
    width = 'var(--focus-ring-width)',
    offset = 'var(--focus-ring-offset)'
) => {
    return {
        outline: `${width} solid ${color}`,
        outlineOffset: offset,
    };
};

/**
 * Generate accessible button styles
 * @param {Object} config - Button configuration
 * @param {'light'|'dark'} theme - Theme mode
 * @returns {Object} Button styles with accessibility features
 */
export const generateAccessibleButtonStyles = (config, theme = 'light') => {
    const {
        variant = 'contained',
        color = 'primary',
        size = 'md',
    } = config;

    const baseStyles = {
        minHeight: designSystem.accessibility.minTouchTarget,
        minWidth: designSystem.accessibility.minTouchTarget,
        cursor: 'pointer',
        border: 'none',
        borderRadius: designSystem.borders.semantic.button,
        fontFamily: 'inherit',
        fontSize: designSystem.typography.fontSizes.base,
        fontWeight: designSystem.typography.fontWeights.medium,
        lineHeight: designSystem.typography.lineHeights.normal,
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: designSystem.spacing.semantic.button.gap,
        transition: designSystem.transitions.components.button.default,

        // Focus styles
        '&:focus': {
            ...generateFocusRing(),
        },

        // Disabled styles
        '&:disabled': {
            cursor: 'not-allowed',
            opacity: 0.6,
        },

        // Active styles
        '&:active': {
            transform: 'translateY(1px)',
        },
    };

    // Size-specific styles
    const sizeStyles = {
        xs: { padding: designSystem.spacing.semantic.button.padding.xs },
        sm: { padding: designSystem.spacing.semantic.button.padding.sm },
        md: { padding: designSystem.spacing.semantic.button.padding.md },
        lg: { padding: designSystem.spacing.semantic.button.padding.lg },
        xl: { padding: designSystem.spacing.semantic.button.padding.xl },
    };

    // Variant-specific styles
    const variantStyles = {
        contained: {
            backgroundColor: getColorFromPath(`${color}.main`, theme),
            color: getColorFromPath(`${color}.contrastText`, theme),
            '&:hover': {
                backgroundColor: getColorFromPath(`${color}.dark`, theme),
            },
        },
        outlined: {
            backgroundColor: 'transparent',
            color: getColorFromPath(`${color}.main`, theme),
            border: `1px solid ${getColorFromPath(`${color}.main`, theme)}`,
            '&:hover': {
                backgroundColor: getColorFromPath(`${color}.light`, theme),
            },
        },
        text: {
            backgroundColor: 'transparent',
            color: getColorFromPath(`${color}.main`, theme),
            '&:hover': {
                backgroundColor: getColorFromPath(`${color}.light`, theme),
            },
        },
    };

    return {
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
    };
};

/**
 * Generate accessible form field styles
 * @param {Object} config - Form field configuration
 * @param {'light'|'dark'} theme - Theme mode
 * @returns {Object} Form field styles with accessibility features
 */
export const generateAccessibleFormStyles = (config, theme = 'light') => {
    const {
        variant = 'outlined',
        size = 'md',
        error = false,
    } = config;

    const baseStyles = {
        minHeight: designSystem.accessibility.minTouchTarget,
        fontFamily: 'inherit',
        fontSize: designSystem.typography.fontSizes.base,
        lineHeight: designSystem.typography.lineHeights.normal,
        borderRadius: designSystem.borders.semantic.input,
        transition: designSystem.transitions.components.input.focus,

        // Focus styles
        '&:focus': {
            ...generateFocusRing(),
            borderColor: error
                ? getColorFromPath('error.main', theme)
                : getColorFromPath('primary.main', theme),
        },

        // Disabled styles
        '&:disabled': {
            cursor: 'not-allowed',
            opacity: 0.6,
            backgroundColor: getColorFromPath('surface.disabled', theme),
        },
    };

    // Size-specific styles
    const sizeStyles = {
        sm: { padding: designSystem.spacing.semantic.component.xs },
        md: { padding: designSystem.spacing.semantic.component.sm },
        lg: { padding: designSystem.spacing.semantic.component.md },
    };

    // Variant-specific styles
    const variantStyles = {
        outlined: {
            backgroundColor: getColorFromPath('surface.primary', theme),
            border: `1px solid ${getColorFromPath('border.primary', theme)}`,
            color: getColorFromPath('text.primary', theme),
        },
        filled: {
            backgroundColor: getColorFromPath('surface.secondary', theme),
            border: 'none',
            borderBottom: `2px solid ${getColorFromPath('border.primary', theme)}`,
            color: getColorFromPath('text.primary', theme),
        },
    };

    // Error styles
    const errorStyles = error ? {
        borderColor: getColorFromPath('error.main', theme),
        '&:focus': {
            borderColor: getColorFromPath('error.main', theme),
            boxShadow: `0 0 0 2px ${getColorFromPath('error.light', theme)}`,
        },
    } : {};

    return {
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...errorStyles,
    };
};

/**
 * Check if element is focusable
 * @param {HTMLElement} element - DOM element to check
 * @returns {boolean} Whether element is focusable
 */
export const isFocusable = (element) => {
    if (!element || element.disabled || element.hidden) {
        return false;
    }

    const focusableElements = [
        'a[href]',
        'button',
        'input',
        'textarea',
        'select',
        '[tabindex]',
        '[contenteditable]',
    ];

    return focusableElements.some(selector => {
        try {
            return element.matches(selector) && element.tabIndex !== -1;
        } catch {
            return false;
        }
    });
};

/**
 * Get all focusable elements within a container
 * @param {HTMLElement} container - Container element
 * @returns {HTMLElement[]} Array of focusable elements
 */
export const getFocusableElements = (container) => {
    if (!container) return [];

    const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors))
        .filter(element => isFocusable(element));
};

/**
 * Trap focus within a container
 * @param {HTMLElement} container - Container element
 * @returns {Function} Cleanup function to remove focus trap
 */
export const trapFocus = (container) => {
    if (!container) return () => { };

    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event) => {
        if (event.key !== 'Tab') return;

        if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement?.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement?.focus();
            }
        }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Focus first element
    firstElement?.focus();

    // Return cleanup function
    return () => {
        container.removeEventListener('keydown', handleKeyDown);
    };
};

/**
 * Generate ARIA attributes for component
 * @param {Object} config - ARIA configuration
 * @returns {Object} ARIA attributes
 */
export const generateAriaAttributes = (config) => {
    const {
        label,
        labelledBy,
        describedBy,
        expanded,
        selected,
        checked,
        disabled,
        required,
        invalid,
        live,
        atomic,
        relevant,
        busy,
        hidden,
        role,
    } = config;

    const attributes = {};

    if (label) attributes['aria-label'] = label;
    if (labelledBy) attributes['aria-labelledby'] = labelledBy;
    if (describedBy) attributes['aria-describedby'] = describedBy;
    if (expanded !== undefined) attributes['aria-expanded'] = expanded;
    if (selected !== undefined) attributes['aria-selected'] = selected;
    if (checked !== undefined) attributes['aria-checked'] = checked;
    if (disabled !== undefined) attributes['aria-disabled'] = disabled;
    if (required !== undefined) attributes['aria-required'] = required;
    if (invalid !== undefined) attributes['aria-invalid'] = invalid;
    if (live) attributes['aria-live'] = live;
    if (atomic !== undefined) attributes['aria-atomic'] = atomic;
    if (relevant) attributes['aria-relevant'] = relevant;
    if (busy !== undefined) attributes['aria-busy'] = busy;
    if (hidden !== undefined) attributes['aria-hidden'] = hidden;
    if (role) attributes.role = role;

    return attributes;
};

/**
 * Check if user prefers reduced motion
 * @returns {boolean} Whether user prefers reduced motion
 */
export const prefersReducedMotion = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get accessible animation duration
 * @param {string} duration - Default duration
 * @returns {string} Duration respecting user preferences
 */
export const getAccessibleDuration = (duration) => {
    return prefersReducedMotion()
        ? designSystem.accessibility.reducedMotion.duration
        : duration;
};

/**
 * Get accessible easing function
 * @param {string} easing - Default easing
 * @returns {string} Easing respecting user preferences
 */
export const getAccessibleEasing = (easing) => {
    return prefersReducedMotion()
        ? designSystem.accessibility.reducedMotion.easing
        : easing;
};

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 * @param {'polite'|'assertive'} priority - Announcement priority
 */
export const announceToScreenReader = (message, priority = 'polite') => {
    if (typeof document === 'undefined') return;

    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';

    document.body.appendChild(announcer);
    announcer.textContent = message;

    // Remove after announcement
    setTimeout(() => {
        document.body.removeChild(announcer);
    }, 1000);
};