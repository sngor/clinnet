// src/app/providers/ErrorBoundary.jsx
import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // You could also log to a monitoring service like Sentry here
  }

  handleReset = () => {
    // Clear the error state and try again
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  handleReload = () => {
    // Reload the page
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
            bgcolor: 'background.default'
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              width: '100%',
              textAlign: 'center',
              borderRadius: 2
            }}
          >
            <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            
            <Typography variant="h5" color="error" gutterBottom>
              Something went wrong
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              The application encountered an unexpected error. Please try again or contact support if the problem persists.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={this.handleReset}
                sx={{ borderRadius: 1.5 }}
              >
                Try Again
              </Button>
              
              <Button 
                variant="contained" 
                onClick={this.handleReload}
                sx={{ borderRadius: 1.5 }}
              >
                Reload Page
              </Button>
            </Box>
            
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <Box sx={{ mt: 4, textAlign: 'left' }}>
                <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                  Error Details (Development Only):
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'grey.100',
                    overflowX: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }}
                >
                  <pre>{this.state.error.toString()}</pre>
                  {this.state.errorInfo && (
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  )}
                </Paper>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;