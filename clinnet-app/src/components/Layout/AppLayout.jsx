// src/components/Layout/AppLayout.jsx (Simplified Example)
import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home"; // Example icons
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../app/providers/AuthProvider"; // Adjust path

const drawerWidth = 240;

function AppLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Define navigation links based on role
  const getNavLinks = (role) => {
    const baseLinks = [
      // Add common links if any
    ];
    switch (role) {
      case "admin":
        return;
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
        return;
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
      <Divider />
      <List>
        <ListItemButton onClick={logout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
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
          <Typography variant="h6" noWrap component="div">
            Clinnet EMR - {user?.role?.toUpperCase()} Portal
          </Typography>
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
