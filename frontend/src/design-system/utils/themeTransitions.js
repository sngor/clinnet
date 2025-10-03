/**
 * Theme Transition Utilities
 * Smooth transitions for theme switching without visual glitches
 */

import { transitions } from '../tokens/transitions.js';

// Theme transition configuration
export const themeTransitionConfig = {
    // Properties that should transition during theme changes
    transitionProperties: [
        'background-color',
        'color',
        'border-color',
        'box-shadow',
        'fill',
        'stroke',
    ],

    // Transition duration for theme changes
    duration: transitions.durations.normal,

    // Transition easing for smooth theme changes
    easing: transitions.easings.easeInOut,

    // Delay to prevent layout shifts
    delay: '0ms',
};

// Create CSS transition string for theme properties
export const createThemeTransition = (properties = themeTransitionConfig.transitionProperties) => {
    return properties
        .map(property => `${property} ${themeTransitionConfig.duration} ${themeTransitionConfig.easing} ${themeTransitionConfig.delay}`)
        .join(', ');
};

// Global theme transition styles
export const globalThemeTransitions = {
    // Base transition for all elements
    '*': {
        transition: createThemeTransition(),
    },

    // Specific transitions for common elements
    'body, html': {
        transition: createThemeTransition(['background-color', 'color']),
    },

    // Prevent transitions on pseudo-elements that might cause flicker
    '*::before, *::after': {
        transition: createThemeTransition(),
    },

    // Smooth transitions for interactive elements
    'button, input, textarea, select': {
        transition: createThemeTransition([
            'background-color',
            'color',
            'border-color',
            'box-shadow',
        ]),
    },

    // Card and paper transitions
    '.MuiCard-root, .MuiPaper-root': {
        transition: createThemeTransition([
            'background-color',
            'border-color',
            'box-shadow',
        ]),
    },

    // Text transitions
    '.MuiTypography-root': {
        transition: createThemeTransition(['color']),
    },

    // Icon transitions
    '.MuiSvgIcon-root': {
        transition: createThemeTransition(['fill', 'color']),
    },
};

// Theme loading states to prevent flash of unstyled content
export const themeLoadingStates = {
    // Hide content during theme initialization
    '.theme-loading': {
        visibility: 'hidden',
        opacity: 0,
    },

    // Show content after theme is loaded
    '.theme-loaded': {
        visibility: 'visible',
        opacity: 1,
        transition: `opacity ${themeTransitionConfig.duration} ${themeTransitionConfig.easing}`,
    },

    // Skeleton loading for theme-dependent content
    '.theme-skeleton': {
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        backgroundSize: '200% 100%',
        animation: 'theme-skeleton-loading 1.5s infinite',
    },
};

// Keyframes for loading animations
export const themeLoadingKeyframes = {
    '@keyframes theme-skeleton-loading': {
        '0%': {
            backgroundPosition: '-200% 0',
        },
        '100%': {
            backgroundPosition: '200% 0',
        },
    },
};

// Utility to apply theme transitions to a component
export const withThemeTransitions = (styles) => ({
    ...styles,
    transition: createThemeTransition(),
});

// Utility to create theme-aware transitions for specific properties
export const createCustomThemeTransition = (properties, duration, easing) => {
    const transitionDuration = duration || themeTransitionConfig.duration;
    const transitionEasing = easing || themeTransitionConfig.easing;

    return properties
        .map(property => `${property} ${transitionDuration} ${transitionEasing}`)
        .join(', ');
};

// Prevent layout shifts during theme transitions
export const preventLayoutShift = {
    // Ensure consistent sizing during transitions
    '*': {
        boxSizing: 'border-box',
    },

    // Prevent text from shifting during color transitions
    'h1, h2, h3, h4, h5, h6, p, span, div': {
        textRendering: 'optimizeLegibility',
        fontSmooth: 'always',
        '-webkit-font-smoothing': 'antialiased',
        '-moz-osx-font-smoothing': 'grayscale',
    },

    // Prevent image flicker during theme changes
    'img, svg': {
        display: 'block',
        maxWidth: '100%',
        height: 'auto',
    },
};

// Theme transition manager class
export class ThemeTransitionManager {
    constructor() {
        this.isTransitioning = false;
        this.transitionTimeout = null;
    }

    // Start theme transition
    startTransition() {
        this.isTransitioning = true;
        document.body.classList.add('theme-transitioning');

        // Clear any existing timeout
        if (this.transitionTimeout) {
            clearTimeout(this.transitionTimeout);
        }

        // End transition after duration
        this.transitionTimeout = setTimeout(() => {
            this.endTransition();
        }, parseInt(themeTransitionConfig.duration));
    }

    // End theme transition
    endTransition() {
        this.isTransitioning = false;
        document.body.classList.remove('theme-transitioning');

        if (this.transitionTimeout) {
            clearTimeout(this.transitionTimeout);
            this.transitionTimeout = null;
        }
    }

    // Check if currently transitioning
    isCurrentlyTransitioning() {
        return this.isTransitioning;
    }

    // Apply loading state during theme initialization
    applyLoadingState() {
        document.body.classList.add('theme-loading');
    }

    // Remove loading state after theme is ready
    removeLoadingState() {
        document.body.classList.remove('theme-loading');
        document.body.classList.add('theme-loaded');
    }
}

// Global transition manager instance
export const themeTransitionManager = new ThemeTransitionManager();

// CSS-in-JS styles for theme transitions
export const themeTransitionStyles = {
    // Global transition styles
    '@global': {
        ...globalThemeTransitions,
        ...themeLoadingStates,
        ...preventLayoutShift,
        ...themeLoadingKeyframes,

        // Theme transitioning state styles
        'body.theme-transitioning': {
            // Prevent user interactions during transition
            pointerEvents: 'none',

            // Ensure smooth transition
            '& *': {
                transition: createThemeTransition(),
            },
        },

        // Theme loaded state
        'body.theme-loaded': {
            pointerEvents: 'auto',
        },
    },
};

// Hook for managing theme transitions in React components
export const useThemeTransition = () => {
    const startTransition = () => {
        themeTransitionManager.startTransition();
    };

    const endTransition = () => {
        themeTransitionManager.endTransition();
    };

    const isTransitioning = () => {
        return themeTransitionManager.isCurrentlyTransitioning();
    };

    return {
        startTransition,
        endTransition,
        isTransitioning,
    };
};

export default {
    themeTransitionConfig,
    createThemeTransition,
    globalThemeTransitions,
    themeLoadingStates,
    withThemeTransitions,
    createCustomThemeTransition,
    preventLayoutShift,
    ThemeTransitionManager,
    themeTransitionManager,
    themeTransitionStyles,
    useThemeTransition,
};