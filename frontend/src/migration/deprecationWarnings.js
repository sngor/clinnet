/**
 * Runtime deprecation warnings for legacy components
 * Provides migration guidance during development
 */

import { getMigrationMapping } from './migrationMappings';

// Track warned components to avoid spam
const warnedComponents = new Set();

/**
 * Show deprecation warning for a component
 * @param {string} componentName - Name of the deprecated component
 * @param {Object} options - Warning options
 */
export const showDeprecationWarning = (componentName, options = {}) => {
    const {
        once = true,
        level = 'warn',
        showMigrationPath = true,
        context = ''
    } = options;

    // Skip if already warned and once is true
    if (once && warnedComponents.has(componentName)) {
        return;
    }

    const mapping = getMigrationMapping(componentName);

    if (!mapping) {
        console.warn(`Component "${componentName}" may be deprecated but no migration path is available.`);
        return;
    }

    const contextStr = context ? ` (${context})` : '';
    const baseMessage = `⚠️  DEPRECATED: "${componentName}"${contextStr} is deprecated and will be removed in a future version.`;

    let migrationMessage = '';
    if (showMigrationPath) {
        migrationMessage = `\n📦 Migrate to: ${mapping.unifiedComponent}`;
        migrationMessage += `\n📁 Import from: ${mapping.importPath}`;

        if (mapping.breakingChanges && mapping.breakingChanges.length > 0) {
            migrationMessage += `\n⚠️  Breaking changes:`;
            mapping.breakingChanges.forEach(change => {
                migrationMessage += `\n   • ${change}`;
            });
        }

        migrationMessage += `\n📖 Migration guide: https://docs.example.com/migration/${componentName.toLowerCase()}`;
    }

    const fullMessage = baseMessage + migrationMessage;

    // Log with appropriate level
    switch (level) {
        case 'error':
            console.error(fullMessage);
            break;
        case 'warn':
            console.warn(fullMessage);
            break;
        case 'info':
            console.info(fullMessage);
            break;
        default:
            console.log(fullMessage);
    }

    // Mark as warned
    if (once) {
        warnedComponents.add(componentName);
    }
};

/**
 * Create a deprecated component wrapper that shows warnings
 * @param {React.Component} OriginalComponent - The original component
 * @param {string} componentName - Name of the component
 * @param {Object} options - Wrapper options
 * @returns {React.Component} Wrapped component with deprecation warning
 */
export const createDeprecatedWrapper = (OriginalComponent, componentName, options = {}) => {
    const DeprecatedWrapper = (props) => {
        // Show warning on first render
        React.useEffect(() => {
            showDeprecationWarning(componentName, {
                ...options,
                context: 'component render'
            });
        }, []);

        return React.createElement(OriginalComponent, props);
    };

    DeprecatedWrapper.displayName = `Deprecated(${componentName})`;
    return DeprecatedWrapper;
};

/**
 * Higher-order component for deprecation warnings
 * @param {string} componentName - Name of the deprecated component
 * @param {Object} options - HOC options
 * @returns {Function} HOC function
 */
export const withDeprecationWarning = (componentName, options = {}) => {
    return (WrappedComponent) => {
        const WithDeprecationWarning = (props) => {
            React.useEffect(() => {
                showDeprecationWarning(componentName, {
                    ...options,
                    context: 'HOC wrapper'
                });
            }, []);

            return React.createElement(WrappedComponent, props);
        };

        WithDeprecationWarning.displayName = `withDeprecationWarning(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
        return WithDeprecationWarning;
    };
};

/**
 * Check if a component is deprecated
 * @param {string} componentName - Name of the component to check
 * @returns {boolean} True if component is deprecated
 */
export const isDeprecated = (componentName) => {
    return getMigrationMapping(componentName) !== null;
};

/**
 * Get migration information for a deprecated component
 * @param {string} componentName - Name of the deprecated component
 * @returns {Object|null} Migration information or null if not deprecated
 */
export const getMigrationInfo = (componentName) => {
    const mapping = getMigrationMapping(componentName);

    if (!mapping) {
        return null;
    }

    return {
        deprecated: componentName,
        replacement: mapping.unifiedComponent,
        importPath: mapping.importPath,
        breakingChanges: mapping.breakingChanges || [],
        propMappings: mapping.propMappings || {},
        propTransforms: mapping.propTransforms || {}
    };
};

/**
 * Batch check for deprecated components in a list
 * @param {string[]} componentNames - Array of component names to check
 * @returns {Object} Object with deprecated and non-deprecated components
 */
export const checkDeprecatedComponents = (componentNames) => {
    const deprecated = [];
    const current = [];

    componentNames.forEach(name => {
        if (isDeprecated(name)) {
            deprecated.push({
                name,
                migration: getMigrationInfo(name)
            });
        } else {
            current.push(name);
        }
    });

    return {
        deprecated,
        current,
        hasDeprecated: deprecated.length > 0
    };
};

/**
 * Generate deprecation report for development
 * @returns {Object} Deprecation status report
 */
export const generateDeprecationReport = () => {
    const allMappings = Object.keys(getMigrationMapping() || {});
    const warnedList = Array.from(warnedComponents);

    return {
        totalDeprecatedComponents: allMappings.length,
        warnedComponents: warnedList,
        unwarnedComponents: allMappings.filter(name => !warnedComponents.has(name)),
        migrationProgress: {
            total: allMappings.length,
            warned: warnedList.length,
            remaining: allMappings.length - warnedList.length
        }
    };
};

/**
 * Clear warning history (useful for testing)
 */
export const clearWarningHistory = () => {
    warnedComponents.clear();
};

/**
 * Development mode component usage tracker
 */
export const trackComponentUsage = (() => {
    const usageStats = new Map();

    return {
        track: (componentName, context = 'unknown') => {
            if (!usageStats.has(componentName)) {
                usageStats.set(componentName, {
                    count: 0,
                    contexts: new Set(),
                    firstSeen: Date.now(),
                    lastSeen: Date.now()
                });
            }

            const stats = usageStats.get(componentName);
            stats.count++;
            stats.contexts.add(context);
            stats.lastSeen = Date.now();

            // Show warning for deprecated components
            if (isDeprecated(componentName)) {
                showDeprecationWarning(componentName, {
                    context: `usage tracking (${context})`,
                    once: true
                });
            }
        },

        getStats: () => {
            const stats = {};
            usageStats.forEach((value, key) => {
                stats[key] = {
                    ...value,
                    contexts: Array.from(value.contexts)
                };
            });
            return stats;
        },

        getDeprecatedUsage: () => {
            const deprecated = {};
            usageStats.forEach((value, key) => {
                if (isDeprecated(key)) {
                    deprecated[key] = {
                        ...value,
                        contexts: Array.from(value.contexts),
                        migration: getMigrationInfo(key)
                    };
                }
            });
            return deprecated;
        },

        clear: () => {
            usageStats.clear();
        }
    };
})();

export default {
    showDeprecationWarning,
    createDeprecatedWrapper,
    withDeprecationWarning,
    isDeprecated,
    getMigrationInfo,
    checkDeprecatedComponents,
    generateDeprecationReport,
    clearWarningHistory,
    trackComponentUsage
};