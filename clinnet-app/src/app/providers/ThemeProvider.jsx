// src/app/providers/ThemeProvider.jsx
import React from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider, CssBaseline } from '@mui/material';

// Define a basic theme (customize colors, typography, etc.)
const theme = createTheme({
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
    // Define font families, sizes, etc.
  },
});

export const ThemeProvider = ({ children }) => {
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline /> {/* Ensures baseline styles */}
      {children}
    </MUIThemeProvider>
  );
};