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
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuIcon from "@mui/icons-material/Menu";
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
    // Always render full sidebar on mobile
    if (isMobile) {
      return user?.role === "admin"
        ? <AdminSidebar collapsed={false} />
        : user?.role === "doctor"
        ? <DoctorSidebar collapsed={false} />
        : user?.role === "frontdesk"
        ? <FrontdeskSidebar collapsed={false} />
        : null;
    }
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
          {/* Logo */}{" "}
          <Box
            sx={{
              width: { xs: 50, sm: 60 },
              height: { xs: 50, sm: 60 },
              bgcolor: "primary.main",
              background: "linear-gradient(135deg, #4361ee 0%, #3a56d4 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: drawerCollapsed ? 0 : 1.5,
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%)",
                top: 0,
                left: 0,
              },
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
                sx={{
                  mb: 0.5,
                  letterSpacing: "0.05em",
                  background: "linear-gradient(90deg, #4361ee, #7209b7)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent" /* Fallback */,
                }}
              >
                CLINNET
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                align="center"
                sx={{ opacity: 0.85, fontWeight: 500 }}
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
        {/* Collapse/Expand button - hidden on mobile */}
        {!isMobile && (
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Tooltip title={drawerCollapsed ? "Expand" : "Collapse"}>
              <IconButton
                onClick={handleDrawerCollapse}
                sx={{
                  borderRadius: "50%",
                  bgcolor: "background.paper",
                  boxShadow: "0 4px 12px rgba(67, 97, 238, 0.15)",
                  width: 36,
                  height: 36,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "background.paper",
                    transform: "scale(1.1)",
                    boxShadow: "0 6px 16px rgba(67, 97, 238, 0.2)",
                  },
                }}
              >
                {drawerCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        )}
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
          backgroundColor: "rgba(255, 255, 255, 0.85)", // More glass-like
          color: "primary.main",
          "-webkit-backdrop-filter": "blur(10px) saturate(180%)",
          backdropFilter: "blur(10px) saturate(180%)",
          // Refined top bar with very subtle shadow
          boxShadow: "0 4px 20px rgba(67, 97, 238, 0.05)",
          borderBottom: "1px solid rgba(231, 236, 248, 0.8)",
          transition: (theme) =>
            theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
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
            {" "}
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              noWrap
              component="div"
              sx={{
                fontWeight: 600,
                letterSpacing: "0.05em",
                textAlign: "center",
                textTransform: "uppercase",
                lineHeight: 1.3,
                background: "linear-gradient(90deg, #4361ee, #7209b7)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent" /* Fallback */,
                padding: "0 8px",
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
                    width: { xs: 34, sm: 38 },
                    height: { xs: 34, sm: 38 },
                    border: "2px solid rgba(67, 97, 238, 0.2)",
                    boxShadow: "0 4px 8px rgba(67, 97, 238, 0.15)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      border: "2px solid rgba(67, 97, 238, 0.4)",
                    },
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: { xs: 34, sm: 38 },
                    height: { xs: 34, sm: 38 },
                    bgcolor: "secondary.main",
                    fontSize: { xs: 16, sm: 18 },
                    fontWeight: 600,
                    background:
                      "linear-gradient(135deg, #7209b7 0%, #560a86 100%)",
                    border: "2px solid rgba(114, 9, 183, 0.2)",
                    boxShadow: "0 4px 8px rgba(114, 9, 183, 0.15)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      border: "2px solid rgba(114, 9, 183, 0.4)",
                    },
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
                  minWidth: 220,
                  mt: 1.5,
                  boxShadow: "0px 8px 30px rgba(0,0,0,0.08)",
                  borderRadius: 3,
                  border: "1px solid rgba(231, 236, 248, 0.8)",
                  overflow: "hidden",
                  "& .MuiMenuItem-root": {
                    px: 2.5,
                    py: 1.2,
                    my: 0.5,
                    mx: 1,
                    borderRadius: 2,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(67, 97, 238, 0.08)",
                    },
                    "& .MuiListItemIcon-root": {
                      minWidth: 36,
                      color: "primary.main",
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
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              boxShadow: 'none',
              borderRight: '1px solid #e0e0e0',
              pt: '56px',
              alignItems: 'flex-start',
              overflow: 'visible',
              position: 'relative',
            },
          }}
        >
          {/* Show logo above drawer content on mobile, no nested container */}
          <Box sx={{
            width: '100%',
            display: { xs: 'flex', sm: 'none' },
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            height: '56px',
            zIndex: 2,
            background: 'white',
            borderBottom: '1px solid #e0e0e0',
            overflow: 'visible',
          }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                bgcolor: 'primary.main',
                background: 'linear-gradient(135deg, #4361ee 0%, #3a56d4 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                mt: 0.5,
                zIndex: 3,
              }}
            >
              <Typography
                variant="h5"
                color="white"
                fontWeight="bold"
                align="center"
              >
                C
              </Typography>
            </Box>
          </Box>
          <Box sx={{ mt: '56px', width: '100%' }}>{drawer}</Box>
        </Drawer>

        {/* Permanent drawer for desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerCollapsed ? collapsedDrawerWidth : drawerWidth,
              // Remove shadow, add right border line
              borderRight: "1px solid #e0e0e0",
              boxShadow: "none",
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
          // p: { xs: 2, sm: 3 }, // Padding removed as per instruction
          width: "100%", // Take up the whole width
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          // Only transition width and margin, not other properties
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
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "stretch",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              overflow: "auto",
              flex: 1,
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
