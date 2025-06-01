// src/components/Layout/AdminSidebar.jsx
import React from "react";
import { List, Box } from "@mui/material"; // Add Box import
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import AssessmentIcon from "@mui/icons-material/Assessment";
// import SettingsIcon from "@mui/icons-material/Settings"; // Re-added SettingsIcon
// import BiotechIcon from '@mui/icons-material/Biotech'; // Removed for Diagnostics
import ActiveNavLink from "../ActiveNavLink";

function AdminSidebar({ collapsed = false }) {
  return (
    <Box>
      {/* Sidebar menu without extra margin or floating effect */}
      <List
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: { xs: "center", sm: "center" }, // always center
          p: 0.5, // Reduced padding to give more space to buttons
          // Fill vertical space on mobile
          flexGrow: { xs: 0, sm: 0 }, // Don't stretch vertically on mobile
          justifyContent: { xs: "flex-start", sm: "flex-start" }, // Start from top
          // Ensure menu items have consistent height on all screens
          "& .MuiListItemButton-root": {
            minHeight: 48, // Match desktop minHeight
          },
        }}
      >
        <ActiveNavLink
          to="/admin"
          icon={<HomeIcon />}
          primary="Dashboard"
          collapsed={collapsed}
        />
        <ActiveNavLink
          to="/admin/appointments"
          icon={<EventIcon />}
          primary="Appointments"
          collapsed={collapsed}
        />
        <ActiveNavLink
          to="/admin/patients"
          icon={<PersonIcon />}
          primary="Patients"
          collapsed={collapsed}
        />
        <ActiveNavLink
          to="/admin/services"
          icon={<MedicalServicesIcon />}
          primary="Services"
          collapsed={collapsed}
        />
        <ActiveNavLink
          to="/admin/users"
          icon={<PeopleIcon />}
          primary="Users"
          collapsed={collapsed}
        />
        <ActiveNavLink
          to="/admin/reports"
          icon={<AssessmentIcon />}
          primary="Reports"
          collapsed={collapsed}
        />
        {/* Diagnostics menu item removed */}
        {/* Settings menu item removed */}
      </List>
    </Box>
  );
}

export default AdminSidebar;
