// src/app/providers/ThemeProvider.jsx
import React from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider, CssBaseline, responsiveFontSizes } from '@mui/material';

// Define a basic theme (customize colors, typography, etc.)
let theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Example primary color
    },
    secondary: {
      main: '#dc004e', // Example secondary color
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
    // Responsive font sizes
    h1: {
      fontSize: '2.5rem',
      '@media (min-width:600px)': {
        fontSize: '3.5rem',
      },
    },
    h2: {
      fontSize: '2rem',
      '@media (min-width:600px)': {
        fontSize: '3rem',
      },
    },
    h3: {
      fontSize: '1.75rem',
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
    },
  },
  components: {
    // Make buttons more touch-friendly on mobile
    MuiButton: {
      styleOverrides: {
        root: {
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
          '@media (max-width:600px)': {
            marginBottom: '16px',
          },
        },
      },
    },
    // Make cards and paper components more mobile-friendly
    MuiPaper: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '16px',
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