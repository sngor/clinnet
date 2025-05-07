// src/components/Layout/AppLayout.jsx
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import { useAuth } from "../../app/providers/AuthProvider";
import AdminSidebar from "./AdminSidebar";
import DoctorSidebar from "./DoctorSidebar";
import FrontdeskSidebar from "./FrontdeskSidebar";

const drawerWidth = 240;

function AppLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handler for menu items that navigate
  const handleNavigate = (path) => {
    navigate(path);
    handleMenuClose();
    // Close the drawer on mobile when navigating
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Render sidebar based on user role
  const renderSidebar = () => {
    switch (user?.role) {
      case "admin":
        return <AdminSidebar />;
      case "doctor":
        return <DoctorSidebar />;
      case "frontdesk":
        return <FrontdeskSidebar />;
      default:
        return null;
    }
  };

  const drawer = React.useMemo(
    () => (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Toolbar
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: { xs: 2, sm: 3 },
            background: "white",
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              width: { xs: 50, sm: 60 },
              height: { xs: 50, sm: 60 },
              bgcolor: "primary.main",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1.5,
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography
              variant={isMobile ? "h5" : "h4"}
              color="white"
              fontWeight="bold"
              align="center"
            >
              C
            </Typography>
          </Box>
          {/* App Name */}
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            color="primary.main"
            fontWeight="bold"
            align="center"
            sx={{ mb: 0.5 }}
          >
            CLINNET
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center">
            Healthcare Management
          </Typography>
        </Toolbar>
        <Divider />
        <Box
          sx={{
            width: "100%",
            flexGrow: 1,
            overflow: "auto",
          }}
        >
          {renderSidebar()}
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Clinnet EMR by Seng
          </Typography>
        </Box>
      </Box>
    ),
    [user?.role, isMobile]
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: "56px", sm: "64px" } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Centered Portal Title */}
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              position: "absolute",
              left: 0,
              right: 0,
              pointerEvents: "none", // Ensures clicks pass through to elements below
            }}
          >
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              noWrap
              component="div"
              sx={{
                fontWeight: 500,
                letterSpacing: 1,
              }}
            >
              {user?.role?.toUpperCase()} PORTAL
            </Typography>
          </Box>

          {/* Profile Icon and Menu */}
          <Box
            sx={{
              flexShrink: 0,
              ml: "auto", // Push to the right edge
            }}
          >
            <IconButton
              onClick={handleMenuOpen}
              size={isMobile ? "medium" : "large"}
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              color="inherit"
            >
              {user?.photoURL ? (
                <Avatar
                  alt={user.username}
                  src={user.photoURL}
                  sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: { xs: 28, sm: 32 },
                    height: { xs: 28, sm: 32 },
                    bgcolor: "secondary.main",
                  }}
                >
                  {user?.username ? (
                    user.username[0].toUpperCase()
                  ) : (
                    <AccountCircleIcon
                      fontSize={isMobile ? "small" : "medium"}
                    />
                  )}
                </Avatar>
              )}
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              open={open}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  minWidth: 180,
                  "& .MuiMenuItem-root": {
                    px: 2,
                    py: 1,
                    "& .MuiListItemIcon-root": {
                      minWidth: 36,
                      color: "text.secondary",
                    },
                  },
                },
              }}
            >
              <MenuItem onClick={() => handleNavigate("/account-settings")}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Settings"
                  primaryTypographyProps={{
                    variant: "body2",
                    sx: { fontWeight: 500 },
                  }}
                />
              </MenuItem>
              <Divider />
              <MenuItem onClick={logout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{
                    variant: "body2",
                    sx: { fontWeight: 500 },
                  }}
                />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation drawer"
      >
        {/* Temporary drawer for mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              boxShadow: "4px 0 10px rgba(0, 0, 0, 0.12)",
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Permanent drawer for desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "none",
              boxShadow: "4px 0 10px rgba(0, 0, 0, 0.12)",
              zIndex: (theme) => theme.zIndex.drawer,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: "100%",
        }}
      >
        <Toolbar sx={{ minHeight: { xs: "56px", sm: "64px" } }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            height: {
              xs: "calc(100vh - 112px)",
              sm: "calc(100vh - 128px)",
            },
            width: "100%",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              overflow: "auto",
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default AppLayout;
