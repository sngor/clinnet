/**
 * Optimized Component Exports
 * Tree-shakable exports for performance-optimized unified components
 */

import { TreeShakingUtils } from '../../../design-system/utils/bundleOptimization.js';

// Import optimized components
import UnifiedCardOptimized from './UnifiedCardOptimized.jsx';
import UnifiedButtonOptimized from './UnifiedButtonOptimized.jsx';

// Lazy-loaded components for better code splitting
import { createDynamicImport } from '../../../design-system/utils/bundleOptimization.js';

// Create dynamic imports for larger components
const { Component: UnifiedTableOptimized, preload: preloadTable } = createDynamicImport(
    () => import('./UnifiedTableOptimized.jsx'),
    'UnifiedTableOptimized',
    () => import('../UnifiedTable.jsx').then(m => m.default) // Fallback to regular table
);

const { Component: UnifiedFormFieldOptimized, preload: preloadFormField } = createDynamicImport(
    () => import('./UnifiedFormFieldOptimized.jsx'),
    'UnifiedFormFieldOptimized',
    () => import('../UnifiedFormField.jsx').then(m => m.default) // Fallback to regular form field
);

// Component registry for tree-shaking
const optimizedComponents = {
    UnifiedCardOptimized: {
        component: UnifiedCardOptimized,
        estimatedSize: 12,
        category: 'layout',
        dependencies: ['@mui/material', 'design-system'],
    },
    UnifiedButtonOptimized: {
        component: UnifiedButtonOptimized,
        estimatedSize: 8,
        category: 'input',
        dependencies: ['@mui/material', 'design-system'],
    },
    UnifiedTableOptimized: {
        component: UnifiedTableOptimized,
        estimatedSize: 35,
        category: 'data-display',
        dependencies: ['@mui/material', 'design-system'],
        lazy: true,
        preload: preloadTable,
    },
    UnifiedFormFieldOptimized: {
        component: UnifiedFormFieldOptimized,
        estimatedSize: 28,
        category: 'input',
        dependencies: ['@mui/material', 'design-system'],
        lazy: true,
        preload: preloadFormField,
    },
};

// Create tree-shakable exports
const exports = TreeShakingUtils.createComponentExports(
    Object.fromEntries(
        Object.entries(optimizedComponents).map(([name, config]) => [
            name,
            config.component
        ])
    )
);

// Named exports for tree-shaking
export const {
    UnifiedCardOptimized,
    UnifiedButtonOptimized,
    UnifiedTableOptimized,
    UnifiedFormFieldOptimized,
} = exports;

// Component metadata for bundle analysis
export const componentMetadata = optimizedComponents;

// Preload functions for critical components
export const preloadCriticalComponents = () => {
    // Preload table and form field components as they're commonly used
    if (preloadTable) preloadTable();
    if (preloadFormField) preloadFormField();
};

// Category-based exports for selective loading
export const layoutComponents = {
    UnifiedCardOptimized,
};

export const inputComponents = {
    UnifiedButtonOptimized,
    UnifiedFormFieldOptimized,
};

export const dataDisplayComponents = {
    UnifiedTableOptimized,
};

// Size-based exports
export const smallComponents = Object.fromEntries(
    Object.entries(optimizedComponents)
        .filter(([, config]) => config.estimatedSize <= 15)
        .map(([name, config]) => [name, config.component])
);

export const largeComponents = Object.fromEntries(
    Object.entries(optimizedComponents)
        .filter(([, config]) => config.estimatedSize > 15)
        .map(([name, config]) => [name, config.component])
);

// Conditional exports based on feature flags
export const createConditionalExports = (features = {}) => {
    const conditionalExports = {};

    Object.entries(optimizedComponents).forEach(([name, config]) => {
        const featureFlag = features[config.category];

        if (featureFlag !== false) {
            conditionalExports[name] = config.component;
        }
    });

    return conditionalExports;
};

// Bundle size utilities
export const getBundleSize = () => {
    return Object.values(optimizedComponents).reduce(
        (total, config) => total + config.estimatedSize,
        0
    );
};

export const getComponentsByCategory = (category) => {
    return Object.fromEntries(
        Object.entries(optimizedComponents)
            .filter(([, config]) => config.category === category)
            .map(([name, config]) => [name, config.component])
    );
};

// Default export for backward compatibility
export default {
    UnifiedCardOptimized,
    UnifiedButtonOptimized,
    UnifiedTableOptimized,
    UnifiedFormFieldOptimized,

    // Utilities
    preloadCriticalComponents,
    componentMetadata,
    getBundleSize,
    getComponentsByCategory,
    createConditionalExports,

    // Category exports
    layoutComponents,
    inputComponents,
    dataDisplayComponents,

    // Size-based exports
    smallComponents,
    largeComponents,
};