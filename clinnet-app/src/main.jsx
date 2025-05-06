// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Amplify } from 'aws-amplify';

import App from './App';
import theme from './app/theme';
import ErrorBoundary from './app/providers/ErrorBoundary';
import { AuthProvider } from './app/providers/AuthProvider';
import { DataProvider } from './app/providers/DataProvider';

// Configure Amplify
Amplify.configure({
  Auth: {
    region: import.meta.env.VITE_COGNITO_REGION || process.env.REACT_APP_COGNITO_REGION,
    userPoolId: import.meta.env.VITE_USER_POOL_ID || process.env.REACT_APP_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || process.env.REACT_APP_USER_POOL_CLIENT_ID,
  },
  Storage: {
    AWSS3: {
      bucket: import.meta.env.VITE_S3_BUCKET || process.env.REACT_APP_S3_BUCKET,
      region: import.meta.env.VITE_S3_REGION || process.env.REACT_APP_S3_REGION,
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <DataProvider>
              <App />
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);