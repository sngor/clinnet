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
  Stack,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useAuth } from "../../app/providers/AuthProvider";
import AdminSidebar from "./AdminSidebar";
import DoctorSidebar from "./DoctorSidebar";
import FrontdeskSidebar from "./FrontdeskSidebar";

const drawerWidth = 240;
const collapsedDrawerWidth = 72;

function AppLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerCollapse = () => {
    setDrawerCollapsed(!drawerCollapsed);
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

  // Get user's display name
  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.firstName) {
      return user.firstName;
    } else if (user?.email) {
      return user.email.split("@")[0];
    } else {
      return user?.username || "User";
    }
  };

  // Get user's avatar letter
  const getAvatarLetter = () => {
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    } else if (user?.username) {
      return user.username[0].toUpperCase();
    } else {
      return "U";
    }
  };

  // Render sidebar based on user role
  const renderSidebar = () => {
    switch (user?.role) {
      case "admin":
        return <AdminSidebar collapsed={drawerCollapsed} />;
      case "doctor":
        return <DoctorSidebar collapsed={drawerCollapsed} />;
      case "frontdesk":
        return <FrontdeskSidebar collapsed={drawerCollapsed} />;
      default:
        return null;
    }
  };

  const drawer = React.useMemo(
    () => (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: drawerCollapsed ? collapsedDrawerWidth : drawerWidth,
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            flexDirection: drawerCollapsed ? "column" : "column",
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
              mb: drawerCollapsed ? 0 : 1.5,
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
          {/* App Name - Hide when collapsed */}
          {!drawerCollapsed && (
            <>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                color="primary.main"
                fontWeight="bold"
                align="center"
                sx={{ mb: 0.5 }}
              >
                CLINNET
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                align="center"
              >
                Healthcare Management
              </Typography>
            </>
          )}
        </Toolbar>
        <Divider />
        <Box
          sx={{
            width: "100%",
            flexGrow: 1,
            overflow: "auto",
            py: 1,
          }}
        >
          {renderSidebar()}
        </Box>
        <Divider />
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Collapse/Expand button */}
          <Tooltip title={drawerCollapsed ? "Expand" : "Collapse"}>
            <IconButton
              onClick={handleDrawerCollapse}
              sx={{
                borderRadius: "50%",
                bgcolor: "background.paper",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                "&:hover": {
                  bgcolor: "background.paper",
                },
              }}
            >
              {drawerCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        </Box>
        {!drawerCollapsed && (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} Clinnet EMR
            </Typography>
          </Box>
        )}
      </Box>
    ),
    [user?.role, isMobile, drawerCollapsed, theme]
  );

  const currentDrawerWidth = drawerCollapsed
    ? collapsedDrawerWidth
    : drawerWidth;

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { sm: `${currentDrawerWidth}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "background.paper", // White topbar
          color: "primary.main", // Primary text color
          boxShadow: "0px 1px 4px rgba(0,0,0,0.06)",
          borderBottom: "1px solid",
          borderColor: "divider",
          transition: (theme) =>
            theme.transitions.create(
              ["width", "margin", "background-color", "color"],
              {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }
            ),
        }}
      >
        <Toolbar
          sx={{ minHeight: { xs: "56px", sm: "64px" }, px: { xs: 1, sm: 3 } }}
        >
          <IconButton
            color="primary"
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
              pointerEvents: "none",
            }}
          >
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              noWrap
              component="div"
              sx={{
                fontWeight: 600,
                letterSpacing: 1,
                color: "primary.main",
                textAlign: "center",
                textTransform: "uppercase",
                lineHeight: 1.3,
              }}
            >
              {user?.role?.toUpperCase()} PORTAL
            </Typography>
          </Box>

          {/* Profile Icon and Menu */}
          <Box
            sx={{
              flexShrink: 0,
              ml: "auto",
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              onClick={handleMenuOpen}
              sx={{
                cursor: "pointer",
                "&:hover": {
                  opacity: 0.9,
                },
              }}
            >
              {/* User Name - Hide on mobile */}
              {!isMobile && (
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{
                    fontWeight: 500,
                    display: { xs: "none", sm: "block" },
                    letterSpacing: 0.2,
                  }}
                >
                  {getUserDisplayName()}
                </Typography>
              )}

              {/* Avatar */}
              {user?.profileImage ? (
                <Avatar
                  alt={getUserDisplayName()}
                  src={user.profileImage}
                  sx={{
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    bgcolor: "secondary.main",
                    fontSize: { xs: 16, sm: 18 },
                    fontWeight: 500,
                  }}
                >
                  {getAvatarLetter()}
                </Avatar>
              )}
            </Stack>

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
                  minWidth: 200,
                  mt: 0.5,
                  boxShadow: "0px 4px 16px rgba(0,0,0,0.08)",
                  borderRadius: 2,
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
              {/* User info in menu */}
              <Box
                sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center" }}
              >
                {user?.profileImage ? (
                  <Avatar
                    alt={getUserDisplayName()}
                    src={user.profileImage}
                    sx={{ width: 40, height: 40, mr: 1.5 }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      mr: 1.5,
                      bgcolor: "secondary.main",
                      fontSize: 18,
                      fontWeight: 500,
                    }}
                  >
                    {getAvatarLetter()}
                  </Avatar>
                )}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: "primary.main" }}
                  >
                    {getUserDisplayName()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
              <Divider />

              <MenuItem onClick={() => handleNavigate("/account-settings")}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Account Settings"
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
        sx={{
          width: { sm: currentDrawerWidth },
          flexShrink: { sm: 0 },
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
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
              width: drawerCollapsed ? collapsedDrawerWidth : drawerWidth,
              borderRight: "none",
              boxShadow: "4px 0 10px rgba(0, 0, 0, 0.12)",
              zIndex: (theme) => theme.zIndex.drawer,
              transition: (theme) =>
                theme.transitions.create("width", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              overflowX: "hidden",
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
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          transition: (theme) =>
            theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
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
