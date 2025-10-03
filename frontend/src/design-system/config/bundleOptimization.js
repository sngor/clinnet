/**
 * Bundle Optimization Configuration
 * Configuration for code splitting, tree-shaking, and dynamic imports
 */

import { ThemeOptimization, CodeSplitting } from '../utils/bundleOptimization.js';

// Bundle size thresholds
export const BUNDLE_THRESHOLDS = {
    SMALL_COMPONENT: 15, // KB
    LARGE_COMPONENT: 50, // KB
    CRITICAL_PATH: 100, // KB
    LAZY_LOAD: 200, // KB
    CODE_SPLIT: 500, // KB
};

// Component categorization for optimization
export const COMPONENT_CATEGORIES = {
    CRITICAL: [
        'UnifiedButton',
        'UnifiedCard',
        'ThemeProvider',
        'Layout',
    ],
    IMPORTANT: [
        'UnifiedFormField',
        'UnifiedTable',
        'Navigation',
        'Header',
    ],
    OPTIONAL: [
        'PerformanceDashboard',
        'DiagnosticsPage',
        'AdminComponents',
        'ReportingComponents',
    ],
};

// Route-based code splitting configuration
export const ROUTE_SPLITTING_CONFIG = {
    // Core routes that should be loaded immediately
    core: [
        '/',
        '/login',
        '/dashboard',
    ],

    // Feature routes that can be lazy loaded
    features: {
        '/admin': {
            component: () => import('../../pages/AdminDashboard.jsx'),
            preload: false,
            priority: 'low',
        },
        '/diagnostics': {
            component: () => import('../../pages/DiagnosticsPage.jsx'),
            preload: false,
            priority: 'low',
        },
        '/patients': {
            component: () => import('../../pages/PatientListPage.jsx'),
            preload: true,
            priority: 'medium',
        },
        '/appointments': {
            component: () => import('../../pages/AppointmentsPage.jsx'),
            preload: true,
            priority: 'medium',
        },
        '/reports': {
            component: () => import('../../pages/AdminReportsPage.jsx'),
            preload: false,
            priority: 'low',
        },
    },
};

// Feature-based code splitting configuration
export const FEATURE_SPLITTING_CONFIG = {
    // Core features always loaded
    core: {
        authentication: {
            components: {
                LoginPage: '../../pages/LoginPage.jsx',
                AuthProvider: '../../app/providers/AuthProvider.jsx',
            },
            priority: 'critical',
        },

        theme: {
            components: {
                ThemeProvider: '../../app/providers/EnhancedThemeProvider.jsx',
                ThemeToggle: '../../components/ui/ThemeToggle.jsx',
            },
            priority: 'critical',
        },

        layout: {
            components: {
                Layout: '../../components/Layout.jsx',
                Navigation: '../../components/Navigation.jsx',
            },
            priority: 'critical',
        },
    },

    // Feature modules that can be lazy loaded
    features: {
        patientManagement: {
            components: {
                PatientList: '../../pages/PatientListPage.jsx',
                PatientDetail: '../../pages/PatientDetailPage.jsx',
                NewPatient: '../../pages/NewPatientPage.jsx',
            },
            priority: 'high',
            preload: true,
        },

        appointments: {
            components: {
                AppointmentsList: '../../pages/AppointmentsPage.jsx',
                AppointmentForm: '../../components/appointments/AppointmentForm.jsx',
            },
            priority: 'high',
            preload: true,
        },

        administration: {
            components: {
                AdminDashboard: '../../pages/AdminDashboard.jsx',
                UserManagement: '../../pages/UserManagementPage.jsx',
                SystemSettings: '../../pages/SettingsPage.jsx',
            },
            priority: 'medium',
            preload: false,
        },

        reporting: {
            components: {
                ReportsPage: '../../pages/AdminReportsPage.jsx',
                DiagnosticsPage: '../../pages/DiagnosticsPage.jsx',
            },
            priority: 'low',
            preload: false,
        },
    },
};

// Theme-specific optimization configuration
export const THEME_OPTIMIZATION_CONFIG = {
    // Shared theme tokens (loaded always)
    shared: [
        'spacing',
        'typography',
        'breakpoints',
        'zIndex',
    ],

    // Theme-specific tokens (loaded conditionally)
    themeSpecific: {
        light: {
            tokens: ['lightColors', 'lightShadows'],
            overrides: () => import('../themes/light-overrides.js'),
        },
        dark: {
            tokens: ['darkColors', 'darkShadows'],
            overrides: () => import('../themes/dark-overrides.js'),
        },
    },

    // Auto theme switching optimization
    autoSwitching: {
        enabled: true,
        preloadBoth: false, // Only preload current theme
        transitionOptimization: true,
    },
};

// CSS optimization configuration
export const CSS_OPTIMIZATION_CONFIG = {
    // Critical CSS selectors (above-the-fold)
    criticalSelectors: [
        '.MuiAppBar-root',
        '.MuiDrawer-root',
        '.MuiButton-root',
        '.MuiCard-root',
        '.theme-provider-wrapper',
    ],

    // CSS custom properties optimization
    customProperties: {
        removeUnused: true,
        consolidateSimilar: true,
        generateReport: process.env.NODE_ENV === 'development',
    },

    // CSS-in-JS optimization
    cssInJs: {
        staticExtraction: true,
        runtimeOptimization: true,
        cacheStyles: true,
    },
};

// Dynamic import configuration
export const DYNAMIC_IMPORT_CONFIG = {
    // Components that should be dynamically imported
    dynamicComponents: [
        {
            name: 'PerformanceDashboard',
            import: () => import('../../components/ui/PerformanceDashboard.jsx'),
            threshold: BUNDLE_THRESHOLDS.LARGE_COMPONENT,
            preload: false,
        },
        {
            name: 'UnifiedTable',
            import: () => import('../../components/ui/UnifiedTable.jsx'),
            threshold: BUNDLE_THRESHOLDS.LARGE_COMPONENT,
            preload: true,
        },
        {
            name: 'UnifiedFormField',
            import: () => import('../../components/ui/UnifiedFormField.jsx'),
            threshold: BUNDLE_THRESHOLDS.LARGE_COMPONENT,
            preload: true,
        },
    ],

    // Preloading strategy
    preloading: {
        strategy: 'intersection', // 'immediate', 'intersection', 'hover', 'manual'
        delay: 100, // ms
        priority: 'low',
    },

    // Error handling
    errorHandling: {
        retries: 3,
        fallback: 'graceful', // 'graceful', 'error', 'loading'
        timeout: 10000, // ms
    },
};

// Tree-shaking configuration
export const TREE_SHAKING_CONFIG = {
    // Libraries that support tree-shaking
    treeShakableLibraries: [
        '@mui/material',
        '@mui/icons-material',
        'lodash-es',
        'date-fns',
    ],

    // Import patterns to optimize
    importOptimization: {
        '@mui/material': {
            pattern: 'named', // Use named imports
            example: "import { Button, Card } from '@mui/material'",
        },
        '@mui/icons-material': {
            pattern: 'individual', // Use individual imports
            example: "import AddIcon from '@mui/icons-material/Add'",
        },
        'lodash-es': {
            pattern: 'individual',
            example: "import debounce from 'lodash-es/debounce'",
        },
    },

    // Side effect configuration
    sideEffects: {
        css: true, // CSS imports have side effects
        polyfills: true, // Polyfill imports have side effects
        analytics: true, // Analytics imports have side effects
    },
};

// Performance monitoring configuration
export const PERFORMANCE_MONITORING_CONFIG = {
    // Bundle size monitoring
    bundleSize: {
        enabled: true,
        threshold: BUNDLE_THRESHOLDS.CODE_SPLIT,
        alerts: true,
        reporting: process.env.NODE_ENV === 'development',
    },

    // Load time monitoring
    loadTime: {
        enabled: true,
        thresholds: {
            initial: 3000, // ms
            interactive: 5000, // ms
            complete: 10000, // ms
        },
    },

    // Memory monitoring
    memory: {
        enabled: true,
        thresholds: {
            warning: 50 * 1024 * 1024, // 50MB
            critical: 100 * 1024 * 1024, // 100MB
        },
    },
};

// Export optimization strategies
export const OPTIMIZATION_STRATEGIES = {
    // Aggressive optimization (production)
    aggressive: {
        codesplitting: true,
        treeshaking: true,
        dynamicImports: true,
        cssOptimization: true,
        preloading: 'selective',
        monitoring: 'minimal',
    },

    // Balanced optimization (default)
    balanced: {
        codesplitting: true,
        treeshaking: true,
        dynamicImports: 'selective',
        cssOptimization: true,
        preloading: 'intelligent',
        monitoring: 'standard',
    },

    // Development optimization
    development: {
        codesplitting: false,
        treeshaking: false,
        dynamicImports: false,
        cssOptimization: false,
        preloading: 'immediate',
        monitoring: 'comprehensive',
    },
};

// Get current optimization strategy
export const getCurrentStrategy = () => {
    const env = process.env.NODE_ENV;
    const buildMode = process.env.BUILD_MODE;

    if (env === 'development') {
        return OPTIMIZATION_STRATEGIES.development;
    }

    if (buildMode === 'aggressive') {
        return OPTIMIZATION_STRATEGIES.aggressive;
    }

    return OPTIMIZATION_STRATEGIES.balanced;
};

export default {
    BUNDLE_THRESHOLDS,
    COMPONENT_CATEGORIES,
    ROUTE_SPLITTING_CONFIG,
    FEATURE_SPLITTING_CONFIG,
    THEME_OPTIMIZATION_CONFIG,
    CSS_OPTIMIZATION_CONFIG,
    DYNAMIC_IMPORT_CONFIG,
    TREE_SHAKING_CONFIG,
    PERFORMANCE_MONITORING_CONFIG,
    OPTIMIZATION_STRATEGIES,
    getCurrentStrategy,
};