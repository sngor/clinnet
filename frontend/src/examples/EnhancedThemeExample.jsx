/**
 * Enhanced Theme Provider Example
 * Demonstrates the complete theme system implementation
 */

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Chip,
  Stack,
  Paper,
} from "@mui/material";
import {
  EnhancedThemeProvider,
  useEnhancedTheme,
} from "../app/providers/EnhancedThemeProvider.jsx";
import ThemeToggle from "../components/ui/ThemeToggle.jsx";

// Demo component that uses the enhanced theme
const ThemeDemo = () => {
  const {
    themeMode,
    effectiveMode,
    isDarkMode,
    systemPrefersDark,
    colors,
    designTokens,
  } = useEnhancedTheme();

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>
      <Stack spacing={3}>
        {/* Header */}
        <Paper sx={{ p: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h4" component="h1">
              Enhanced Theme System Demo
            </Typography>
            <Stack direction="row" spacing={1}>
              <ThemeToggle variant="chip" showLabel />
              <ThemeToggle variant="menu" />
              <ThemeToggle variant="icon" />
            </Stack>
          </Stack>
        </Paper>

        {/* Theme Status */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Theme Status
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Chip
                label={`Mode: ${themeMode}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`Active: ${effectiveMode}`}
                color={isDarkMode ? "secondary" : "primary"}
              />
              <Chip
                label={`System: ${systemPrefersDark ? "Dark" : "Light"}`}
                variant="outlined"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Color Palette Demo */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Color Palette
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  backgroundColor: colors.primary.main,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: colors.primary.contrastText }}
                >
                  Primary
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  backgroundColor: colors.secondary.main,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: colors.secondary.contrastText }}
                >
                  Secondary
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  backgroundColor: colors.success.main,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: colors.success.contrastText }}
                >
                  Success
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  backgroundColor: colors.error.main,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: colors.error.contrastText }}
                >
                  Error
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Interactive Components */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Interactive Components
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <Button variant="contained">Contained Button</Button>
                <Button variant="outlined">Outlined Button</Button>
                <Button variant="text">Text Button</Button>
              </Stack>

              <TextField
                label="Sample Input"
                placeholder="Type something..."
                variant="outlined"
                fullWidth
              />

              <Alert severity="info">
                This is an info alert with smooth theme transitions!
              </Alert>

              <Alert severity="success">
                Theme changes are persisted and synchronized across tabs.
              </Alert>
            </Stack>
          </CardContent>
        </Card>

        {/* Design Tokens Info */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Design System Info
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This theme system includes:
            </Typography>
            <ul>
              <li>Complete WCAG 2.1 AA compliant color palettes</li>
              <li>Smooth transitions without visual glitches</li>
              <li>System preference detection and auto-switching</li>
              <li>Cross-tab synchronization via localStorage</li>
              <li>Comprehensive design token system</li>
              <li>Loading states to prevent flash of unstyled content</li>
            </ul>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

// Main example component
const EnhancedThemeExample = () => {
  return (
    <EnhancedThemeProvider>
      <ThemeDemo />
    </EnhancedThemeProvider>
  );
};

export default EnhancedThemeExample;
