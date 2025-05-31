// src/app/providers/AppProviders.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles'; // Added responsiveFontSizes
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './AuthProvider';
import { DataProvider } from './DataProvider';
import { FontSizeProvider, useFontSize } from '../../context/FontSizeContext.jsx'; // Import FontSize context items
import baseThemeConfig from '../../app/theme.js'; // Import the main theme configuration

// Helper component to dynamically create and provide the theme
const DynamicThemeProvider = ({ children }) => {
  const { fontSize, fontSizes } = useFontSize(); // Get current font size and options

  // Create a new theme that merges the base theme with the dynamic font size
  // We need to ensure baseThemeConfig is treated as a config object for createTheme
  let dynamicTheme = createTheme({
    ...baseThemeConfig, // Spread the imported base theme configuration
    typography: {
      ...baseThemeConfig.typography,
      // Set the base html font size, which scales all rem units
      // Or, more directly, adjust body1 and other specific elements if preferred
      htmlFontSize: parseFloat(fontSizes[fontSize]) * 16, // Assuming 1rem = 16px for htmlFontSize scaling
      // Example: Adjust body1 directly if htmlFontSize is not desired
      // body1: {
      //   ...baseThemeConfig.typography.body1,
      //   fontSize: fontSizes[fontSize],
      // },
    },
  });

  // Optionally, make fonts responsive
  dynamicTheme = responsiveFontSizes(dynamicTheme);

  return <ThemeProvider theme={dynamicTheme}>{children}</ThemeProvider>;
};

function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <AuthProvider> {/* AuthProvider can be outside FontSizeProvider if it doesn't need font context */}
        <FontSizeProvider> {/* FontSizeProvider wraps components that need font context */}
          <DynamicThemeProvider>
            <CssBaseline />
            <DataProvider>{children}</DataProvider>
          </DynamicThemeProvider>
        </FontSizeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppProviders;
