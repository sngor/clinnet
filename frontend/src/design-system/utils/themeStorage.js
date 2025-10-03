/**
 * Theme Storage and Synchronization Utilities
 * Handles localStorage persistence and cross-tab synchronization
 */

import React from 'react';

// Storage keys
const STORAGE_KEYS = {
    THEME_MODE: 'clinnet-theme-mode',
    THEME_PREFERENCES: 'clinnet-theme-preferences',
    THEME_CUSTOM_COLORS: 'clinnet-theme-custom-colors',
};

// Default theme preferences
const DEFAULT_PREFERENCES = {
    mode: 'auto', // 'light', 'dark', 'auto'
    autoSwitchTime: null, // { light: '06:00', dark: '18:00' }
    highContrast: false,
    reducedMotion: false,
    customColors: null,
};

// Theme storage manager
export class ThemeStorageManager {
    constructor() {
        this.listeners = new Set();
        this.isClient = typeof window !== 'undefined';

        if (this.isClient) {
            // Listen for storage changes from other tabs
            window.addEventListener('storage', this.handleStorageChange.bind(this));

            // Listen for system preference changes
            this.setupSystemPreferenceListeners();
        }
    }

    // Get theme mode from storage
    getThemeMode() {
        if (!this.isClient) return DEFAULT_PREFERENCES.mode;

        try {
            const stored = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
            if (stored && ['light', 'dark', 'auto'].includes(stored)) {
                return stored;
            }
        } catch (error) {
            console.warn('Failed to read theme mode from localStorage:', error);
        }

        return DEFAULT_PREFERENCES.mode;
    }

    // Set theme mode in storage
    setThemeMode(mode) {
        if (!this.isClient) return;

        try {
            localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
            this.notifyListeners('themeMode', mode);
        } catch (error) {
            console.warn('Failed to save theme mode to localStorage:', error);
        }
    }

    // Get theme preferences from storage
    getThemePreferences() {
        if (!this.isClient) return DEFAULT_PREFERENCES;

        try {
            const stored = localStorage.getItem(STORAGE_KEYS.THEME_PREFERENCES);
            if (stored) {
                const parsed = JSON.parse(stored);
                return { ...DEFAULT_PREFERENCES, ...parsed };
            }
        } catch (error) {
            console.warn('Failed to read theme preferences from localStorage:', error);
        }

        return DEFAULT_PREFERENCES;
    }

    // Set theme preferences in storage
    setThemePreferences(preferences) {
        if (!this.isClient) return;

        try {
            const current = this.getThemePreferences();
            const updated = { ...current, ...preferences };
            localStorage.setItem(STORAGE_KEYS.THEME_PREFERENCES, JSON.stringify(updated));
            this.notifyListeners('themePreferences', updated);
        } catch (error) {
            console.warn('Failed to save theme preferences to localStorage:', error);
        }
    }

    // Get custom colors from storage
    getCustomColors() {
        if (!this.isClient) return null;

        try {
            const stored = localStorage.getItem(STORAGE_KEYS.THEME_CUSTOM_COLORS);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to read custom colors from localStorage:', error);
        }

        return null;
    }

    // Set custom colors in storage
    setCustomColors(colors) {
        if (!this.isClient) return;

        try {
            if (colors) {
                localStorage.setItem(STORAGE_KEYS.THEME_CUSTOM_COLORS, JSON.stringify(colors));
            } else {
                localStorage.removeItem(STORAGE_KEYS.THEME_CUSTOM_COLORS);
            }
            this.notifyListeners('customColors', colors);
        } catch (error) {
            console.warn('Failed to save custom colors to localStorage:', error);
        }
    }

    // Clear all theme data
    clearThemeData() {
        if (!this.isClient) return;

        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            this.notifyListeners('cleared', null);
        } catch (error) {
            console.warn('Failed to clear theme data from localStorage:', error);
        }
    }

    // Handle storage changes from other tabs
    handleStorageChange(event) {
        if (!Object.values(STORAGE_KEYS).includes(event.key)) return;

        let eventType;
        let value;

        switch (event.key) {
            case STORAGE_KEYS.THEME_MODE:
                eventType = 'themeMode';
                value = event.newValue;
                break;
            case STORAGE_KEYS.THEME_PREFERENCES:
                eventType = 'themePreferences';
                try {
                    value = event.newValue ? JSON.parse(event.newValue) : null;
                } catch {
                    value = null;
                }
                break;
            case STORAGE_KEYS.THEME_CUSTOM_COLORS:
                eventType = 'customColors';
                try {
                    value = event.newValue ? JSON.parse(event.newValue) : null;
                } catch {
                    value = null;
                }
                break;
            default:
                return;
        }

        this.notifyListeners(eventType, value, true);
    }

    // Setup system preference listeners
    setupSystemPreferenceListeners() {
        if (!this.isClient) return;

        // Dark mode preference
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleDarkModeChange = (e) => {
            this.notifyListeners('systemPrefersDark', e.matches);
        };

        darkModeQuery.addEventListener('change', handleDarkModeChange);

        // High contrast preference
        const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
        const handleHighContrastChange = (e) => {
            this.notifyListeners('systemPrefersHighContrast', e.matches);
        };

        highContrastQuery.addEventListener('change', handleHighContrastChange);

        // Reduced motion preference
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleReducedMotionChange = (e) => {
            this.notifyListeners('systemPrefersReducedMotion', e.matches);
        };

        reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

        // Store cleanup function
        this.cleanupSystemListeners = () => {
            darkModeQuery.removeEventListener('change', handleDarkModeChange);
            highContrastQuery.removeEventListener('change', handleHighContrastChange);
            reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
        };
    }

    // Add change listener
    addListener(callback) {
        this.listeners.add(callback);

        // Return cleanup function
        return () => {
            this.listeners.delete(callback);
        };
    }

    // Remove change listener
    removeListener(callback) {
        this.listeners.delete(callback);
    }

    // Notify all listeners
    notifyListeners(type, value, fromOtherTab = false) {
        this.listeners.forEach(callback => {
            try {
                callback({ type, value, fromOtherTab });
            } catch (error) {
                console.warn('Theme storage listener error:', error);
            }
        });
    }

    // Get current system preferences
    getSystemPreferences() {
        if (!this.isClient) {
            return {
                prefersDark: false,
                prefersHighContrast: false,
                prefersReducedMotion: false,
            };
        }

        return {
            prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
            prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
            prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        };
    }

    // Check if storage is available
    isStorageAvailable() {
        if (!this.isClient) return false;

        try {
            const test = '__theme_storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    // Cleanup
    destroy() {
        if (this.isClient) {
            window.removeEventListener('storage', this.handleStorageChange.bind(this));
            if (this.cleanupSystemListeners) {
                this.cleanupSystemListeners();
            }
        }
        this.listeners.clear();
    }
}

// Global storage manager instance
export const themeStorageManager = new ThemeStorageManager();

// React hook for theme storage
export const useThemeStorage = () => {
    const [storageData, setStorageData] = React.useState(() => ({
        themeMode: themeStorageManager.getThemeMode(),
        preferences: themeStorageManager.getThemePreferences(),
        customColors: themeStorageManager.getCustomColors(),
        systemPreferences: themeStorageManager.getSystemPreferences(),
    }));

    React.useEffect(() => {
        const unsubscribe = themeStorageManager.addListener(({ type, value, fromOtherTab }) => {
            setStorageData(prev => {
                const updated = { ...prev };

                switch (type) {
                    case 'themeMode':
                        updated.themeMode = value;
                        break;
                    case 'themePreferences':
                        updated.preferences = value || themeStorageManager.getThemePreferences();
                        break;
                    case 'customColors':
                        updated.customColors = value;
                        break;
                    case 'systemPrefersDark':
                        updated.systemPreferences = {
                            ...updated.systemPreferences,
                            prefersDark: value,
                        };
                        break;
                    case 'systemPrefersHighContrast':
                        updated.systemPreferences = {
                            ...updated.systemPreferences,
                            prefersHighContrast: value,
                        };
                        break;
                    case 'systemPrefersReducedMotion':
                        updated.systemPreferences = {
                            ...updated.systemPreferences,
                            prefersReducedMotion: value,
                        };
                        break;
                    case 'cleared':
                        updated.themeMode = DEFAULT_PREFERENCES.mode;
                        updated.preferences = DEFAULT_PREFERENCES;
                        updated.customColors = null;
                        break;
                }

                return updated;
            });
        });

        return unsubscribe;
    }, []);

    const updateThemeMode = (mode) => {
        themeStorageManager.setThemeMode(mode);
    };

    const updatePreferences = (preferences) => {
        themeStorageManager.setThemePreferences(preferences);
    };

    const updateCustomColors = (colors) => {
        themeStorageManager.setCustomColors(colors);
    };

    const clearAll = () => {
        themeStorageManager.clearThemeData();
    };

    return {
        ...storageData,
        updateThemeMode,
        updatePreferences,
        updateCustomColors,
        clearAll,
        isStorageAvailable: themeStorageManager.isStorageAvailable(),
    };
};

// Utility functions
export const getStoredThemeMode = () => themeStorageManager.getThemeMode();
export const setStoredThemeMode = (mode) => themeStorageManager.setThemeMode(mode);
export const getStoredThemePreferences = () => themeStorageManager.getThemePreferences();
export const setStoredThemePreferences = (preferences) => themeStorageManager.setThemePreferences(preferences);

export default {
    ThemeStorageManager,
    themeStorageManager,
    useThemeStorage,
    getStoredThemeMode,
    setStoredThemeMode,
    getStoredThemePreferences,
    setStoredThemePreferences,
    STORAGE_KEYS,
    DEFAULT_PREFERENCES,
};