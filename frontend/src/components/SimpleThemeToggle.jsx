import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Stack,
  Divider,
  Paper,
} from "@mui/material";
import {
  LightMode,
  DarkMode,
  Palette,
  SettingsBrightness,
  Check,
} from "@mui/icons-material";
import { useTheme } from "../context/ThemeContext";

const SimpleThemeToggle = () => {
  const { isDarkMode, themeMode, systemPrefersDark, setTheme } = useTheme();

  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };

  const getThemeDescription = (mode) => {
    switch (mode) {
      case "light":
        return "Always use light theme";
      case "dark":
        return "Always use dark theme";
      case "auto":
        return `Follow system preference (currently ${
          systemPrefersDark ? "dark" : "light"
        })`;
      default:
        return "";
    }
  };

  const getThemeIcon = (mode) => {
    switch (mode) {
      case "light":
        return <LightMode />;
      case "dark":
        return <DarkMode />;
      case "auto":
        return <SettingsBrightness />;
      default:
        return <LightMode />;
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          fontWeight: 700,
          mb: 3,
        }}
      >
        <Palette sx={{ fontSize: 28 }} />
        Theme Settings
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Choose Your Theme Preference
          </Typography>

          <FormControl component="fieldset" sx={{ width: "100%" }}>
            <RadioGroup
              value={themeMode}
              onChange={handleThemeChange}
              sx={{ gap: 2 }}
            >
              {/* Light Mode Option */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: "2px solid",
                  borderColor:
                    themeMode === "light" ? "primary.main" : "divider",
                  borderRadius: 3,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    transform: "translateY(-2px)",
                  },
                }}
                onClick={() => setTheme("light")}
              >
                <FormControlLabel
                  value="light"
                  control={<Radio sx={{ display: "none" }} />}
                  label={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: "primary.50",
                          color: "primary.600",
                        }}
                      >
                        <LightMode />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Light Mode
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getThemeDescription("light")}
                        </Typography>
                      </Box>
                      {themeMode === "light" && <Check color="primary" />}
                    </Box>
                  }
                  sx={{ m: 0, width: "100%" }}
                />
              </Paper>

              {/* Dark Mode Option */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: "2px solid",
                  borderColor:
                    themeMode === "dark" ? "primary.main" : "divider",
                  borderRadius: 3,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    transform: "translateY(-2px)",
                  },
                }}
                onClick={() => setTheme("dark")}
              >
                <FormControlLabel
                  value="dark"
                  control={<Radio sx={{ display: "none" }} />}
                  label={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: "primary.50",
                          color: "primary.600",
                        }}
                      >
                        <DarkMode />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Dark Mode
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getThemeDescription("dark")}
                        </Typography>
                      </Box>
                      {themeMode === "dark" && <Check color="primary" />}
                    </Box>
                  }
                  sx={{ m: 0, width: "100%" }}
                />
              </Paper>

              {/* Auto Mode Option */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: "2px solid",
                  borderColor:
                    themeMode === "auto" ? "primary.main" : "divider",
                  borderRadius: 3,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    transform: "translateY(-2px)",
                  },
                }}
                onClick={() => setTheme("auto")}
              >
                <FormControlLabel
                  value="auto"
                  control={<Radio sx={{ display: "none" }} />}
                  label={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: "primary.50",
                          color: "primary.600",
                        }}
                      >
                        <SettingsBrightness />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Auto (System)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getThemeDescription("auto")}
                        </Typography>
                      </Box>
                      {themeMode === "auto" && <Check color="primary" />}
                    </Box>
                  }
                  sx={{ m: 0, width: "100%" }}
                />
              </Paper>
            </RadioGroup>
          </FormControl>

          <Divider sx={{ my: 3 }} />

          {/* Current Status */}
          <Box>
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Current Status
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                icon={isDarkMode ? <DarkMode /> : <LightMode />}
                label={`Currently ${isDarkMode ? "Dark" : "Light"} Mode`}
                color="primary"
                variant="filled"
                sx={{ fontWeight: 600 }}
              />
              {themeMode === "auto" && (
                <Chip
                  icon={<SettingsBrightness />}
                  label={`System: ${systemPrefersDark ? "Dark" : "Light"}`}
                  color="secondary"
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              )}
            </Stack>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 3, textAlign: "center" }}
          >
            Your theme preference is automatically saved and will be remembered
            across all devices
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SimpleThemeToggle;
