// src/components/DebugPanel.jsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  testEnvVars,
  testAuthToken,
  testApiConnectivity,
} from "../utils/debug-helper";
import { useAuth } from "../app/providers/AuthProvider";

function DebugPanel() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);

  const runTests = async () => {
    setResults([]);

    // Test environment variables
    const envVarsResult = testEnvVars();
    addResult("Environment Variables", envVarsResult ? "PASS" : "FAIL");

    // Test auth token
    const authTokenResult = await testAuthToken();
    addResult("Authentication Token", authTokenResult ? "PASS" : "FAIL");

    // Test API connectivity
    const apiResult = await testApiConnectivity();
    addResult("API Connectivity", apiResult ? "PASS" : "FAIL");
  };

  const addResult = (name, status) => {
    setResults((prev) => [...prev, { name, status, timestamp: new Date() }]);
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Debug Panel
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Authentication Status</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Authenticated"
                secondary={user ? "Yes" : "No"}
              />
            </ListItem>
            {user && (
              <>
                <ListItem>
                  <ListItemText primary="Username" secondary={user.username} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Role" secondary={user.role} />
                </ListItem>
              </>
            )}
          </List>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ mt: 2, mb: 2 }}>
        <Button variant="contained" color="primary" onClick={runTests}>
          Run Connectivity Tests
        </Button>
      </Box>

      {results.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Test Results:
          </Typography>
          <List dense>
            {results.map((result, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={result.name}
                    secondary={`Status: ${
                      result.status
                    } (${result.timestamp.toLocaleTimeString()})`}
                    primaryTypographyProps={{
                      color:
                        result.status === "PASS"
                          ? "success.main"
                          : "error.main",
                    }}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );
}

export default DebugPanel;
