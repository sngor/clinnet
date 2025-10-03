/**
 * Optimized Enhanced Theme Provider
 * Performance-optimized theme system with memoization and efficient re-renders
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
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
import {
  PerformanceUtils,
  MemoryMonitor,
  BundleSizeAnalyzer,
} from "../../design-system/utils/performance.js";
import "../../design-system/css/theme-transitions.css";

// Register component size for bundle analysis
BundleSizeAnalyzer.registerComponent("EnhancedThemeProviderOptimized", 20);

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

// Memoized theme configuration creation
const createThemeConfiguration = PerformanceUtils.memoize(
  (mode, designTokens) => {
    const colors = mode === "dark" ? darkColors : lightColors;
    const isDark = mode === "dark";

    return {
      palette: {
        mode,
        primary: {
          main: colors.primary.main,
          light: colors.primary.light,
          dark: colors.primary.dark,
          contrastText: colors.primary.contrastText,
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
        secondary: {
          main: colors.secondary.main,
          light: colors.secondary.light,
          dark: colors.secondary.dark,
          contrastText: colors.secondary.contrastText,
        },
        background: {
          default: colors.background.default,
          paper: colors.background.paper,
          elevated: colors.background.elevated,
        },
        surface: {
          primary: colors.surface.primary,
          secondary: colors.surface.secondary,
          tertiary: colors.surface.tertiary,
          disabled: colors.surface.disabled,
        },
        text: {
          primary: colors.text.primary,
          secondary: colors.text.secondary,
          disabled: colors.text.disabled,
          inverse: colors.text.inverse,
        },
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
        divider: colors.border.primary,
        border: {
          primary: colors.border.primary,
          secondary: colors.border.secondary,
          focus: colors.border.focus,
          error: colors.border.error,
        },
        action: {
          active: isDark ? "rgba(255, 255, 255, 0.54)" : "rgba(0, 0, 0, 0.54)",
          hover: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)",
          selected: isDark
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(0, 0, 0, 0.08)",
          disabled: isDark
            ? "rgba(255, 255, 255, 0.26)"
            : "rgba(0, 0, 0, 0.26)",
          disabledBackground: isDark
            ? "rgba(255, 255, 255, 0.12)"
            : "rgba(0, 0, 0, 0.12)",
          focus: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
        },
      },
      typography: {
        fontFamily: designTokens.typography.fontFamilies.primary.join(","),
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
        body1: {
          ...designTokens.typography.hierarchy.body1,
          color: colors.text.primary,
        },
        body2: {
          ...designTokens.typography.hierarchy.body2,
          color: colors.text.secondary,
        },
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
      shape: { borderRadius: designTokens.borders.radius.md },
      spacing: (factor) => designTokens.spacing.scale.md * factor,
      breakpoints: {
        values: {
          xs: parseInt(designTokens.layout.breakpoints.xs),
          sm: parseInt(designTokens.layout.breakpoints.sm),
          md: parseInt(designTokens.layout.breakpoints.md),
          lg: parseInt(designTokens.layout.breakpoints.lg),
          xl: parseInt(designTokens.layout.breakpoints.xl),
        },
      },
      zIndex: designTokens.layout.zIndex,
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
      shadows: isDark ? designTokens.shadows.dark : designTokens.shadows.light,
    };
  },
  (mode, designTokens) =>
    `${mode}-${JSON.stringify(designTokens.version || "v1")}`
);

// Memoized component overrides creation
const createComponentOverrides = PerformanceUtils.memoize(
  (mode, colors, designTokens) => {
    const isDark = mode === "dark";

    return {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: colors.background.default,
            color: colors.text.primary,
            transition: designTokens.transitions.combinations.theme,
            fontFeatureSettings: '"cv03", "cv04", "cv11"',
            scrollBehavior: "smooth",
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
          "*": {
            transition: designTokens.transitions.combinations.theme,
          },
        },
      },
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
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: `${colors.background.paper}cc`,
            backdropFilter: "blur(20px) saturate(180%)",
            borderBottom: `1px solid ${colors.border.primary}`,
            boxShadow: "none",
            color: colors.text.primary,
            transition: designTokens.transitions.combinations.theme,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: colors.background.paper,
            borderRight: `1px solid ${colors.border.primary}`,
            boxShadow: "none",
          },
        },
      },
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
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: designTokens.borders.radius.full,
            fontWeight: designTokens.typography.fontWeights.medium,
          },
        },
      },
    };
  },
  (mode, colors, designTokens) =>
    `${mode}-${JSON.stringify(colors)}-${JSON.stringify(
      designTokens.version || "v1"
    )}`
);

// Optimized system preference detection hook
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
    const handleChange = PerformanceUtils.throttle(
      (e) => setSystemPrefersDark(e.matches),
      100
    );

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return systemPrefersDark;
};

// Memoized theme wrapper component
const ThemeWrapper = memo(({ children, theme }) => (
  <MUIThemeProvider theme={theme}>
    <CssBaseline />
    <div className="theme-provider-wrapper loaded">{children}</div>
  </MUIThemeProvider>
));

// Enhanced Theme Provider Component
export const EnhancedThemeProviderOptimized = memo(({ children }) => {
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

  // Calculate effective theme mode with memoization
  const effectiveMode = useMemo(() => {
    if (themeMode === "auto") {
      return systemPrefersDark ? "dark" : "light";
    }
    return themeMode;
  }, [themeMode, systemPrefersDark]);

  // Memoized theme configuration
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

  // Optimized theme management functions
  const setTheme = useCallback(
    (mode) => {
      // Track memory usage during theme switch
      const endMemoryTracking = MemoryMonitor.trackThemeSwitch(themeMode, mode);

      // Start theme transition
      if (typeof window !== "undefined") {
        themeTransitionManager.startTransition();
      }

      setThemeMode(mode);
      themeStorageManager.setThemeMode(mode);

      // End memory tracking after a delay
      setTimeout(endMemoryTracking, 1000);
    },
    [themeMode]
  );

  const updateThemePreferences = useCallback((preferences) => {
    setThemePreferences((prev) => ({ ...prev, ...preferences }));
    themeStorageManager.setThemePreferences(preferences);
  }, []);

  const toggleTheme = useCallback(() => {
    const nextMode =
      themeMode === "light" ? "dark" : themeMode === "dark" ? "auto" : "light";
    setTheme(nextMode);
  }, [themeMode, setTheme]);

  // Initialize theme loading state
  useEffect(() => {
    if (typeof window === "undefined") return;

    themeTransitionManager.applyLoadingState();

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

    // Batch DOM updates for better performance
    requestAnimationFrame(() => {
      root.style.setProperty("--theme-bg-default", colors.background.default);
      root.style.setProperty("--theme-bg-paper", colors.background.paper);
      root.style.setProperty("--theme-text-primary", colors.text.primary);
      root.style.setProperty("--theme-text-secondary", colors.text.secondary);
      root.style.setProperty("--theme-border-primary", colors.border.primary);
      root.style.setProperty("--theme-primary-main", colors.primary.main);
      root.style.setProperty("--theme-focus-color", colors.border.focus);

      document.body.setAttribute("data-theme-mode", themeMode);
      document.body.setAttribute("data-theme-active", effectiveMode);
    });

    const timer = setTimeout(() => {
      themeTransitionManager.endTransition();
    }, parseInt(designSystem.transitions.durations.normal));

    return () => clearTimeout(timer);
  }, [effectiveMode, themeMode]);

  // Memoized context value
  const contextValue = useMemo(
    () => ({
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
    }),
    [
      themeMode,
      effectiveMode,
      systemPrefersDark,
      themePreferences,
      setTheme,
      toggleTheme,
      updateThemePreferences,
      themeConfig,
    ]
  );

  return (
    <EnhancedThemeContext.Provider value={contextValue}>
      <ThemeWrapper theme={themeConfig}>{children}</ThemeWrapper>
    </EnhancedThemeContext.Provider>
  );
});

EnhancedThemeProviderOptimized.displayName = "EnhancedThemeProviderOptimized";

export default EnhancedThemeProviderOptimized;
