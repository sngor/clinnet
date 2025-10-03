import React, { createContext, useContext, useState, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }
  return context;
};

// Enhanced design tokens
const designTokens = {
  colors: {
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
    },
    gray: {
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
  },
  shadows: {
    xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 48,
    "3xl": 64,
  },
  borderRadius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    "2xl": 24,
    full: 9999,
  },
};

// Light theme configuration
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: designTokens.colors.primary[600],
      light: designTokens.colors.primary[400],
      dark: designTokens.colors.primary[700],
      contrastText: "#ffffff",
    },
    secondary: {
      main: designTokens.colors.secondary[600],
      light: designTokens.colors.secondary[400],
      dark: designTokens.colors.secondary[700],
      contrastText: "#ffffff",
    },
    success: {
      main: designTokens.colors.success[600],
      light: designTokens.colors.success[400],
      dark: designTokens.colors.success[700],
    },
    warning: {
      main: designTokens.colors.warning[500],
      light: designTokens.colors.warning[400],
      dark: designTokens.colors.warning[600],
    },
    error: {
      main: designTokens.colors.error[500],
      light: designTokens.colors.error[400],
      dark: designTokens.colors.error[600],
    },
    background: {
      default: designTokens.colors.gray[50],
      paper: "#ffffff",
    },
    text: {
      primary: designTokens.colors.gray[900],
      secondary: designTokens.colors.gray[600],
    },
    divider: designTokens.colors.gray[200],
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
    h1: {
      fontWeight: 800,
      fontSize: "2.5rem",
      lineHeight: 1.2,
      letterSpacing: "-0.025em",
    },
    h2: {
      fontWeight: 700,
      fontSize: "2rem",
      lineHeight: 1.3,
      letterSpacing: "-0.025em",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: 1.4,
      letterSpacing: "-0.02em",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.25rem",
      lineHeight: 1.4,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.125rem",
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: "0.025em",
    },
  },
  shape: {
    borderRadius: designTokens.borderRadius.lg,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: designTokens.colors.gray[50],
          fontFeatureSettings: '"cv03", "cv04", "cv11"',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.full,
          textTransform: "none",
          fontWeight: 600,
          padding: "12px 24px",
          boxShadow: "none",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: designTokens.shadows.md,
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${designTokens.colors.primary[600]} 0%, ${designTokens.colors.primary[700]} 100%)`,
          "&:hover": {
            background: `linear-gradient(135deg, ${designTokens.colors.primary[700]} 0%, ${designTokens.colors.primary[800]} 100%)`,
          },
        },
        outlined: {
          borderWidth: "2px",
          "&:hover": {
            borderWidth: "2px",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.xl,
          boxShadow: designTokens.shadows.sm,
          border: `1px solid ${designTokens.colors.gray[200]}`,
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: designTokens.shadows.md,
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.xl,
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: designTokens.shadows.sm,
        },
        elevation2: {
          boxShadow: designTokens.shadows.md,
        },
        elevation3: {
          boxShadow: designTokens.shadows.lg,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${designTokens.colors.gray[200]}`,
          boxShadow: "none",
          color: designTokens.colors.gray[900],
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#ffffff",
          borderRight: `1px solid ${designTokens.colors.gray[200]}`,
          boxShadow: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.full,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: designTokens.borderRadius.lg,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: designTokens.colors.primary[400],
              },
            },
            "&.Mui-focused": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: designTokens.colors.primary[600],
                borderWidth: "2px",
              },
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.lg,
          border: "1px solid",
        },
        standardSuccess: {
          backgroundColor: designTokens.colors.success[50],
          borderColor: designTokens.colors.success[200],
          color: designTokens.colors.success[800],
        },
        standardError: {
          backgroundColor: designTokens.colors.error[50],
          borderColor: designTokens.colors.error[200],
          color: designTokens.colors.error[800],
        },
        standardWarning: {
          backgroundColor: designTokens.colors.warning[50],
          borderColor: designTokens.colors.warning[200],
          color: designTokens.colors.warning[800],
        },
        standardInfo: {
          backgroundColor: designTokens.colors.primary[50],
          borderColor: designTokens.colors.primary[200],
          color: designTokens.colors.primary[800],
        },
      },
    },
  },
});

// Dark theme configuration
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: designTokens.colors.primary[400],
      light: designTokens.colors.primary[300],
      dark: designTokens.colors.primary[600],
      contrastText: "#ffffff",
    },
    secondary: {
      main: designTokens.colors.secondary[400],
      light: designTokens.colors.secondary[300],
      dark: designTokens.colors.secondary[600],
      contrastText: "#ffffff",
    },
    success: {
      main: designTokens.colors.success[400],
      light: designTokens.colors.success[300],
      dark: designTokens.colors.success[600],
    },
    warning: {
      main: designTokens.colors.warning[400],
      light: designTokens.colors.warning[300],
      dark: designTokens.colors.warning[600],
    },
    error: {
      main: designTokens.colors.error[400],
      light: designTokens.colors.error[300],
      dark: designTokens.colors.error[600],
    },
    background: {
      default: "#0f172a",
      paper: "#1e293b",
    },
    text: {
      primary: "#f8fafc",
      secondary: "#94a3b8",
    },
    divider: "#334155",
  },
  typography: lightTheme.typography,
  shape: lightTheme.shape,
  components: {
    ...lightTheme.components,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#0f172a",
          fontFeatureSettings: '"cv03", "cv04", "cv11"',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.xl,
          backgroundColor: "#1e293b",
          border: "1px solid #334155",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e293b",
          borderRadius: designTokens.borderRadius.xl,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(30, 41, 59, 0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #334155",
          boxShadow: "none",
          color: "#f8fafc",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#1e293b",
          borderRight: "1px solid #334155",
          boxShadow: "none",
        },
      },
    },
  },
});

export const ThemeContextProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = localStorage.getItem("clinnet-theme-mode");
    if (savedTheme && ["light", "dark", "auto"].includes(savedTheme)) {
      return savedTheme;
    }
    return "auto"; // Default to auto mode
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Calculate actual dark mode based on theme mode and system preference
  const isDarkMode =
    themeMode === "dark" || (themeMode === "auto" && systemPrefersDark);

  const setTheme = (mode) => {
    setThemeMode(mode);
    localStorage.setItem("clinnet-theme-mode", mode);
  };

  const toggleTheme = () => {
    const nextMode =
      themeMode === "light" ? "dark" : themeMode === "dark" ? "auto" : "light";
    setTheme(nextMode);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Update CSS custom properties when theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.style.setProperty("--glass-bg", "rgba(30, 41, 59, 0.7)");
      root.style.setProperty("--glass-border", "rgba(51, 65, 85, 0.3)");
      root.style.setProperty("--header-bg", "rgba(30, 41, 59, 0.85)");
    } else {
      root.style.setProperty("--glass-bg", "rgba(255, 255, 255, 0.7)");
      root.style.setProperty("--glass-border", "rgba(255, 255, 255, 0.2)");
      root.style.setProperty("--header-bg", "rgba(255, 255, 255, 0.85)");
    }
  }, [isDarkMode]);

  // Update body attributes for theme mode tracking
  useEffect(() => {
    const body = document.body;
    body.setAttribute("data-theme-mode", themeMode);
    body.setAttribute("data-theme-active", isDarkMode ? "dark" : "light");
  }, [themeMode, isDarkMode]);

  const value = {
    isDarkMode,
    themeMode,
    systemPrefersDark,
    setTheme,
    toggleTheme,
    theme,
    designTokens,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
