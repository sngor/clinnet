// src/core/providers/ThemeProvider.jsx
import React from 'react';
import { ThemeProvider as MUIThemeProvider, CssBaseline } from '@mui/material';
import theme from '../theme/theme';

/**
 * Theme provider component
 * Provides the application theme to all components
 */
function ThemeProvider({ children }) {
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}

export default ThemeProvider;