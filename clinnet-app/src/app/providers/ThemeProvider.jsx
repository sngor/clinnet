// src/app/providers/ThemeProvider.jsx
import React from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider, CssBaseline, responsiveFontSizes } from '@mui/material';

// Define a basic theme (customize colors, typography, etc.)
let theme = createTheme({
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
      '@media (min-width:600px)': {
        fontSize: '3.5rem',
      },
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      '@media (min-width:600px)': {
        fontSize: '3rem',
      },
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
      '@media (min-width:600px)': {
        fontSize: '2rem',
      },
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
      '@media (min-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 500,
      lineHeight: 1.4,
      '@media (min-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    subtitle1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      fontWeight: 400,
    },
    subtitle2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 400,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    // Make buttons more touch-friendly on mobile
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // More natural text case
          fontWeight: 500,
          borderRadius: 4,
          '@media (max-width:600px)': {
            padding: '8px 16px',
            fontSize: '0.9rem',
          },
        },
        containedPrimary: {
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.25)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.35)',
          },
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
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
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
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
        sizeSmall: {
          fontSize: '0.75rem',
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
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.05),0px 1px 1px 0px rgba(0,0,0,0.03),0px 1px 3px 0px rgba(0,0,0,0.05)',
    '0px 3px 3px -2px rgba(0,0,0,0.06),0px 3px 4px 0px rgba(0,0,0,0.04),0px 1px 8px 0px rgba(0,0,0,0.06)',
    '0px 3px 5px -1px rgba(0,0,0,0.06),0px 5px 8px 0px rgba(0,0,0,0.05),0px 1px 14px 0px rgba(0,0,0,0.06)',
    '0px 2px 4px -1px rgba(0,0,0,0.06),0px 4px 5px 0px rgba(0,0,0,0.05),0px 1px 10px 0px rgba(0,0,0,0.06)',
    '0px 3px 5px -1px rgba(0,0,0,0.07),0px 5px 8px 0px rgba(0,0,0,0.05),0px 1px 14px 0px rgba(0,0,0,0.07)',
    '0px 3px 5px -1px rgba(0,0,0,0.07),0px 6px 10px 0px rgba(0,0,0,0.06),0px 1px 18px 0px rgba(0,0,0,0.07)',
    '0px 4px 5px -2px rgba(0,0,0,0.07),0px 7px 10px 1px rgba(0,0,0,0.06),0px 2px 16px 1px rgba(0,0,0,0.07)',
    '0px 5px 5px -3px rgba(0,0,0,0.08),0px 8px 10px 1px rgba(0,0,0,0.06),0px 3px 14px 2px rgba(0,0,0,0.08)',
    '0px 5px 6px -3px rgba(0,0,0,0.08),0px 9px 12px 1px rgba(0,0,0,0.06),0px 3px 16px 2px rgba(0,0,0,0.08)',
    '0px 6px 6px -3px rgba(0,0,0,0.08),0px 10px 14px 1px rgba(0,0,0,0.06),0px 4px 18px 3px rgba(0,0,0,0.08)',
    '0px 6px 7px -4px rgba(0,0,0,0.08),0px 11px 15px 1px rgba(0,0,0,0.07),0px 4px 20px 3px rgba(0,0,0,0.08)',
    '0px 7px 8px -4px rgba(0,0,0,0.08),0px 12px 17px 2px rgba(0,0,0,0.07),0px 5px 22px 4px rgba(0,0,0,0.08)',
    '0px 7px 8px -4px rgba(0,0,0,0.09),0px 13px 19px 2px rgba(0,0,0,0.07),0px 5px 24px 4px rgba(0,0,0,0.09)',
    '0px 7px 9px -4px rgba(0,0,0,0.09),0px 14px 21px 2px rgba(0,0,0,0.07),0px 5px 26px 4px rgba(0,0,0,0.09)',
    '0px 8px 9px -5px rgba(0,0,0,0.09),0px 15px 22px 2px rgba(0,0,0,0.07),0px 6px 28px 5px rgba(0,0,0,0.09)',
    '0px 8px 10px -5px rgba(0,0,0,0.09),0px 16px 24px 2px rgba(0,0,0,0.07),0px 6px 30px 5px rgba(0,0,0,0.09)',
    '0px 8px 11px -5px rgba(0,0,0,0.09),0px 17px 26px 2px rgba(0,0,0,0.07),0px 6px 32px 5px rgba(0,0,0,0.09)',
    '0px 9px 11px -5px rgba(0,0,0,0.10),0px 18px 28px 2px rgba(0,0,0,0.08),0px 7px 34px 6px rgba(0,0,0,0.10)',
    '0px 9px 12px -6px rgba(0,0,0,0.10),0px 19px 29px 2px rgba(0,0,0,0.08),0px 7px 36px 6px rgba(0,0,0,0.10)',
    '0px 10px 13px -6px rgba(0,0,0,0.10),0px 20px 31px 3px rgba(0,0,0,0.08),0px 8px 38px 7px rgba(0,0,0,0.10)',
    '0px 10px 13px -6px rgba(0,0,0,0.11),0px 21px 33px 3px rgba(0,0,0,0.08),0px 8px 40px 7px rgba(0,0,0,0.11)',
    '0px 10px 14px -6px rgba(0,0,0,0.11),0px 22px 35px 3px rgba(0,0,0,0.08),0px 8px 42px 7px rgba(0,0,0,0.11)',
    '0px 11px 14px -7px rgba(0,0,0,0.11),0px 23px 36px 3px rgba(0,0,0,0.08),0px 9px 44px 8px rgba(0,0,0,0.11)',
    '0px 11px 15px -7px rgba(0,0,0,0.11),0px 24px 38px 3px rgba(0,0,0,0.08),0px 9px 46px 8px rgba(0,0,0,0.11)',
  ],
});

// Apply responsive font sizes to all typography variants
theme = responsiveFontSizes(theme);

export const ThemeProvider = ({ children }) => {
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline /> {/* Ensures baseline styles */}
      {children}
    </MUIThemeProvider>
  );
};