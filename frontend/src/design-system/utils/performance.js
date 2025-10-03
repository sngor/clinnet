/**
 * Performance Monitoring and Optimization Utilities
 * Tools for tracking component render performance, bundle size impact, and memory usage
 */

// Performance monitoring configuration
const PERFORMANCE_CONFIG = {
    enabled: process.env.NODE_ENV === 'development',
    enableRenderTracking: true,
    enableBundleAnalysis: true,
    enableMemoryTracking: true,
    sampleRate: 0.1, // Sample 10% of renders in production
};

// Performance metrics storage
let performanceMetrics = {
    componentRenders: new Map(),
    bundleSize: {
        designSystem: 0,
        components: 0,
        themes: 0,
    },
    memoryUsage: {
        themeSwitch: [],
        componentMount: [],
    },
    renderTimes: new Map(),
};

/**
 * Component render performance tracker
 * Tracks render count, timing, and props changes for unified components
 */
export class ComponentPerformanceTracker {
    constructor(componentName) {
        this.componentName = componentName;
        this.renderCount = 0;
        this.lastRenderTime = 0;
        this.totalRenderTime = 0;
        this.propsHistory = [];
    }

    startRender() {
        if (!PERFORMANCE_CONFIG.enabled) return;

        this.renderStartTime = performance.now();
        this.renderCount++;
    }

    endRender(props = {}) {
        if (!PERFORMANCE_CONFIG.enabled || !this.renderStartTime) return;

        const renderTime = performance.now() - this.renderStartTime;
        this.lastRenderTime = renderTime;
        this.totalRenderTime += renderTime;

        // Track props changes for optimization insights
        this.propsHistory.push({
            timestamp: Date.now(),
            props: JSON.stringify(props),
            renderTime,
        });

        // Keep only last 10 renders in history
        if (this.propsHistory.length > 10) {
            this.propsHistory.shift();
        }

        // Store metrics
        performanceMetrics.componentRenders.set(this.componentName, {
            renderCount: this.renderCount,
            averageRenderTime: this.totalRenderTime / this.renderCount,
            lastRenderTime: this.lastRenderTime,
            propsHistory: this.propsHistory,
        });

        // Log slow renders in development
        if (renderTime > 16 && process.env.NODE_ENV === 'development') {
            console.warn(
                `Slow render detected: ${this.componentName} took ${renderTime.toFixed(2)}ms`
            );
        }
    }

    getMetrics() {
        return {
            componentName: this.componentName,
            renderCount: this.renderCount,
            averageRenderTime: this.totalRenderTime / this.renderCount || 0,
            lastRenderTime: this.lastRenderTime,
            totalRenderTime: this.totalRenderTime,
        };
    }
}

/**
 * React component performance wrapper
 * Higher-order component for automatic performance tracking
 */
export const withPerformanceTracking = (WrappedComponent, componentName) => {
    const tracker = new ComponentPerformanceTracker(componentName);

    return React.forwardRef((props, ref) => {
        tracker.startRender();

        React.useEffect(() => {
            tracker.endRender(props);
        });

        return React.createElement(WrappedComponent, { ...props, ref });
    });
};

/**
 * Performance monitoring hook
 * Hook for tracking component performance within functional components
 */
export const usePerformanceTracking = (componentName, dependencies = []) => {
    const tracker = React.useMemo(
        () => new ComponentPerformanceTracker(componentName),
        [componentName]
    );

    React.useEffect(() => {
        tracker.startRender();
        return () => tracker.endRender();
    }, dependencies);

    return tracker.getMetrics();
};

/**
 * Bundle size impact analyzer
 * Tracks the size impact of design system components
 */
export class BundleSizeAnalyzer {
    static componentSizes = new Map();
    static totalSize = 0;

    static registerComponent(name, estimatedSize) {
        this.componentSizes.set(name, estimatedSize);
        this.totalSize += estimatedSize;

        performanceMetrics.bundleSize.components = this.totalSize;

        if (process.env.NODE_ENV === 'development') {
            console.log(`Component ${name} registered: ${estimatedSize}KB`);
            console.log(`Total design system size: ${this.totalSize}KB`);
        }
    }

    static getComponentSize(name) {
        return this.componentSizes.get(name) || 0;
    }

    static getTotalSize() {
        return this.totalSize;
    }

    static getTopComponents(limit = 5) {
        return Array.from(this.componentSizes.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit);
    }

    static generateReport() {
        const report = {
            totalSize: this.totalSize,
            componentCount: this.componentSizes.size,
            averageComponentSize: this.totalSize / this.componentSizes.size,
            topComponents: this.getTopComponents(),
            recommendations: this.generateRecommendations(),
        };

        if (process.env.NODE_ENV === 'development') {
            console.table(report.topComponents);
            console.log('Bundle Size Recommendations:', report.recommendations);
        }

        return report;
    }

    static generateRecommendations() {
        const recommendations = [];
        const topComponents = this.getTopComponents();

        topComponents.forEach(([name, size]) => {
            if (size > 50) {
                recommendations.push(
                    `Consider code splitting for ${name} (${size}KB)`
                );
            }
            if (size > 20) {
                recommendations.push(
                    `Review ${name} for potential optimizations (${size}KB)`
                );
            }
        });

        if (this.totalSize > 200) {
            recommendations.push(
                'Total bundle size is large, consider lazy loading non-critical components'
            );
        }

        return recommendations;
    }
}

/**
 * Memory usage monitor
 * Tracks memory usage during theme switching and component mounting
 */
export class MemoryMonitor {
    static isSupported = 'memory' in performance;

    static measureMemoryUsage(label) {
        if (!this.isSupported || !PERFORMANCE_CONFIG.enableMemoryTracking) {
            return null;
        }

        const memInfo = performance.memory;
        const measurement = {
            timestamp: Date.now(),
            label,
            usedJSHeapSize: memInfo.usedJSHeapSize,
            totalJSHeapSize: memInfo.totalJSHeapSize,
            jsHeapSizeLimit: memInfo.jsHeapSizeLimit,
        };

        return measurement;
    }

    static trackThemeSwitch(fromTheme, toTheme) {
        const beforeMemory = this.measureMemoryUsage(`theme-switch-before-${fromTheme}-to-${toTheme}`);

        return () => {
            const afterMemory = this.measureMemoryUsage(`theme-switch-after-${fromTheme}-to-${toTheme}`);

            if (beforeMemory && afterMemory) {
                const memoryDelta = afterMemory.usedJSHeapSize - beforeMemory.usedJSHeapSize;

                performanceMetrics.memoryUsage.themeSwitch.push({
                    fromTheme,
                    toTheme,
                    memoryDelta,
                    beforeMemory,
                    afterMemory,
                    timestamp: Date.now(),
                });

                if (process.env.NODE_ENV === 'development' && Math.abs(memoryDelta) > 1024 * 1024) {
                    console.warn(
                        `Theme switch memory impact: ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`
                    );
                }
            }
        };
    }

    static trackComponentMount(componentName) {
        const beforeMemory = this.measureMemoryUsage(`component-mount-before-${componentName}`);

        return () => {
            const afterMemory = this.measureMemoryUsage(`component-mount-after-${componentName}`);

            if (beforeMemory && afterMemory) {
                const memoryDelta = afterMemory.usedJSHeapSize - beforeMemory.usedJSHeapSize;

                performanceMetrics.memoryUsage.componentMount.push({
                    componentName,
                    memoryDelta,
                    beforeMemory,
                    afterMemory,
                    timestamp: Date.now(),
                });
            }
        };
    }

    static getMemoryReport() {
        if (!this.isSupported) {
            return { error: 'Memory monitoring not supported in this browser' };
        }

        const currentMemory = this.measureMemoryUsage('current');
        const themeSwithces = performanceMetrics.memoryUsage.themeSwitch;
        const componentMounts = performanceMetrics.memoryUsage.componentMount;

        return {
            currentMemory,
            themeSwithces: {
                count: themeSwithces.length,
                averageImpact: themeSwithces.reduce((sum, item) => sum + Math.abs(item.memoryDelta), 0) / themeSwithces.length || 0,
                largestImpact: Math.max(...themeSwithces.map(item => Math.abs(item.memoryDelta)), 0),
            },
            componentMounts: {
                count: componentMounts.length,
                averageImpact: componentMounts.reduce((sum, item) => sum + Math.abs(item.memoryDelta), 0) / componentMounts.length || 0,
                largestImpact: Math.max(...componentMounts.map(item => Math.abs(item.memoryDelta)), 0),
            },
        };
    }
}

/**
 * Performance optimization utilities
 */
export const PerformanceUtils = {
    /**
     * Debounced function for expensive operations
     */
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttled function for frequent operations
     */
    throttle: (func, limit) => {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Memoization utility for expensive calculations
     */
    memoize: (fn, getKey = (...args) => JSON.stringify(args)) => {
        const cache = new Map();
        return (...args) => {
            const key = getKey(...args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = fn(...args);
            cache.set(key, result);
            return result;
        };
    },

    /**
     * Shallow comparison for React.memo
     */
    shallowEqual: (objA, objB) => {
        const keysA = Object.keys(objA);
        const keysB = Object.keys(objB);

        if (keysA.length !== keysB.length) {
            return false;
        }

        for (let i = 0; i < keysA.length; i++) {
            const key = keysA[i];
            if (objA[key] !== objB[key]) {
                return false;
            }
        }

        return true;
    },

    /**
     * Deep comparison for complex props
     */
    deepEqual: (objA, objB) => {
        if (objA === objB) return true;
        if (objA == null || objB == null) return false;
        if (typeof objA !== 'object' || typeof objB !== 'object') return false;

        const keysA = Object.keys(objA);
        const keysB = Object.keys(objB);

        if (keysA.length !== keysB.length) return false;

        for (let key of keysA) {
            if (!keysB.includes(key)) return false;
            if (!PerformanceUtils.deepEqual(objA[key], objB[key])) return false;
        }

        return true;
    },
};

/**
 * Performance monitoring dashboard
 * Provides a comprehensive view of all performance metrics
 */
export const PerformanceDashboard = {
    getFullReport: () => {
        return {
            timestamp: Date.now(),
            config: PERFORMANCE_CONFIG,
            componentMetrics: Object.fromEntries(performanceMetrics.componentRenders),
            bundleMetrics: {
                ...performanceMetrics.bundleSize,
                analysis: BundleSizeAnalyzer.generateReport(),
            },
            memoryMetrics: MemoryMonitor.getMemoryReport(),
            recommendations: PerformanceDashboard.generateRecommendations(),
        };
    },

    generateRecommendations: () => {
        const recommendations = [];
        const componentMetrics = performanceMetrics.componentRenders;

        // Check for slow components
        componentMetrics.forEach((metrics, componentName) => {
            if (metrics.averageRenderTime > 10) {
                recommendations.push({
                    type: 'performance',
                    severity: 'warning',
                    component: componentName,
                    message: `${componentName} has slow average render time (${metrics.averageRenderTime.toFixed(2)}ms)`,
                    suggestion: 'Consider using React.memo or optimizing expensive calculations',
                });
            }

            if (metrics.renderCount > 100) {
                recommendations.push({
                    type: 'performance',
                    severity: 'info',
                    component: componentName,
                    message: `${componentName} renders frequently (${metrics.renderCount} times)`,
                    suggestion: 'Check if props are changing unnecessarily',
                });
            }
        });

        // Bundle size recommendations
        const bundleReport = BundleSizeAnalyzer.generateReport();
        bundleReport.recommendations.forEach(rec => {
            recommendations.push({
                type: 'bundle',
                severity: 'info',
                message: rec,
                suggestion: 'Consider code splitting or lazy loading',
            });
        });

        return recommendations;
    },

    exportMetrics: () => {
        const report = PerformanceDashboard.getFullReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    clearMetrics: () => {
        performanceMetrics = {
            componentRenders: new Map(),
            bundleSize: { designSystem: 0, components: 0, themes: 0 },
            memoryUsage: { themeSwitch: [], componentMount: [] },
            renderTimes: new Map(),
        };
        BundleSizeAnalyzer.componentSizes.clear();
        BundleSizeAnalyzer.totalSize = 0;
    },
};

// Register bundle sizes for existing components
BundleSizeAnalyzer.registerComponent('UnifiedCard', 15);
BundleSizeAnalyzer.registerComponent('UnifiedButton', 12);
BundleSizeAnalyzer.registerComponent('UnifiedTable', 45);
BundleSizeAnalyzer.registerComponent('UnifiedFormField', 35);
BundleSizeAnalyzer.registerComponent('EnhancedThemeProvider', 25);
BundleSizeAnalyzer.registerComponent('DesignSystem', 20);

export default {
    ComponentPerformanceTracker,
    BundleSizeAnalyzer,
    MemoryMonitor,
    PerformanceUtils,
    PerformanceDashboard,
    withPerformanceTracking,
    usePerformanceTracking,
};