/**
 * Theme Toggle Component
 * Demonstrates the enhanced theme provider functionality
 */

import React from "react";
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";
import {
  LightMode,
  DarkMode,
  SettingsBrightness,
  Palette,
} from "@mui/icons-material";
import { useEnhancedTheme } from "../../app/providers/EnhancedThemeProvider.jsx";

const ThemeToggle = ({ variant = "icon", showLabel = false }) => {
  const {
    themeMode,
    effectiveMode,
    isDarkMode,
    systemPrefersDark,
    setTheme,
    toggleTheme,
    themePreferences,
    updateThemePreferences,
  } = useEnhancedTheme();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    if (variant === "menu") {
      setAnchorEl(event.currentTarget);
    } else {
      toggleTheme();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeSelect = (mode) => {
    setTheme(mode);
    handleClose();
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
        return <Palette />;
    }
  };

  const getThemeLabel = (mode) => {
    switch (mode) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "auto":
        return `Auto (${systemPrefersDark ? "Dark" : "Light"})`;
      default:
        return "Theme";
    }
  };

  const getTooltipText = () => {
    const currentLabel = getThemeLabel(themeMode);
    const nextMode =
      themeMode === "light" ? "dark" : themeMode === "dark" ? "auto" : "light";
    const nextLabel = getThemeLabel(nextMode);

    return variant === "menu"
      ? `Current: ${currentLabel}`
      : `Switch to ${nextLabel}`;
  };

  if (variant === "chip") {
    return (
      <Chip
        icon={getThemeIcon(themeMode)}
        label={showLabel ? getThemeLabel(themeMode) : undefined}
        onClick={handleClick}
        variant="outlined"
        size="small"
        sx={{
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: 1,
          },
        }}
      />
    );
  }

  return (
    <>
      <Tooltip title={getTooltipText()}>
        <IconButton
          onClick={handleClick}
          color="inherit"
          size="small"
          sx={{
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "rotate(180deg)",
            },
          }}
        >
          {getThemeIcon(themeMode)}
        </IconButton>
      </Tooltip>

      {variant === "menu" && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 180,
            },
          }}
        >
          <MenuItem
            onClick={() => handleThemeSelect("light")}
            selected={themeMode === "light"}
          >
            <ListItemIcon>
              <LightMode fontSize="small" />
            </ListItemIcon>
            <ListItemText>Light</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => handleThemeSelect("dark")}
            selected={themeMode === "dark"}
          >
            <ListItemIcon>
              <DarkMode fontSize="small" />
            </ListItemIcon>
            <ListItemText>Dark</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => handleThemeSelect("auto")}
            selected={themeMode === "auto"}
          >
            <ListItemIcon>
              <SettingsBrightness fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              Auto
              <Chip
                label={systemPrefersDark ? "Dark" : "Light"}
                size="small"
                variant="outlined"
                sx={{ ml: 1, height: 20, fontSize: "0.7rem" }}
              />
            </ListItemText>
          </MenuItem>
        </Menu>
      )}
    </>
  );
};

export default ThemeToggle;
