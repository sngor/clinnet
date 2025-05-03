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
      default: '#f5f5f5', // Very light grey background for the body
      paper: '#ffffff',
    },
    text: {
      primary: '#333333', // Darker text for better readability
      secondary: '#666666', // Medium gray for secondary text
    },
    // Add more customizations as needed
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