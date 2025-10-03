/**
 * Performance Monitoring Hook
 * Custom hook for integrating performance monitoring into components
 */

import { useEffect, useRef, useCallback, useMemo } from "react";
import {
    ComponentPerformanceTracker,
    MemoryMonitor,
    BundleSizeAnalyzer,
    PerformanceUtils
} from "../design-system/utils/performance.js";

/**
 * Hook for monitoring component performance
 * @param {string} componentName - Name of the component to track
 * @param {Array} dependencies - Dependencies to track for re-renders
 * @param {Object} options - Configuration options
 */
export const usePerformanceMonitoring = (
    componentName,
    dependencies = [],
    options = {}
) => {
    const {
        trackMemory = false,
        trackBundleSize = false,
        logSlowRenders = true,
        slowRenderThreshold = 16, // 16ms = 60fps
        sampleRate = 1.0, // Track 100% of renders by default
    } = options;

    const trackerRef = useRef(null);
    const memoryTrackingRef = useRef(null);
    const renderCountRef = useRef(0);

    // Initialize tracker
    if (!trackerRef.current) {
        trackerRef.current = new ComponentPerformanceTracker(componentName);
    }

    // Track component mount/unmount memory usage
    useEffect(() => {
        if (trackMemory) {
            memoryTrackingRef.current = MemoryMonitor.trackComponentMount(componentName);
        }

        return () => {
            if (memoryTrackingRef.current) {
                memoryTrackingRef.current();
            }
        };
    }, [componentName, trackMemory]);

    // Track renders
    useEffect(() => {
        // Sample renders based on sample rate
        if (Math.random() > sampleRate) return;

        renderCountRef.current++;

        if (trackerRef.current) {
            trackerRef.current.startRender();

            // Use requestAnimationFrame to measure actual render time
            const startTime = performance.now();

            requestAnimationFrame(() => {
                const endTime = performance.now();
                const renderTime = endTime - startTime;

                trackerRef.current.endRender({
                    dependencies: dependencies.length,
                    renderCount: renderCountRef.current,
                    renderTime
                });

                // Log slow renders if enabled
                if (logSlowRenders && renderTime > slowRenderThreshold) {
                    console.warn(
                        `🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms (render #${renderCountRef.current})`
                    );
                }
            });
        }
    }, dependencies);

    // Register bundle size if specified
    useEffect(() => {
        if (trackBundleSize && options.estimatedSize) {
            BundleSizeAnalyzer.registerComponent(componentName, options.estimatedSize);
        }
    }, [componentName, trackBundleSize, options.estimatedSize]);

    // Return performance utilities
    const performanceUtils = useMemo(() => ({
        getMetrics: () => trackerRef.current?.getMetrics(),
        getRenderCount: () => renderCountRef.current,

        // Utility for measuring expensive operations
        measureOperation: (operationName, operation) => {
            const startTime = performance.now();
            const result = operation();
            const endTime = performance.now();

            console.log(`⏱️ ${componentName}.${operationName}: ${(endTime - startTime).toFixed(2)}ms`);

            return result;
        },

        // Utility for measuring async operations
        measureAsyncOperation: async (operationName, operation) => {
            const startTime = performance.now();
            const result = await operation();
            const endTime = performance.now();

            console.log(`⏱️ ${componentName}.${operationName} (async): ${(endTime - startTime).toFixed(2)}ms`);

            return result;
        },
    }), [componentName]);

    return performanceUtils;
};

/**
 * Hook for monitoring theme performance
 * Specifically tracks theme switching performance
 */
export const useThemePerformanceMonitoring = () => {
    const themeChangeRef = useRef(null);

    const trackThemeChange = useCallback((fromTheme, toTheme) => {
        // End previous tracking if exists
        if (themeChangeRef.current) {
            themeChangeRef.current();
        }

        // Start new tracking
        themeChangeRef.current = MemoryMonitor.trackThemeSwitch(fromTheme, toTheme);

        // Auto-end tracking after 2 seconds
        setTimeout(() => {
            if (themeChangeRef.current) {
                themeChangeRef.current();
                themeChangeRef.current = null;
            }
        }, 2000);
    }, []);

    return { trackThemeChange };
};

/**
 * Hook for monitoring bundle size impact
 * Tracks the cumulative bundle size of loaded components
 */
export const useBundleSizeMonitoring = () => {
    const loadedComponentsRef = useRef(new Set());

    const registerComponent = useCallback((componentName, estimatedSize) => {
        if (!loadedComponentsRef.current.has(componentName)) {
            BundleSizeAnalyzer.registerComponent(componentName, estimatedSize);
            loadedComponentsRef.current.add(componentName);
        }
    }, []);

    const getBundleReport = useCallback(() => {
        return BundleSizeAnalyzer.generateReport();
    }, []);

    const getLoadedComponents = useCallback(() => {
        return Array.from(loadedComponentsRef.current);
    }, []);

    return {
        registerComponent,
        getBundleReport,
        getLoadedComponents,
        totalSize: BundleSizeAnalyzer.getTotalSize(),
    };
};

/**
 * Hook for performance-aware component optimization
 * Provides utilities for optimizing component re-renders
 */
export const usePerformanceOptimization = (componentName) => {
    // Memoized shallow comparison function
    const shallowEqual = useCallback((objA, objB) => {
        return PerformanceUtils.shallowEqual(objA, objB);
    }, []);

    // Memoized deep comparison function
    const deepEqual = useCallback((objA, objB) => {
        return PerformanceUtils.deepEqual(objA, objB);
    }, []);

    // Debounced function creator
    const createDebouncedFunction = useCallback((func, delay) => {
        return PerformanceUtils.debounce(func, delay);
    }, []);

    // Throttled function creator
    const createThrottledFunction = useCallback((func, limit) => {
        return PerformanceUtils.throttle(func, limit);
    }, []);

    // Memoized function creator
    const createMemoizedFunction = useCallback((func, keyGenerator) => {
        return PerformanceUtils.memoize(func, keyGenerator);
    }, []);

    // Performance-aware setState that batches updates
    const createBatchedSetter = useCallback((setter) => {
        let pendingUpdate = null;

        return (newValue) => {
            if (pendingUpdate) {
                cancelAnimationFrame(pendingUpdate);
            }

            pendingUpdate = requestAnimationFrame(() => {
                setter(newValue);
                pendingUpdate = null;
            });
        };
    }, []);

    return {
        shallowEqual,
        deepEqual,
        createDebouncedFunction,
        createThrottledFunction,
        createMemoizedFunction,
        createBatchedSetter,
    };
};

/**
 * Hook for monitoring render performance in development
 * Only active in development mode
 */
export const useRenderPerformanceMonitoring = (componentName, props = {}) => {
    const renderStartTimeRef = useRef(null);
    const previousPropsRef = useRef(props);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;

        renderStartTimeRef.current = performance.now();

        // Check for unnecessary re-renders
        const propsChanged = !PerformanceUtils.shallowEqual(previousPropsRef.current, props);

        if (!propsChanged) {
            console.warn(`🔄 Unnecessary re-render in ${componentName} - props haven't changed`);
        }

        previousPropsRef.current = props;

        // Measure render time
        requestAnimationFrame(() => {
            if (renderStartTimeRef.current) {
                const renderTime = performance.now() - renderStartTimeRef.current;

                if (renderTime > 16) {
                    console.warn(`🐌 Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
                } else if (renderTime > 8) {
                    console.log(`⚠️ Moderate render in ${componentName}: ${renderTime.toFixed(2)}ms`);
                }
            }
        });
    });

    return {
        renderTime: renderStartTimeRef.current ? performance.now() - renderStartTimeRef.current : 0,
    };
};

export default {
    usePerformanceMonitoring,
    useThemePerformanceMonitoring,
    useBundleSizeMonitoring,
    usePerformanceOptimization,
    useRenderPerformanceMonitoring,
};