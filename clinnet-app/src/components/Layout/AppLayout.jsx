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
} from "@mui/material";
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

function AppLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // State for Menu anchor
  const navigate = useNavigate(); // Hook for navigation
  const open = Boolean(anchorEl); // Menu open state

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
          // Add frontdesk specific links here
        ];
      default:
        return baseLinks;
    }
  };

  const navLinks = getNavLinks(user?.role);

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {navLinks.map((link) => (
          <ListItemButton
            key={link.text}
            component={NavLink}
            to={link.path}
            // Apply active styles using NavLink's className or style prop based on `isActive`
            style={({ isActive }) => ({
              backgroundColor: isActive ? "rgba(0, 0, 0, 0.08)" : "transparent",
            })}
          >
            <ListItemIcon>{link.icon}</ListItemIcon>
            <ListItemText primary={link.text} />
          </ListItemButton>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          // ml: { sm: `${drawerWidth}px` }, // Remove this line
        }}
      >
        <Toolbar>
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
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1 /* Pushes icon to the right */ }}
          >
            Clinnet EMR - {user?.role?.toUpperCase()} Portal
          </Typography>

          {/* Profile Icon and Menu */}
          <Box sx={{ flexShrink: 0 }}>
            <IconButton
              onClick={handleMenuOpen}
              size="large"
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
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <Avatar
                  sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}
                >
                  {user?.username ? (
                    user.username[0].toUpperCase()
                  ) : (
                    <AccountCircleIcon />
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
              <MenuItem onClick={() => handleNavigate("/profile")}>
                {" "}
                {/* Placeholder path */}
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={() => handleNavigate("/account-settings")}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                Account Settings
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
          ModalProps={{ keepMounted: true }} // Better open performance on mobile.
          sx={{
            display: { xs: "block", sm: "none" },
            "&.MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
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
            "&.MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
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
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Outlet /> {/* Renders the matched child route's element */}
      </Box>
    </Box>
  );
}

export default AppLayout;
