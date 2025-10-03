/**
 * Bundle Size Optimization Utilities
 * Tools for tree-shaking, dynamic imports, and CSS optimization
 */

import { BundleSizeAnalyzer } from './performance.js';

/**
 * Dynamic import wrapper with error handling and loading states
 */
export const createDynamicImport = (importFunction, componentName, fallback = null) => {
    // Register the component for bundle analysis
    BundleSizeAnalyzer.registerComponent(`${componentName}(lazy)`, 0); // Size will be updated when loaded

    return {
        Component: React.lazy(() =>
            importFunction()
                .then(module => {
                    // Update bundle size after loading
                    if (process.env.NODE_ENV === 'development') {
                        console.log(`📦 Lazy loaded: ${componentName}`);
                    }
                    return module;
                })
                .catch(error => {
                    console.error(`Failed to load ${componentName}:`, error);
                    // Return fallback component or empty component
                    return { default: fallback || (() => null) };
                })
        ),
        preload: () => importFunction(),
    };
};

/**
 * Tree-shaking utilities for design system components
 */
export const TreeShakingUtils = {
    /**
     * Create a tree-shakable export map for components
     */
    createComponentExports: (components) => {
        const exports = {};

        Object.entries(components).forEach(([name, component]) => {
            // Create named export that can be tree-shaken
            exports[name] = component;

            // Register for bundle analysis
            BundleSizeAnalyzer.registerComponent(name, component.estimatedSize || 10);
        });

        return exports;
    },

    /**
     * Create conditional imports based on feature flags
     */
    createConditionalImport: (condition, importFunction, fallback = null) => {
        if (condition) {
            return importFunction();
        }
        return Promise.resolve({ default: fallback || (() => null) });
    },

    /**
     * Create size-aware imports that only load if under size threshold
     */
    createSizeAwareImport: (importFunction, maxSize, componentName) => {
        const currentBundleSize = BundleSizeAnalyzer.getTotalSize();

        if (currentBundleSize > maxSize) {
            console.warn(`Bundle size limit exceeded (${currentBundleSize}KB > ${maxSize}KB), skipping ${componentName}`);
            return Promise.resolve({ default: () => null });
        }

        return importFunction();
    },
};

/**
 * CSS optimization utilities
 */
export const CSSOptimization = {
    /**
     * Extract critical CSS for above-the-fold content
     */
    extractCriticalCSS: (selectors) => {
        const criticalRules = [];

        // Get all stylesheets
        Array.from(document.styleSheets).forEach(sheet => {
            try {
                Array.from(sheet.cssRules || []).forEach(rule => {
                    if (rule.type === CSSRule.STYLE_RULE) {
                        // Check if rule matches critical selectors
                        const matchesCritical = selectors.some(selector =>
                            rule.selectorText && rule.selectorText.includes(selector)
                        );

                        if (matchesCritical) {
                            criticalRules.push(rule.cssText);
                        }
                    }
                });
            } catch (e) {
                // Skip cross-origin stylesheets
            }
        });

        return criticalRules.join('\n');
    },

    /**
     * Remove unused CSS custom properties
     */
    removeUnusedCustomProperties: () => {
        const usedProperties = new Set();
        const definedProperties = new Set();

        // Find all defined custom properties
        Array.from(document.styleSheets).forEach(sheet => {
            try {
                Array.from(sheet.cssRules || []).forEach(rule => {
                    if (rule.type === CSSRule.STYLE_RULE) {
                        Array.from(rule.style).forEach(property => {
                            if (property.startsWith('--')) {
                                definedProperties.add(property);
                            }
                        });
                    }
                });
            } catch (e) {
                // Skip cross-origin stylesheets
            }
        });

        // Find all used custom properties
        Array.from(document.styleSheets).forEach(sheet => {
            try {
                Array.from(sheet.cssRules || []).forEach(rule => {
                    if (rule.type === CSSRule.STYLE_RULE) {
                        const cssText = rule.cssText;
                        definedProperties.forEach(prop => {
                            if (cssText.includes(`var(${prop})`)) {
                                usedProperties.add(prop);
                            }
                        });
                    }
                });
            } catch (e) {
                // Skip cross-origin stylesheets
            }
        });

        const unusedProperties = Array.from(definedProperties).filter(
            prop => !usedProperties.has(prop)
        );

        if (process.env.NODE_ENV === 'development' && unusedProperties.length > 0) {
            console.log('🎨 Unused CSS custom properties:', unusedProperties);
        }

        return unusedProperties;
    },

    /**
     * Consolidate similar CSS rules
     */
    consolidateCSS: (rules) => {
        const consolidated = new Map();

        rules.forEach(rule => {
            const key = JSON.stringify(rule.declarations);
            if (consolidated.has(key)) {
                // Merge selectors
                const existing = consolidated.get(key);
                existing.selectors = [...existing.selectors, ...rule.selectors];
            } else {
                consolidated.set(key, { ...rule });
            }
        });

        return Array.from(consolidated.values());
    },
};

/**
 * Theme-specific optimization utilities
 */
export const ThemeOptimization = {
    /**
     * Create theme-specific dynamic imports
     */
    createThemeAwareImport: (lightImport, darkImport, currentTheme) => {
        if (currentTheme === 'dark') {
            return darkImport();
        }
        return lightImport();
    },

    /**
     * Lazy load theme-specific overrides
     */
    createThemeOverrideImport: (theme) => {
        return createDynamicImport(
            () => import(`../themes/${theme}-overrides.js`),
            `${theme}ThemeOverrides`
        );
    },

    /**
     * Optimize theme token consolidation
     */
    consolidateThemeTokens: (lightTokens, darkTokens) => {
        const sharedTokens = {};
        const lightOnlyTokens = {};
        const darkOnlyTokens = {};

        // Find shared tokens
        Object.keys(lightTokens).forEach(key => {
            if (darkTokens[key] && lightTokens[key] === darkTokens[key]) {
                sharedTokens[key] = lightTokens[key];
            } else {
                lightOnlyTokens[key] = lightTokens[key];
            }
        });

        // Find dark-only tokens
        Object.keys(darkTokens).forEach(key => {
            if (!lightTokens[key]) {
                darkOnlyTokens[key] = darkTokens[key];
            } else if (lightTokens[key] !== darkTokens[key]) {
                darkOnlyTokens[key] = darkTokens[key];
            }
        });

        return {
            shared: sharedTokens,
            light: lightOnlyTokens,
            dark: darkOnlyTokens,
        };
    },
};

/**
 * Component code splitting utilities
 */
export const CodeSplitting = {
    /**
     * Create route-based code splitting
     */
    createRouteBasedSplit: (routes) => {
        return routes.map(route => ({
            ...route,
            component: React.lazy(() => import(route.componentPath)),
        }));
    },

    /**
     * Create feature-based code splitting
     */
    createFeatureBasedSplit: (features) => {
        const splits = {};

        Object.entries(features).forEach(([featureName, featureConfig]) => {
            splits[featureName] = {
                ...featureConfig,
                components: Object.entries(featureConfig.components).reduce(
                    (acc, [componentName, componentPath]) => {
                        acc[componentName] = React.lazy(() => import(componentPath));
                        return acc;
                    },
                    {}
                ),
            };
        });

        return splits;
    },

    /**
     * Create size-based code splitting
     */
    createSizeBasedSplit: (components, sizeThreshold = 50) => {
        const small = {};
        const large = {};

        Object.entries(components).forEach(([name, component]) => {
            const estimatedSize = component.estimatedSize || 10;

            if (estimatedSize > sizeThreshold) {
                large[name] = React.lazy(() => import(component.path));
            } else {
                small[name] = component.component;
            }
        });

        return { small, large };
    },
};

/**
 * Bundle analysis and reporting
 */
export const BundleAnalysis = {
    /**
     * Generate bundle size report
     */
    generateReport: () => {
        const report = BundleSizeAnalyzer.generateReport();

        return {
            ...report,
            optimizationSuggestions: BundleAnalysis.generateOptimizationSuggestions(report),
            treeshakingOpportunities: BundleAnalysis.findTreeshakingOpportunities(),
            codeSpittingOpportunities: BundleAnalysis.findCodeSplittingOpportunities(report),
        };
    },

    /**
     * Generate optimization suggestions
     */
    generateOptimizationSuggestions: (report) => {
        const suggestions = [];

        // Large component suggestions
        report.topComponents.forEach(([name, size]) => {
            if (size > 100) {
                suggestions.push({
                    type: 'code-splitting',
                    component: name,
                    currentSize: size,
                    suggestion: `Consider lazy loading ${name} as it's ${size}KB`,
                    priority: 'high',
                });
            } else if (size > 50) {
                suggestions.push({
                    type: 'optimization',
                    component: name,
                    currentSize: size,
                    suggestion: `Review ${name} for optimization opportunities (${size}KB)`,
                    priority: 'medium',
                });
            }
        });

        // Total bundle size suggestions
        if (report.totalSize > 500) {
            suggestions.push({
                type: 'bundle-splitting',
                suggestion: 'Consider implementing route-based code splitting',
                priority: 'high',
            });
        }

        return suggestions;
    },

    /**
     * Find tree-shaking opportunities
     */
    findTreeshakingOpportunities: () => {
        // This would analyze import patterns and suggest tree-shaking improvements
        // For now, return static suggestions
        return [
            {
                type: 'tree-shaking',
                suggestion: 'Use named imports instead of default imports where possible',
                example: "import { Button } from '@mui/material' instead of import Button from '@mui/material/Button'",
            },
            {
                type: 'tree-shaking',
                suggestion: 'Avoid importing entire libraries when only using specific functions',
                example: "import debounce from 'lodash/debounce' instead of import _ from 'lodash'",
            },
        ];
    },

    /**
     * Find code splitting opportunities
     */
    findCodeSplittingOpportunities: (report) => {
        const opportunities = [];

        // Route-based splitting
        opportunities.push({
            type: 'route-splitting',
            suggestion: 'Implement lazy loading for page components',
            estimatedSavings: Math.floor(report.totalSize * 0.3),
        });

        // Feature-based splitting
        opportunities.push({
            type: 'feature-splitting',
            suggestion: 'Split large features into separate bundles',
            estimatedSavings: Math.floor(report.totalSize * 0.2),
        });

        return opportunities;
    },
};

/**
 * Runtime optimization utilities
 */
export const RuntimeOptimization = {
    /**
     * Preload critical components
     */
    preloadCriticalComponents: (components) => {
        components.forEach(component => {
            if (component.preload) {
                // Preload after a short delay to not block initial render
                setTimeout(() => {
                    component.preload().catch(error => {
                        console.warn(`Failed to preload ${component.name}:`, error);
                    });
                }, 100);
            }
        });
    },

    /**
     * Implement progressive loading
     */
    createProgressiveLoader: (components, priority = 'low') => {
        return new Promise((resolve) => {
            const loadComponent = (index = 0) => {
                if (index >= components.length) {
                    resolve();
                    return;
                }

                const component = components[index];

                if (component.load) {
                    component.load()
                        .then(() => {
                            // Load next component with appropriate delay
                            const delay = priority === 'high' ? 0 : priority === 'medium' ? 50 : 100;
                            setTimeout(() => loadComponent(index + 1), delay);
                        })
                        .catch(error => {
                            console.warn(`Failed to load ${component.name}:`, error);
                            loadComponent(index + 1);
                        });
                } else {
                    loadComponent(index + 1);
                }
            };

            loadComponent();
        });
    },

    /**
     * Monitor and optimize memory usage
     */
    optimizeMemoryUsage: () => {
        // Clean up unused components
        if (window.gc && process.env.NODE_ENV === 'development') {
            window.gc();
        }

        // Clear component caches if memory usage is high
        if (performance.memory && performance.memory.usedJSHeapSize > 100 * 1024 * 1024) {
            console.warn('High memory usage detected, clearing caches');
            // Clear any component caches here
        }
    },
};

export default {
    createDynamicImport,
    TreeShakingUtils,
    CSSOptimization,
    ThemeOptimization,
    CodeSplitting,
    BundleAnalysis,
    RuntimeOptimization,
};