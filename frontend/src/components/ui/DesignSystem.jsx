// Enhanced Design System for Clinnet EMR
import { createTheme } from "@mui/material/styles";

export const designSystem = {
  // Spacing system (8px base unit)
  spacing: {
    xs: 4, // 4px
    sm: 8, // 8px
    md: 16, // 16px
    lg: 24, // 24px
    xl: 32, // 32px
    xxl: 48, // 48px
    xxxl: 64, // 64px
  },

  // Consistent border radius system
  borderRadius: {
    none: 0,
    xs: 4, // Small elements (chips, small buttons)
    sm: 6, // Form fields, small cards
    md: 8, // Default for most components
    lg: 12, // Cards, modals
    xl: 16, // Large cards, containers
    xxl: 20, // Special containers
    full: 9999, // Pills, avatars
  },

  // Shadow system
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    xxl: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },

  // Typography scale
  typography: {
    fontSizes: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem", // 48px
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Layout constants
  layout: {
    headerHeight: 64,
    sidebarWidth: 240,
    sidebarCollapsedWidth: 80,
    containerMaxWidth: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  // Consistent transitions
  transitions: {
    fast: "0.15s cubic-bezier(0.4, 0, 0.2, 1)",
    normal: "0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  // Consistent hover effects
  hover: {
    lift: "translateY(-2px)",
    scale: "scale(1.02)",
    scaleSmall: "scale(1.05)",
  },

  // Component variants with consistent values
  components: {
    card: {
      variants: {
        default: {
          borderRadius: "lg",
          boxShadow: "md",
          padding: "lg",
          border: "1px solid",
        },
        elevated: {
          borderRadius: "lg",
          boxShadow: "lg",
          padding: "xl",
          border: "none",
        },
        flat: {
          borderRadius: "md",
          boxShadow: "none",
          padding: "lg",
          border: "1px solid",
        },
        outlined: {
          borderRadius: "lg",
          boxShadow: "none",
          padding: "lg",
          border: "2px solid",
        },
      },
    },
    button: {
      sizes: {
        small: {
          height: 32,
          padding: { x: "md", y: "xs" },
          fontSize: "sm",
        },
        medium: {
          height: 40,
          padding: { x: "lg", y: "sm" },
          fontSize: "base",
        },
        large: {
          height: 48,
          padding: { x: "xl", y: "md" },
          fontSize: "lg",
        },
      },
      variants: {
        primary: {
          borderRadius: "sm",
        },
        secondary: {
          borderRadius: "sm",
        },
        ghost: {
          borderRadius: "sm",
        },
      },
    },
    input: {
      borderRadius: "sm",
      height: 40,
      focusRing: "0 0 0 3px",
    },
  },
};

// Enhanced theme with design system
export const createEnhancedTheme = (mode = "light") => {
  const baseTheme = createTheme({
    palette: {
      mode,
      primary: {
        50: "#f0f4ff",
        100: "#e0e7ff",
        200: "#c7d2fe",
        300: "#a5b4fc",
        400: "#818cf8",
        500: "#6366f1",
        600: "#4f46e5",
        700: "#4338ca",
        800: "#3730a3",
        900: "#312e81",
        main: "#4f46e5",
      },
      secondary: {
        50: "#fdf4ff",
        100: "#fae8ff",
        200: "#f5d0fe",
        300: "#f0abfc",
        400: "#e879f9",
        500: "#d946ef",
        600: "#c026d3",
        700: "#a21caf",
        800: "#86198f",
        900: "#701a75",
        main: "#c026d3",
      },
      success: {
        50: "#f0fdf4",
        100: "#dcfce7",
        200: "#bbf7d0",
        300: "#86efac",
        400: "#4ade80",
        500: "#22c55e",
        600: "#16a34a",
        700: "#15803d",
        800: "#166534",
        900: "#14532d",
        main: "#22c55e",
      },
      warning: {
        50: "#fffbeb",
        100: "#fef3c7",
        200: "#fde68a",
        300: "#fcd34d",
        400: "#fbbf24",
        500: "#f59e0b",
        600: "#d97706",
        700: "#b45309",
        800: "#92400e",
        900: "#78350f",
        main: "#f59e0b",
      },
      error: {
        50: "#fef2f2",
        100: "#fee2e2",
        200: "#fecaca",
        300: "#fca5a5",
        400: "#f87171",
        500: "#ef4444",
        600: "#dc2626",
        700: "#b91c1c",
        800: "#991b1b",
        900: "#7f1d1d",
        main: "#ef4444",
      },
      grey: {
        50: "#f9fafb",
        100: "#f3f4f6",
        200: "#e5e7eb",
        300: "#d1d5db",
        400: "#9ca3af",
        500: "#6b7280",
        600: "#4b5563",
        700: "#374151",
        800: "#1f2937",
        900: "#111827",
      },
      background: {
        default: mode === "dark" ? "#0f172a" : "#f8fafc",
        paper: mode === "dark" ? "#1e293b" : "#ffffff",
      },
      text: {
        primary: mode === "dark" ? "#f8fafc" : "#1e293b",
        secondary: mode === "dark" ? "#94a3b8" : "#64748b",
      },
    },
    typography: {
      fontFamily: [
        "Inter",
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
      ].join(","),
      // Consistent typography scale
      h1: {
        fontSize: designSystem.typography.fontSizes["5xl"],
        fontWeight: designSystem.typography.fontWeights.bold,
        lineHeight: designSystem.typography.lineHeights.tight,
        letterSpacing: "-0.025em",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      },
      h2: {
        fontSize: designSystem.typography.fontSizes["4xl"],
        fontWeight: designSystem.typography.fontWeights.bold,
        lineHeight: designSystem.typography.lineHeights.tight,
        letterSpacing: "-0.025em",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      },
      h3: {
        fontSize: designSystem.typography.fontSizes["3xl"],
        fontWeight: designSystem.typography.fontWeights.semibold,
        lineHeight: designSystem.typography.lineHeights.tight,
        letterSpacing: "-0.02em",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      },
      h4: {
        fontSize: designSystem.typography.fontSizes["2xl"],
        fontWeight: designSystem.typography.fontWeights.semibold,
        lineHeight: designSystem.typography.lineHeights.normal,
        letterSpacing: "-0.015em",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      },
      h5: {
        fontSize: designSystem.typography.fontSizes.xl,
        fontWeight: designSystem.typography.fontWeights.semibold,
        lineHeight: designSystem.typography.lineHeights.normal,
        letterSpacing: "-0.01em",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      },
      h6: {
        fontSize: designSystem.typography.fontSizes.lg,
        fontWeight: designSystem.typography.fontWeights.semibold,
        lineHeight: designSystem.typography.lineHeights.normal,
        letterSpacing: "-0.005em",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      },
      subtitle1: {
        fontSize: designSystem.typography.fontSizes.lg,
        fontWeight: designSystem.typography.fontWeights.medium,
        lineHeight: designSystem.typography.lineHeights.normal,
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      },
      subtitle2: {
        fontSize: designSystem.typography.fontSizes.base,
        fontWeight: designSystem.typography.fontWeights.medium,
        lineHeight: designSystem.typography.lineHeights.normal,
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      },
      body1: {
        fontSize: designSystem.typography.fontSizes.base,
        fontWeight: designSystem.typography.fontWeights.normal,
        lineHeight: designSystem.typography.lineHeights.normal,
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      },
      body2: {
        fontSize: designSystem.typography.fontSizes.sm,
        fontWeight: designSystem.typography.fontWeights.normal,
        lineHeight: designSystem.typography.lineHeights.normal,
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      },
      caption: {
        fontSize: designSystem.typography.fontSizes.xs,
        fontWeight: designSystem.typography.fontWeights.normal,
        lineHeight: designSystem.typography.lineHeights.normal,
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      },
      button: {
        fontSize: designSystem.typography.fontSizes.sm,
        fontWeight: designSystem.typography.fontWeights.semibold,
        lineHeight: designSystem.typography.lineHeights.tight,
        letterSpacing: "0.025em",
        textTransform: "none",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      },
    },
    shape: {
      borderRadius: designSystem.borderRadius.md,
    },
    spacing: 8, // 8px base unit
    components: {
      // Global component overrides for consistency
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: designSystem.typography.fontSizes.base,
            lineHeight: designSystem.typography.lineHeights.normal,
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          },
        },
      },
    },
  });

  return baseTheme;
};

export default designSystem;
