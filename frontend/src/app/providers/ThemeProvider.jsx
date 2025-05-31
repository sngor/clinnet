// src/app/providers/ThemeProvider.jsx
import React from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider, CssBaseline, responsiveFontSizes, useMediaQuery } from '@mui/material';

// Define a basic theme (customize colors, typography, etc.)
const lightThemeOptions = {
  palette: {
    primary: {
      main: '#1976d2', // Primary blue color
      light: '#4791db',
      dark: '#115293',
      contrastText: '#fff',
    },
    secondary: {
      main: '#dc004e', // Secondary pink color
      light: '#e33371',
      dark: '#9a0036',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f7fa', // Very light grey background for the body
      paper: '#ffffff',
    },
    text: {
      primary: '#333333', // Darker text for better readability
      secondary: '#666666', // Medium gray for secondary text
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    // Improved font sizes for better readability
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      lineHeight: 1.2,
      marginBottom: '0.5em',
      textAlign: 'left',
      '@media (min-width:600px)': {
        fontSize: '3.5rem',
      },
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      lineHeight: 1.3,
      marginBottom: '0.5em',
      textAlign: 'left',
      '@media (min-width:600px)': {
        fontSize: '3rem',
      },
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.3,
      marginBottom: '0.5em',
      textAlign: 'left',
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
      marginBottom: '0.5em',
      textAlign: 'left',
      '@media (min-width:600px)': {
        fontSize: '2rem',
      },
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
      marginBottom: '0.5em',
      textAlign: 'left',
      '@media (min-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 500,
      lineHeight: 1.4,
      marginBottom: '0.5em',
      textAlign: 'left',
      '@media (min-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      marginBottom: '1em',
      textAlign: 'left',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      marginBottom: '0.75em',
      textAlign: 'left',
    },
    subtitle1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      fontWeight: 400,
      marginBottom: '0.5em',
      textAlign: 'left',
    },
    subtitle2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 500,
      marginBottom: '0.5em',
      textAlign: 'left',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      marginBottom: '0.5em',
      textAlign: 'left',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '0.5em',
      textAlign: 'left',
    },
  },
  components: {
    // Make buttons more touch-friendly on mobile
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // More natural text case
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 16px',
          '@media (max-width:600px)': {
            padding: '6px 12px',
            fontSize: '0.9rem',
          },
        },
        containedPrimary: {
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.25)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.35)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
        sizeSmall: {
          padding: '4px 10px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '10px 22px',
          fontSize: '1rem',
        },
      },
    },
    // Adjust form inputs for better mobile experience
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: '16px',
          '& .MuiInputLabel-root': {
            fontSize: '0.95rem',
          },
          '& .MuiInputBase-input': {
            fontSize: '1rem',
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1976d2',
            },
          },
        },
      },
    },
    // Make cards and paper components more mobile-friendly
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          '@media (max-width:600px)': {
            padding: '16px',
          },
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        },
        elevation2: {
          boxShadow: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
        },
        elevation3: {
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.05)',
        },
        elevation4: {
          boxShadow: '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05)',
        },
        rounded: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          borderRadius: 8,
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px',
          '&:last-child': {
            paddingBottom: '16px',
          },
          '@media (min-width:600px)': {
            padding: '24px',
            '&:last-child': {
              paddingBottom: '24px',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 16,
        },
        sizeSmall: {
          fontSize: '0.75rem',
          height: 24,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.95rem',
          '@media (min-width:600px)': {
            fontSize: '1rem',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardError: {
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          color: '#d32f2f',
        },
        standardSuccess: {
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          color: '#388e3c',
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          color: '#f57c00',
        },
        standardInfo: {
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          color: '#1976d2',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          margin: '16px 0',
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          color: 'rgba(0, 0, 0, 0.54)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px',
          '@media (max-width:600px)': {
            padding: '8px',
          },
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          fontWeight: 500,
          textAlign: 'left',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '8px 24px 16px',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          textAlign: 'left',
        },
      },
    },
  },
  spacing: 8, // Base spacing unit
  shape: {
    borderRadius: 8,
  },
};

const darkThemeOptions = {
  palette: {
    mode: 'dark',
    primary: lightThemeOptions.palette.primary,
    secondary: lightThemeOptions.palette.secondary,
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0b0b0',
    },
    error: lightThemeOptions.palette.error,
    warning: lightThemeOptions.palette.warning,
    info: lightThemeOptions.palette.info,
    success: lightThemeOptions.palette.success,
  },
  typography: lightThemeOptions.typography,
  components: lightThemeOptions.components,
  spacing: lightThemeOptions.spacing,
  shape: lightThemeOptions.shape,
};

export const ThemeProvider = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const themeOptions = React.useMemo(
    () => (prefersDarkMode ? darkThemeOptions : lightThemeOptions),
    [prefersDarkMode]
  );

  let theme = createTheme(themeOptions);
  theme = responsiveFontSizes(theme);

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline /> {/* Ensures baseline styles */}
      {children}
    </MUIThemeProvider>
  );
};