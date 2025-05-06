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
import config from './services/config';

// Configure Amplify
try {
  Amplify.configure({
    Auth: {
      region: config.COGNITO.REGION,
      userPoolId: config.COGNITO.USER_POOL_ID,
      userPoolWebClientId: config.COGNITO.APP_CLIENT_ID,
    },
    Storage: {
      AWSS3: {
        bucket: config.S3.BUCKET,
        region: config.S3.REGION,
      }
    }
  });
  
  console.log('Amplify configured successfully');
} catch (error) {
  console.error('Error configuring Amplify:', error);
}

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