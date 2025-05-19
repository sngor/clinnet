// src/components/layout/TopBar.jsx
import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Box,
  Avatar,
} from "@mui/material";
import { useAuth } from "../../hooks/useAuth";

function TopBar() {
  const { user, logout } = useAuth();

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user) return "U";
    return (
      `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}` ||
      user.username?.charAt(0) ||
      "U"
    );
  };

  return (
    <AppBar
      position="fixed"
      color="primary"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        {/* ...existing code... */}

        {/* User Menu */}
        <Box sx={{ flexGrow: 0 }}>
          <Tooltip title="Open user menu">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              {user?.profileImage ? (
                <Avatar alt={user.firstName} src={user.profileImage} />
              ) : (
                <Avatar sx={{ bgcolor: "secondary.main" }}>
                  {getInitials()}
                </Avatar>
              )}
            </IconButton>
          </Tooltip>

          {/* ...existing menu code... */}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
