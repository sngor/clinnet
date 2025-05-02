// src/components/Layout/AppLayout.jsx (Simplified Example)
import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom"; // Import useNavigate
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar, // Import Avatar
  Menu, // Import Menu
  MenuItem, // Import MenuItem
  useMediaQuery, // Import useMediaQuery for responsive design
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles"; // Import useTheme
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home"; // Example icons
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle"; // Fallback icon
import SettingsIcon from "@mui/icons-material/Settings"; // Icon for settings
import { useAuth } from "../../app/providers/AuthProvider"; // Adjust path

const drawerWidth = 240;
const collapsedDrawerWidth = 64;

function AppLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // State for Menu anchor
  const navigate = useNavigate(); // Hook for navigation
  const open = Boolean(anchorEl); // Menu open state
  const theme = useTheme(); // Access the theme
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Check if viewport is mobile size

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

  // Define navigation links based on role
  const getNavLinks = (role) => {
    const baseLinks = [
      // Add common links if any
    ];
    switch (role) {
      case "admin":
        return [
          ...baseLinks,
          { text: "Dashboard", path: "/admin", icon: <HomeIcon /> },
          { text: "Users", path: "/admin/users", icon: <PeopleIcon /> }, // Example admin link
        ];
      case "doctor":
        return [
          ...baseLinks,
          { text: "Dashboard", path: "/doctor", icon: <HomeIcon /> },
          { text: "Patients", path: "/doctor/patients", icon: <PeopleIcon /> },
          {
            text: "Appointments",
            path: "/doctor/appointments",
            icon: <EventIcon />,
          },
        ];
      case "frontdesk":
        return [
          ...baseLinks,
          { text: "Dashboard", path: "/frontdesk", icon: <HomeIcon /> },
          {
            text: "Appointments",
            path: "/frontdesk/appointments",
            icon: <EventIcon />,
          },
          {
            text: "Patients",
            path: "/frontdesk/patients",
            icon: <PeopleIcon />,
          },
        ];

      default:
        return baseLinks;
    }
  };

  const navLinks = React.useMemo(() => getNavLinks(user?.role), [user?.role]);

  const drawer = React.useMemo(
    () => (
      <div>
        <Toolbar
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: { xs: 1.5, sm: 2 }, // Responsive padding
            background: "white", // Ensure the toolbar has a white background
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              width: { xs: 50, sm: 60 }, // Responsive size
              height: { xs: 50, sm: 60 }, // Responsive size
              bgcolor: "primary.main",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1,
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Add shadow to the logo
            }}
          >
            <Typography
              variant={isMobile ? "h5" : "h4"}
              color="white"
              fontWeight="bold"
            >
              C
            </Typography>
          </Box>
          {/* App Name */}
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            color="primary.main"
            fontWeight="bold"
          >
            CLINNET
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
            Healthcare Management
          </Typography>
        </Toolbar>
        <Divider />
        <List>
          {navLinks.map((link) => (
            <ListItemButton
              key={link.text}
              component={NavLink}
              to={link.path}
              end={link.path.split("/").length === 2}
              onClick={() => isMobile && setMobileOpen(false)} // Close drawer when clicking a link on mobile
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.04)", // Very light blue background on hover
                  "& .MuiListItemText-primary": {
                    color: "#42a5f5", // Light blue text on hover
                  },
                  "& .MuiListItemIcon-root": {
                    color: "#42a5f5", // Light blue icon on hover
                  }
                },
                "&.Mui-selected, &.active": {
                  backgroundColor: "rgba(25, 118, 210, 0.08)", // Light blue background
                  "& .MuiListItemIcon-root": {
                    color: "#0d47a1", // Dark blue icon for active state
                  },
                  "& .MuiListItemText-primary": {
                    color: "#0d47a1", // Dark blue text for active state
                    fontWeight: "bold", // Bold text for active state
                  }
                }
              }}
              className={({ isActive }) => isActive ? "active" : ""}
            >
              <ListItemIcon>
                {link.icon}
              </ListItemIcon>
              <ListItemText
                primary={link.text}
                primaryTypographyProps={{
                  fontSize: { xs: "0.9rem", sm: "1rem" }, // Responsive text size
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </div>
    ),
    [navLinks, isMobile]
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1, // Ensure AppBar stays on top
        }}
      >
        <Toolbar sx={{ minHeight: { xs: "56px", sm: "64px" } }}>
          {" "}
          {/* Responsive toolbar height */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          {/* Optional: Keep title if desired, or remove */}
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            noWrap
            component="div"
            sx={{ flexGrow: 1 /* Pushes icon to the right */ }}
          >
            {user?.role?.toUpperCase()} Portal
          </Typography>
          {/* Profile Icon and Menu */}
          <Box sx={{ flexShrink: 0 }}>
            <IconButton
              onClick={handleMenuOpen}
              size={isMobile ? "medium" : "large"}
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              color="inherit"
            >
              {/* Replace with actual user photo URL if available */}
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
            >
              <MenuItem onClick={() => handleNavigate("/account-settings")}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={logout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
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
          p: { xs: 2, sm: 3 }, // Responsive padding
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ minHeight: { xs: "56px", sm: "64px" } }} />{" "}
        {/* Responsive spacer for AppBar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems:
              "flex-start" /* Changed from center to flex-start to allow content to fill space */,
            minHeight: {
              xs: "calc(100vh - 112px)",
              sm: "calc(100vh - 128px)",
            } /* Responsive full height minus app bar and padding */,
            width: "100%",
          }}
        >
          <Box sx={{ width: "100%" }}>
            {" "}
            {/* Removed maxWidth constraint */}
            <Outlet /> {/* Renders the matched child route's element */}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default AppLayout;
