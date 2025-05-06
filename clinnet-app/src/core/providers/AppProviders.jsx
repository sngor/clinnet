// src/core/providers/AppProviders.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ThemeProvider from './ThemeProvider';
import AmplifyProvider from './AmplifyProvider';
import { AuthProvider } from '../../app/providers/AuthProvider';
import { DataProvider } from '../../app/providers/DataProvider';

/**
 * Root provider component that combines all application providers
 */
function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AmplifyProvider>
          <AuthProvider>
            <DataProvider>
              {children}
            </DataProvider>
          </AuthProvider>
        </AmplifyProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default AppProviders;