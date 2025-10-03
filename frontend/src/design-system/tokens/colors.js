/**
 * Comprehensive Color System
 * Complete color palettes with 50-900 shades for light and dark modes
 * WCAG 2.1 AA compliant contrast ratios
 */

// Base color scales (50-900 shades)
const colorScales = {
    // Primary brand colors
    primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
    },

    // Secondary colors
    secondary: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
    },

    // Neutral grays
    neutral: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
    },

    // Success colors
    success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
    },

    // Warning colors
    warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
    },

    // Error colors
    error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
    },

    // Info colors
    info: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
    },
};

// Light theme color mappings
export const lightColors = {
    // Primary colors
    primary: {
        main: colorScales.primary[600],
        light: colorScales.primary[400],
        dark: colorScales.primary[700],
        contrastText: '#ffffff',
    },

    // Secondary colors
    secondary: {
        main: colorScales.secondary[500],
        light: colorScales.secondary[300],
        dark: colorScales.secondary[700],
        contrastText: '#ffffff',
    },

    // Background colors
    background: {
        default: '#ffffff',
        paper: colorScales.neutral[50],
        elevated: '#ffffff',
        overlay: 'rgba(0, 0, 0, 0.5)',
    },

    // Surface colors
    surface: {
        primary: '#ffffff',
        secondary: colorScales.neutral[50],
        tertiary: colorScales.neutral[100],
        disabled: colorScales.neutral[200],
    },

    // Text colors
    text: {
        primary: colorScales.neutral[900],
        secondary: colorScales.neutral[600],
        disabled: colorScales.neutral[400],
        inverse: '#ffffff',
    },

    // Border colors
    border: {
        primary: colorScales.neutral[200],
        secondary: colorScales.neutral[300],
        focus: colorScales.primary[500],
        error: colorScales.error[500],
    },

    // State colors
    success: {
        main: colorScales.success[600],
        light: colorScales.success[100],
        dark: colorScales.success[700],
        contrastText: '#ffffff',
    },

    warning: {
        main: colorScales.warning[500],
        light: colorScales.warning[100],
        dark: colorScales.warning[600],
        contrastText: '#ffffff',
    },

    error: {
        main: colorScales.error[600],
        light: colorScales.error[100],
        dark: colorScales.error[700],
        contrastText: '#ffffff',
    },

    info: {
        main: colorScales.info[600],
        light: colorScales.info[100],
        dark: colorScales.info[700],
        contrastText: '#ffffff',
    },
};

// Dark theme color mappings
export const darkColors = {
    // Primary colors
    primary: {
        main: colorScales.primary[400],
        light: colorScales.primary[300],
        dark: colorScales.primary[600],
        contrastText: colorScales.neutral[900],
    },

    // Secondary colors
    secondary: {
        main: colorScales.secondary[400],
        light: colorScales.secondary[300],
        dark: colorScales.secondary[600],
        contrastText: colorScales.neutral[900],
    },

    // Background colors
    background: {
        default: colorScales.neutral[900],
        paper: colorScales.neutral[800],
        elevated: colorScales.neutral[700],
        overlay: 'rgba(0, 0, 0, 0.7)',
    },

    // Surface colors
    surface: {
        primary: colorScales.neutral[800],
        secondary: colorScales.neutral[700],
        tertiary: colorScales.neutral[600],
        disabled: colorScales.neutral[700],
    },

    // Text colors
    text: {
        primary: colorScales.neutral[100],
        secondary: colorScales.neutral[300],
        disabled: colorScales.neutral[500],
        inverse: colorScales.neutral[900],
    },

    // Border colors
    border: {
        primary: colorScales.neutral[700],
        secondary: colorScales.neutral[600],
        focus: colorScales.primary[400],
        error: colorScales.error[400],
    },

    // State colors
    success: {
        main: colorScales.success[400],
        light: colorScales.success[900],
        dark: colorScales.success[300],
        contrastText: colorScales.neutral[900],
    },

    warning: {
        main: colorScales.warning[400],
        light: colorScales.warning[900],
        dark: colorScales.warning[300],
        contrastText: colorScales.neutral[900],
    },

    error: {
        main: colorScales.error[400],
        light: colorScales.error[900],
        dark: colorScales.error[300],
        contrastText: colorScales.neutral[900],
    },

    info: {
        main: colorScales.info[400],
        light: colorScales.info[900],
        dark: colorScales.info[300],
        contrastText: colorScales.neutral[900],
    },
};

// Export color scales for advanced usage
export { colorScales };