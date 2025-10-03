/**
 * Transition System
 * Standardized timing functions and durations for smooth interactions
 */

// Duration scale
export const durations = {
    instant: '0ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '1000ms',
};

// Easing functions
export const easings = {
    // Standard easing
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',

    // Custom cubic-bezier curves
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    snappy: 'cubic-bezier(0.4, 0, 1, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

    // Material Design easing
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
};

// Common transition combinations
export const transitions = {
    // Basic transitions
    fast: `all ${durations.fast} ${easings.smooth}`,
    normal: `all ${durations.normal} ${easings.smooth}`,
    slow: `all ${durations.slow} ${easings.smooth}`,

    // Property-specific transitions
    color: `color ${durations.normal} ${easings.smooth}`,
    backgroundColor: `background-color ${durations.normal} ${easings.smooth}`,
    borderColor: `border-color ${durations.normal} ${easings.smooth}`,
    opacity: `opacity ${durations.normal} ${easings.smooth}`,
    transform: `transform ${durations.normal} ${easings.smooth}`,
    boxShadow: `box-shadow ${durations.normal} ${easings.smooth}`,

    // Multiple properties
    colors: `color ${durations.normal} ${easings.smooth}, background-color ${durations.normal} ${easings.smooth}, border-color ${durations.normal} ${easings.smooth}`,

    // Interactive states
    hover: `all ${durations.fast} ${easings.smooth}`,
    focus: `all ${durations.fast} ${easings.smooth}`,
    active: `all ${durations.fast} ${easings.sharp}`,

    // Layout transitions
    height: `height ${durations.normal} ${easings.smooth}`,
    width: `width ${durations.normal} ${easings.smooth}`,
    size: `width ${durations.normal} ${easings.smooth}, height ${durations.normal} ${easings.smooth}`,

    // Entrance/exit animations
    fadeIn: `opacity ${durations.normal} ${easings.smooth}`,
    fadeOut: `opacity ${durations.fast} ${easings.smooth}`,
    slideIn: `transform ${durations.normal} ${easings.decelerate}`,
    slideOut: `transform ${durations.fast} ${easings.accelerate}`,

    // Bounce effects
    bounce: `transform ${durations.slow} ${easings.bounce}`,
};

// Component-specific transitions
export const componentTransitions = {
    // Buttons
    button: {
        default: transitions.hover,
        focus: `box-shadow ${durations.fast} ${easings.smooth}, border-color ${durations.fast} ${easings.smooth}`,
        active: `transform ${durations.fast} ${easings.sharp}`,
    },

    // Cards
    card: {
        hover: `box-shadow ${durations.normal} ${easings.smooth}, transform ${durations.normal} ${easings.smooth}`,
        focus: transitions.focus,
    },

    // Form elements
    input: {
        focus: `border-color ${durations.fast} ${easings.smooth}, box-shadow ${durations.fast} ${easings.smooth}`,
        error: `border-color ${durations.fast} ${easings.smooth}`,
    },

    // Navigation
    tab: transitions.colors,
    link: `color ${durations.fast} ${easings.smooth}`,

    // Overlays
    modal: {
        enter: `opacity ${durations.normal} ${easings.smooth}, transform ${durations.normal} ${easings.decelerate}`,
        exit: `opacity ${durations.fast} ${easings.smooth}, transform ${durations.fast} ${easings.accelerate}`,
    },

    dropdown: {
        enter: `opacity ${durations.fast} ${easings.smooth}, transform ${durations.fast} ${easings.decelerate}`,
        exit: `opacity ${durations.fast} ${easings.smooth}, transform ${durations.fast} ${easings.accelerate}`,
    },

    // Theme switching
    theme: {
        colors: `color ${durations.normal} ${easings.smooth}, background-color ${durations.normal} ${easings.smooth}, border-color ${durations.normal} ${easings.smooth}`,
        all: `all ${durations.normal} ${easings.smooth}`,
    },

    // Loading states
    loading: {
        spinner: `transform ${durations.slowest} ${easings.linear} infinite`,
        pulse: `opacity ${durations.slower} ${easings.easeInOut} infinite alternate`,
        skeleton: `background-position ${durations.slower} ${easings.ease} infinite`,
    },

    // Data display
    table: {
        row: transitions.colors,
        sort: `transform ${durations.fast} ${easings.smooth}`,
    },

    // Feedback
    alert: {
        enter: transitions.slideIn,
        exit: transitions.slideOut,
    },

    toast: {
        enter: `opacity ${durations.normal} ${easings.smooth}, transform ${durations.normal} ${easings.bounce}`,
        exit: `opacity ${durations.fast} ${easings.smooth}, transform ${durations.fast} ${easings.accelerate}`,
    },
};

// Animation keyframes for complex animations
export const keyframes = {
    // Fade animations
    fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
    },

    fadeOut: {
        from: { opacity: 1 },
        to: { opacity: 0 },
    },

    // Slide animations
    slideInUp: {
        from: { transform: 'translateY(100%)', opacity: 0 },
        to: { transform: 'translateY(0)', opacity: 1 },
    },

    slideInDown: {
        from: { transform: 'translateY(-100%)', opacity: 0 },
        to: { transform: 'translateY(0)', opacity: 1 },
    },

    slideInLeft: {
        from: { transform: 'translateX(-100%)', opacity: 0 },
        to: { transform: 'translateX(0)', opacity: 1 },
    },

    slideInRight: {
        from: { transform: 'translateX(100%)', opacity: 0 },
        to: { transform: 'translateX(0)', opacity: 1 },
    },

    // Scale animations
    scaleIn: {
        from: { transform: 'scale(0.8)', opacity: 0 },
        to: { transform: 'scale(1)', opacity: 1 },
    },

    scaleOut: {
        from: { transform: 'scale(1)', opacity: 1 },
        to: { transform: 'scale(0.8)', opacity: 0 },
    },

    // Rotation animations
    spin: {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
    },

    // Pulse animation
    pulse: {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 },
    },

    // Bounce animation
    bounce: {
        '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
        '40%, 43%': { transform: 'translate3d(0, -30px, 0)' },
        '70%': { transform: 'translate3d(0, -15px, 0)' },
        '90%': { transform: 'translate3d(0, -4px, 0)' },
    },

    // Skeleton loading animation
    skeleton: {
        '0%': { backgroundPosition: '-200px 0' },
        '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
    },
};

// Utility function to create custom transitions
export const createTransition = (property, duration = durations.normal, easing = easings.smooth, delay = '0ms') => {
    return `${property} ${duration} ${easing} ${delay}`;
};

// Utility function to combine multiple transitions
export const combineTransitions = (...transitions) => {
    return transitions.join(', ');
};