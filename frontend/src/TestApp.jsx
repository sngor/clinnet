// Simple test app to verify React is working
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, Container, Typography, Button, Box } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
  },
});

function TestApp() {
  const [count, setCount] = React.useState(0);

  // Debug environment variables
  const envVars = {
    VITE_API_ENDPOINT: import.meta.env.VITE_API_ENDPOINT,
    VITE_ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT,
    VITE_USER_POOL_ID: import.meta.env.VITE_USER_POOL_ID,
    VITE_USER_POOL_CLIENT_ID: import.meta.env.VITE_USER_POOL_CLIENT_ID,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
  };

  console.log("Environment Variables:", envVars);

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box textAlign="center">
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              color="primary"
            >
              🏥 Clinnet EMR - Local Development
            </Typography>

            <Typography variant="h6" gutterBottom color="text.secondary">
              React App is Working! ✅
            </Typography>

            <Box sx={{ mt: 4, p: 3, bgcolor: "grey.100", borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                🔧 Environment Debug:
              </Typography>
              <Typography
                variant="body2"
                component="div"
                textAlign="left"
                sx={{ fontFamily: "monospace" }}
              >
                {Object.entries(envVars).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong> {value || "(empty)"}
                  </div>
                ))}
              </Typography>
            </Box>

            <Box sx={{ my: 4 }}>
              <Typography variant="body1" gutterBottom>
                Counter Test: {count}
              </Typography>
              <Button
                variant="contained"
                onClick={() => setCount((c) => c + 1)}
                sx={{ mr: 2 }}
              >
                Increment
              </Button>
              <Button variant="outlined" onClick={() => setCount(0)}>
                Reset
              </Button>
            </Box>

            <Box sx={{ mt: 4, p: 3, bgcolor: "grey.100", borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                🔧 Next Steps:
              </Typography>
              <Typography variant="body2" component="div" textAlign="left">
                <ul>
                  <li>✅ React is working</li>
                  <li>✅ Material-UI is working</li>
                  <li>✅ React Router is working</li>
                  <li>🔄 Setting up authentication...</li>
                </ul>
              </Typography>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Environment: {import.meta.env.MODE} | Port:{" "}
                {window.location.port}
              </Typography>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default TestApp;
