// src/components/Layout/AppLayout.jsx
import React, { useState, createContext, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
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
import { AppIconButton } from "../ui"; // Added AppIconButton import
import AdminSidebar from "./AdminSidebar";
import DoctorSidebar from "./DoctorSidebar";
import FrontdeskSidebar from "./FrontdeskSidebar";
import ActiveNavLink from "../ActiveNavLink"; // Ensure ActiveNavLink is imported

const drawerWidth = 240;
const collapsedDrawerWidth = 72;

// Add context for menu icon
export const MenuIconContext = createContext(null);

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

  // Handler for profile section click (open menu)
  // Replace with direct navigation to account settings
  const handleProfileSectionClick = () => {
    navigate("/account-settings");
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

  // Get user's role label (capitalized)
  const getUserRoleLabel = () => {
    if (!user?.role) return "";
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  };

  // Sidebar profile section (avatar + name + role)
  const sidebarProfileSection = (
    <Box
      sx={{
        display: "flex",
        flexDirection: drawerCollapsed ? "column" : "row",
        alignItems: "center",
        justifyContent: "center", // always center vertically
        cursor: "pointer",
        userSelect: "none",
        width: "100%",
        margin: drawerCollapsed ? 0 : "4px 8px",
        borderRadius: 10,
        "&:hover": {
          opacity: 0.92,
        },
        transition:
          "background 0.2s, flex-direction 0.2s, justify-content 0.2s",
        minHeight: 48,
        boxSizing: "border-box",
        px: drawerCollapsed ? 0 : 1.5,
        py: drawerCollapsed ? 0 : 1,
        height: drawerCollapsed ? 56 : "auto", // Match menu item height when collapsed
      }}
      onClick={handleProfileSectionClick}
      tabIndex={0}
      aria-label="Go to account settings"
    >
      {user?.profileImage ? (
        <Avatar
          alt={getUserDisplayName()}
          src={user.profileImage}
          variant="rounded"
          sx={{
            width: 40, // Match icon size
            height: 40,
            border: "2px solid rgba(67, 97, 238, 0.2)",
            boxShadow: "0 4px 8px rgba(67, 97, 238, 0.10)",
            borderRadius: 2,
            mx: drawerCollapsed ? 0 : 0, // margin left/right 0 when collapsed
            mr: !drawerCollapsed ? 1.5 : 0, // only margin-right when expanded
            my: 0,
            transition: "margin 0.2s",
            display: "block",
          }}
        />
      ) : (
        <Avatar
          variant="rounded"
          sx={{
            width: 40, // Match icon size
            height: 40,
            bgcolor: "secondary.main",
            fontSize: 20,
            fontWeight: 600,
            background: "linear-gradient(135deg, #7209b7 0%, #560a86 100%)",
            border: "2px solid rgba(114, 9, 183, 0.2)",
            boxShadow: "0 4px 8px rgba(114, 9, 183, 0.10)",
            borderRadius: 2,
            mx: drawerCollapsed ? 0 : 0, // margin left/right 0 when collapsed
            mr: !drawerCollapsed ? 1.5 : 0, // only margin-right when expanded
            my: 0,
            transition: "margin 0.2s",
            display: "block",
          }}
        >
          {getAvatarLetter()}
        </Avatar>
      )}
      {/* Only show name/role when not collapsed */}
      {!drawerCollapsed && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            minWidth: 0,
            flex: 1,
          }}
        >
          <Typography
            variant="subtitle2"
            color="primary.main"
            sx={{
              fontWeight: 600,
              textAlign: "left",
              maxWidth: 140,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.2,
            }}
          >
            {getUserDisplayName()}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textAlign: "left",
              maxWidth: 140,
              opacity: 0.85,
              fontWeight: 500,
              mt: 0.2,
              letterSpacing: "0.03em",
              lineHeight: 1.2,
            }}
          >
            {getUserRoleLabel()}
          </Typography>
        </Box>
      )}
    </Box>
  );

  // Render sidebar based on user role
  const renderSidebar = () => {
    // Always render full sidebar on mobile
    if (isMobile) {
      return user?.role === "admin" ? (
        <AdminSidebar collapsed={false} />
      ) : user?.role === "doctor" ? (
        <DoctorSidebar collapsed={false} />
      ) : user?.role === "frontdesk" ? (
        <FrontdeskSidebar collapsed={false} />
      ) : null;
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

  // Margin and shadow for floating effect
  const drawerMargin = 5; // px

  const drawer = React.useMemo(
    () => (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh", // Ensure full viewport height
          width: drawerCollapsed ? collapsedDrawerWidth : drawerWidth,
          overflow: "hidden", // Prevent content from being cut off
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        {/* --- Remove logo and app name from here --- */}
        {/* <Toolbar> ...logo and app name... </Toolbar> */}
        {/* Inserted Profile Section */}
        {sidebarProfileSection}
        {/* End Profile Section */}
        <Divider />
        <Box
          sx={{
            width: "100%",
            flexGrow: 1,
            overflowY: "auto", // Only vertical scroll for sidebar content
            py: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {renderSidebar()}
        </Box>
        {/* --- Settings Link Start --- */}
        <Box sx={{ p: 0.5 }}>
          <ActiveNavLink
            to="/settings"
            icon={<SettingsIcon />}
            primary="Settings"
            collapsed={drawerCollapsed}
          />
        </Box>
        {/* --- Settings Link End --- */}
        {/* --- Logout Button Start (now using ActiveNavLink for alignment) --- */}
        <Box sx={{ p: 0.5 }}>
          <ActiveNavLink
            to="#"
            icon={<LogoutIcon />}
            primary="Logout"
            collapsed={drawerCollapsed}
            onClick={(e) => {
              e.preventDefault();
              logout();
            }}
            sx={{
              cursor: "pointer",
              userSelect: "none",
              mb: 0.5,
              "&:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.08)",
                "& .MuiListItemIcon-root": {
                  color: "primary.main",
                },
                "& .MuiTypography-root": {
                  color: "primary.main",
                },
              },
            }}
            aria-label="Logout"
          />
        </Box>
        {/* --- Logout Button End --- */}
        <Divider />
        {!isMobile && (
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <AppIconButton
              icon={drawerCollapsed ? ChevronRightIcon : ChevronLeftIcon}
              tooltip={drawerCollapsed ? "Expand" : "Collapse"}
              onClick={handleDrawerCollapse}
              aria-label={drawerCollapsed ? "Expand drawer" : "Collapse drawer"}
              sx={{
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
            />
          </Box>
        )}
      </Box>
    ),
    [user?.role, isMobile, drawerCollapsed, theme, sidebarProfileSection]
  );

  const currentDrawerWidth = drawerCollapsed
    ? collapsedDrawerWidth
    : drawerWidth;

  // Memoize the menu icon for mobile
  const menuIconButton = useMemo(
    () => (
      <AppIconButton
        icon={MenuIcon}
        color="primary"
        aria-label="Open menu"
        onClick={handleDrawerToggle}
        sx={{
          bgcolor: "white",
          boxShadow: "0 4px 16px rgba(67, 97, 238, 0.18)",
          borderRadius: "50%",
          width: 44,
          height: 44,
          position: "fixed",
          top: 12,
          right: 12, // <-- move to right
          zIndex: 2002, // <-- higher than drawer
          display: { xs: "flex", sm: "none" },
          "&:hover": {
            bgcolor: "grey.100",
            boxShadow: "0 8px 24px rgba(67, 97, 238, 0.22)",
          },
        }}
      />
    ),
    [handleDrawerToggle]
  );

  return (
    <MenuIconContext.Provider value={isMobile ? null : menuIconButton}>
      <Box sx={{ display: "flex" }}>
        {/* Fixed menu icon for mobile */}
        {isMobile && menuIconButton}
        {/* Sidebar navigation */}
        <Box
          component="nav"
          sx={{
            width: { sm: currentDrawerWidth + drawerMargin * 2 },
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
                width: `calc(100vw - ${drawerMargin * 2}px)`,
                height: `calc(100vh - ${drawerMargin * 2}px)`,
                maxWidth: `calc(100vw - ${drawerMargin * 2}px)`,
                maxHeight: `calc(100vh - ${drawerMargin * 2}px)`,
                left: drawerMargin,
                top: drawerMargin,
                borderRadius: 1, // smaller radius
                // Remove shadow and add border
                boxShadow: "none",
                borderRight: "1px solid #e0e0e0",
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                zIndex: 2001,
                pt: 0,
                alignItems: "flex-start",
                overflow: "visible",
                position: "fixed",
                transition: (theme) =>
                  theme.transitions.create(["width", "left"], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                  }),
                margin: 0, // margin handled by left/top
              },
              "& .MuiBackdrop-root": {
                background: "rgba(67,97,238,0.10)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              },
            }}
          >
            <Box sx={{ width: "100%" }}>
              {/* Remove centering, start from top */}
              {drawer}
            </Box>
          </Drawer>

          {/* Permanent drawer for desktop */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: currentDrawerWidth,
                borderRadius: 1, // smaller radius
                // Remove shadow and add border
                boxShadow: "none",
                borderRight: "1px solid #e0e0e0",
                background: "rgba(255,255,255,0.97)",
                zIndex: (theme) => theme.zIndex.drawer,
                transition: (theme) =>
                  theme.transitions.create("width", {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                  }),
                overflowX: "hidden",
                height: "100vh", // Ensure full height for permanent drawer
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        {/* Main content area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: "100%",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            transition: (theme) =>
              theme.transitions.create(["width", "margin"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          }}
        >
          {/* Remove the floating menu icon here */}
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
            {/* Add footer at the bottom of the page */}
            <Box
              component="footer"
              sx={{
                width: "100%",
                py: 2,
                px: 0,
                mt: "auto",
                bgcolor: "transparent",
                textAlign: "center",
                color: "text.secondary",
                fontSize: "0.80rem", // smaller text
                letterSpacing: 0.1,
                // borderTop: "1px solid #e0e0e0", // hide divider
              }}
            >
              © {new Date().getFullYear()} Clinnet EMR
            </Box>
          </Box>
        </Box>
      </Box>
    </MenuIconContext.Provider>
  );
}

export default AppLayout;
