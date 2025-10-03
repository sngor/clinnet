/**
 * Enhanced Theme Provider Implementation
 * Comprehensive theme system with complete dark mode support,
 * system preference detection, and smooth transitions
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import {
  createTheme,
  ThemeProvider as MUIThemeProvider,
  CssBaseline,
} from "@mui/material";
import {
  designSystem,
  lightColors,
  darkColors,
} from "../../design-system/tokens/index.js";
import { themeTransitionManager } from "../../design-system/utils/themeTransitions.js";
import { themeStorageManager } from "../../design-system/utils/themeStorage.js";
import "../../design-system/css/theme-transitions.css";

// Theme context
const EnhancedThemeContext = createContext();

export const useEnhancedTheme = () => {
  const context = useContext(EnhancedThemeContext);
  if (!context) {
    throw new Error(
      "useEnhancedTheme must be used within an EnhancedThemeProvider"
    );
  }
  return context;
};

// Theme configuration with WCAG 2.1 AA compliance
const createThemeConfiguration = (mode, designTokens) => {
  const colors = mode === "dark" ? darkColors : lightColors;
  const isDark = mode === "dark";

  return {
    palette: {
      mode,
      // Primary colors with WCAG 2.1 AA compliance
      primary: {
        main: colors.primary.main,
        light: colors.primary.light,
        dark: colors.primary.dark,
        contrastText: colors.primary.contrastText,
        // Additional shades for better theming
        50: designTokens.colors.scales.primary[50],
        100: designTokens.colors.scales.primary[100],
        200: designTokens.colors.scales.primary[200],
        300: designTokens.colors.scales.primary[300],
        400: designTokens.colors.scales.primary[400],
        500: designTokens.colors.scales.primary[500],
        600: designTokens.colors.scales.primary[600],
        700: designTokens.colors.scales.primary[700],
        800: designTokens.colors.scales.primary[800],
        900: designTokens.colors.scales.primary[900],
      },

      // Secondary colors
      secondary: {
        main: colors.secondary.main,
        light: colors.secondary.light,
        dark: colors.secondary.dark,
        contrastText: colors.secondary.contrastText,
      },

      // Background colors optimized for each theme
      background: {
        default: colors.background.default,
        paper: colors.background.paper,
        elevated: colors.background.elevated,
      },

      // Surface colors for different elevation levels
      surface: {
        primary: colors.surface.primary,
        secondary: colors.surface.secondary,
        tertiary: colors.surface.tertiary,
        disabled: colors.surface.disabled,
      },

      // Text colors with proper contrast ratios
      text: {
        primary: colors.text.primary,
        secondary: colors.text.secondary,
        disabled: colors.text.disabled,
        inverse: colors.text.inverse,
      },

      // State colors
      success: {
        main: colors.success.main,
        light: colors.success.light,
        dark: colors.success.dark,
        contrastText: colors.success.contrastText,
      },

      warning: {
        main: colors.warning.main,
        light: colors.warning.light,
        dark: colors.warning.dark,
        contrastText: colors.warning.contrastText,
      },

      error: {
        main: colors.error.main,
        light: colors.error.light,
        dark: colors.error.dark,
        contrastText: colors.error.contrastText,
      },

      info: {
        main: colors.info.main,
        light: colors.info.light,
        dark: colors.info.dark,
        contrastText: colors.info.contrastText,
      },

      // Border colors
      divider: colors.border.primary,
      border: {
        primary: colors.border.primary,
        secondary: colors.border.secondary,
        focus: colors.border.focus,
        error: colors.border.error,
      },

      // Action colors for interactive elements
      action: {
        active: isDark ? "rgba(255, 255, 255, 0.54)" : "rgba(0, 0, 0, 0.54)",
        hover: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)",
        selected: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
        disabled: isDark ? "rgba(255, 255, 255, 0.26)" : "rgba(0, 0, 0, 0.26)",
        disabledBackground: isDark
          ? "rgba(255, 255, 255, 0.12)"
          : "rgba(0, 0, 0, 0.12)",
        focus: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
      },
    },

    // Typography system from design tokens
    typography: {
      fontFamily: designTokens.typography.fontFamilies.primary.join(","),

      // Heading styles
      h1: {
        ...designTokens.typography.hierarchy.h1,
        color: colors.text.primary,
      },
      h2: {
        ...designTokens.typography.hierarchy.h2,
        color: colors.text.primary,
      },
      h3: {
        ...designTokens.typography.hierarchy.h3,
        color: colors.text.primary,
      },
      h4: {
        ...designTokens.typography.hierarchy.h4,
        color: colors.text.primary,
      },
      h5: {
        ...designTokens.typography.hierarchy.h5,
        color: colors.text.primary,
      },
      h6: {
        ...designTokens.typography.hierarchy.h6,
        color: colors.text.primary,
      },

      // Body text styles
      body1: {
        ...designTokens.typography.hierarchy.body1,
        color: colors.text.primary,
      },
      body2: {
        ...designTokens.typography.hierarchy.body2,
        color: colors.text.secondary,
      },

      // Other text styles
      subtitle1: {
        ...designTokens.typography.hierarchy.subtitle1,
        color: colors.text.primary,
      },
      subtitle2: {
        ...designTokens.typography.hierarchy.subtitle2,
        color: colors.text.secondary,
      },
      caption: {
        ...designTokens.typography.hierarchy.caption,
        color: colors.text.secondary,
      },
      overline: {
        ...designTokens.typography.hierarchy.overline,
        color: colors.text.secondary,
      },
      button: {
        ...designTokens.typography.hierarchy.button,
        textTransform: "none",
      },
    },

    // Shape configuration
    shape: {
      borderRadius: designTokens.borders.radius.md,
    },

    // Spacing system
    spacing: (factor) => designTokens.spacing.scale.md * factor,

    // Breakpoints
    breakpoints: {
      values: {
        xs: parseInt(designTokens.layout.breakpoints.xs),
        sm: parseInt(designTokens.layout.breakpoints.sm),
        md: parseInt(designTokens.layout.breakpoints.md),
        lg: parseInt(designTokens.layout.breakpoints.lg),
        xl: parseInt(designTokens.layout.breakpoints.xl),
      },
    },

    // Z-index scale
    zIndex: designTokens.layout.zIndex,

    // Transitions
    transitions: {
      duration: {
        shortest: designTokens.transitions.durations.fast,
        shorter: designTokens.transitions.durations.normal,
        short: designTokens.transitions.durations.slow,
        standard: designTokens.transitions.durations.normal,
        complex: designTokens.transitions.durations.slow,
        enteringScreen: designTokens.transitions.durations.normal,
        leavingScreen: designTokens.transitions.durations.fast,
      },
      easing: {
        easeInOut: designTokens.transitions.easings.easeInOut,
        easeOut: designTokens.transitions.easings.easeOut,
        easeIn: designTokens.transitions.easings.easeIn,
        sharp: designTokens.transitions.easings.sharp,
      },
    },

    // Shadow system
    shadows: isDark ? designTokens.shadows.dark : designTokens.shadows.light,
  };
};

// Component overrides for enhanced theming
const createComponentOverrides = (mode, colors, designTokens) => {
  const isDark = mode === "dark";

  return {
    // Global baseline styles
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.background.default,
          color: colors.text.primary,
          transition: designTokens.transitions.combinations.theme,
          fontFeatureSettings: '"cv03", "cv04", "cv11"',
          // Smooth scrolling
          scrollBehavior: "smooth",
          // Custom scrollbar styling
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: colors.surface.secondary,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: colors.border.secondary,
            borderRadius: designTokens.borders.radius.sm,
            "&:hover": {
              backgroundColor: colors.text.disabled,
            },
          },
        },
        // Prevent layout shifts during theme transitions
        "*": {
          transition: designTokens.transitions.combinations.theme,
        },
      },
    },

    // Button component overrides
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borders.radius.full,
          textTransform: "none",
          fontWeight: designTokens.typography.fontWeights.semibold,
          padding: `${designTokens.spacing.scale.sm}px ${designTokens.spacing.scale.lg}px`,
          transition: designTokens.transitions.combinations.interactive,
          boxShadow: "none",

          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: designTokens.shadows.light.md,
          },

          "&:active": {
            transform: "translateY(0)",
          },

          "&:focus-visible": {
            outline: `${designTokens.accessibility.focusRing.width} ${designTokens.accessibility.focusRing.style} ${colors.border.focus}`,
            outlineOffset: designTokens.accessibility.focusRing.offset,
          },
        },

        containedPrimary: {
          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
          color: colors.primary.contrastText,

          "&:hover": {
            background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${designTokens.colors.scales.primary[800]} 100%)`,
          },
        },

        outlined: {
          borderWidth: "2px",
          borderColor: colors.border.primary,
          color: colors.text.primary,

          "&:hover": {
            borderWidth: "2px",
            backgroundColor: colors.surface.secondary,
          },
        },

        text: {
          color: colors.text.primary,

          "&:hover": {
            backgroundColor: colors.surface.secondary,
          },
        },
      },
    },

    // Card component overrides
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.paper,
          borderRadius: designTokens.borders.radius.xl,
          border: `1px solid ${colors.border.primary}`,
          boxShadow: isDark
            ? designTokens.shadows.dark.sm
            : designTokens.shadows.light.sm,
          transition: designTokens.transitions.combinations.interactive,

          "&:hover": {
            boxShadow: isDark
              ? designTokens.shadows.dark.md
              : designTokens.shadows.light.md,
            transform: "translateY(-2px)",
          },
        },
      },
    },

    // Paper component overrides
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.paper,
          borderRadius: designTokens.borders.radius.lg,
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: isDark
            ? designTokens.shadows.dark.sm
            : designTokens.shadows.light.sm,
        },
        elevation2: {
          boxShadow: isDark
            ? designTokens.shadows.dark.md
            : designTokens.shadows.light.md,
        },
        elevation3: {
          boxShadow: isDark
            ? designTokens.shadows.dark.lg
            : designTokens.shadows.light.lg,
        },
      },
    },

    // AppBar component overrides
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: `${colors.background.paper}cc`, // 80% opacity
          backdropFilter: "blur(20px) saturate(180%)",
          borderBottom: `1px solid ${colors.border.primary}`,
          boxShadow: "none",
          color: colors.text.primary,
          transition: designTokens.transitions.combinations.theme,
        },
      },
    },

    // Drawer component overrides
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.background.paper,
          borderRight: `1px solid ${colors.border.primary}`,
          boxShadow: "none",
        },
      },
    },

    // TextField component overrides
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: designTokens.borders.radius.lg,
            backgroundColor: colors.surface.primary,
            transition: designTokens.transitions.combinations.interactive,

            "& fieldset": {
              borderColor: colors.border.primary,
            },

            "&:hover fieldset": {
              borderColor: colors.border.secondary,
            },

            "&.Mui-focused fieldset": {
              borderColor: colors.border.focus,
              borderWidth: "2px",
            },
          },

          "& .MuiInputLabel-root": {
            color: colors.text.secondary,

            "&.Mui-focused": {
              color: colors.primary.main,
            },
          },
        },
      },
    },

    // Table component overrides for consistent styling
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.border.primary}`,
          color: colors.text.primary,
        },
        head: {
          backgroundColor: colors.surface.secondary,
          color: colors.text.primary,
          fontWeight: designTokens.typography.fontWeights.semibold,
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:nth-of-type(even)": {
            backgroundColor: colors.surface.secondary,
          },
          "&:hover": {
            backgroundColor: colors.surface.tertiary,
          },
        },
      },
    },

    // Alert component overrides
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borders.radius.lg,
          border: "1px solid",
        },
        standardSuccess: {
          backgroundColor: colors.success.light,
          borderColor: colors.success.main,
          color: colors.success.dark,
        },
        standardError: {
          backgroundColor: colors.error.light,
          borderColor: colors.error.main,
          color: colors.error.dark,
        },
        standardWarning: {
          backgroundColor: colors.warning.light,
          borderColor: colors.warning.main,
          color: colors.warning.dark,
        },
        standardInfo: {
          backgroundColor: colors.info.light,
          borderColor: colors.info.main,
          color: colors.info.dark,
        },
      },
    },

    // Chip component overrides
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borders.radius.full,
          fontWeight: designTokens.typography.fontWeights.medium,
        },
      },
    },
  };
};

// System preference detection hook
const useSystemPreference = () => {
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => setSystemPrefersDark(e.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return systemPrefersDark;
};

// Enhanced Theme Provider Component
export const EnhancedThemeProvider = ({ children }) => {
  // Theme state management with storage synchronization
  const [themeMode, setThemeMode] = useState(() => {
    return themeStorageManager.getThemeMode();
  });

  // Theme preferences state
  const [themePreferences, setThemePreferences] = useState(() => {
    return themeStorageManager.getThemePreferences();
  });

  // System preference detection
  const systemPrefersDark = useSystemPreference();

  // Calculate effective theme mode
  const effectiveMode = useMemo(() => {
    if (themeMode === "auto") {
      return systemPrefersDark ? "dark" : "light";
    }
    return themeMode;
  }, [themeMode, systemPrefersDark]);

  // Theme configuration
  const themeConfig = useMemo(() => {
    const config = createThemeConfiguration(effectiveMode, designSystem);
    const colors = effectiveMode === "dark" ? darkColors : lightColors;
    const components = createComponentOverrides(
      effectiveMode,
      colors,
      designSystem
    );

    return createTheme({
      ...config,
      components,
    });
  }, [effectiveMode]);

  // Theme management functions with smooth transitions and storage
  const setTheme = (mode) => {
    // Start theme transition
    if (typeof window !== "undefined") {
      themeTransitionManager.startTransition();
    }

    setThemeMode(mode);
    themeStorageManager.setThemeMode(mode);
  };

  const updateThemePreferences = (preferences) => {
    setThemePreferences((prev) => ({ ...prev, ...preferences }));
    themeStorageManager.setThemePreferences(preferences);
  };

  const toggleTheme = () => {
    const nextMode =
      themeMode === "light" ? "dark" : themeMode === "dark" ? "auto" : "light";
    setTheme(nextMode);
  };

  // Initialize theme loading state
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Apply loading state during initialization
    themeTransitionManager.applyLoadingState();

    // Remove loading state after theme is ready
    const timer = setTimeout(() => {
      themeTransitionManager.removeLoadingState();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Storage synchronization and cross-tab communication
  useEffect(() => {
    if (typeof window === "undefined") return;

    const unsubscribe = themeStorageManager.addListener(
      ({ type, value, fromOtherTab }) => {
        if (fromOtherTab) {
          // Handle changes from other tabs
          switch (type) {
            case "themeMode":
              if (value && ["light", "dark", "auto"].includes(value)) {
                setThemeMode(value);
              }
              break;
            case "themePreferences":
              if (value) {
                setThemePreferences(value);
              }
              break;
          }
        }
      }
    );

    return unsubscribe;
  }, []);

  // Update CSS custom properties for theme transitions
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const colors = effectiveMode === "dark" ? darkColors : lightColors;

    // Set CSS custom properties for smooth transitions
    root.style.setProperty("--theme-bg-default", colors.background.default);
    root.style.setProperty("--theme-bg-paper", colors.background.paper);
    root.style.setProperty("--theme-text-primary", colors.text.primary);
    root.style.setProperty("--theme-text-secondary", colors.text.secondary);
    root.style.setProperty("--theme-border-primary", colors.border.primary);
    root.style.setProperty("--theme-primary-main", colors.primary.main);
    root.style.setProperty("--theme-focus-color", colors.border.focus);

    // Update body attributes for external styling
    document.body.setAttribute("data-theme-mode", themeMode);
    document.body.setAttribute("data-theme-active", effectiveMode);

    // End transition after CSS properties are updated
    const timer = setTimeout(() => {
      themeTransitionManager.endTransition();
    }, parseInt(designSystem.transitions.durations.normal));

    return () => clearTimeout(timer);
  }, [effectiveMode, themeMode]);

  // Context value
  const contextValue = {
    // Theme state
    themeMode,
    effectiveMode,
    isDarkMode: effectiveMode === "dark",
    systemPrefersDark,
    themePreferences,

    // Theme management
    setTheme,
    toggleTheme,
    updateThemePreferences,

    // Theme configuration
    theme: themeConfig,
    designTokens: designSystem,

    // Color palettes
    colors: effectiveMode === "dark" ? darkColors : lightColors,

    // Storage utilities
    storageManager: themeStorageManager,
  };

  return (
    <EnhancedThemeContext.Provider value={contextValue}>
      <MUIThemeProvider theme={themeConfig}>
        <CssBaseline />
        <div className="theme-provider-wrapper loaded">{children}</div>
      </MUIThemeProvider>
    </EnhancedThemeContext.Provider>
  );
};

export default EnhancedThemeProvider;
