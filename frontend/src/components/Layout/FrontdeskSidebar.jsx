// src/components/Layout/FrontdeskSidebar.jsx
import React from "react";
import { List, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import PaymentIcon from "@mui/icons-material/Payment";
import SettingsIcon from "@mui/icons-material/Settings";
import ActiveNavLink from "../ActiveNavLink";

function FrontdeskSidebar({ collapsed = false }) {
  return (
    <List
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 0.5, // Reduced padding to give more space to buttons
      }}
    >
      <ActiveNavLink
        to="/frontdesk"
        icon={<HomeIcon />}
        primary="Dashboard"
        collapsed={collapsed}
      />
      <ActiveNavLink
        to="/frontdesk/appointments"
        icon={<EventIcon />}
        primary="Appointments"
        collapsed={collapsed}
      />
      <ActiveNavLink
        to="/frontdesk/patients"
        icon={<PersonIcon />}
        primary="Patients"
        collapsed={collapsed}
      />
      <ActiveNavLink
        to="/frontdesk/checkout"
        icon={<PaymentIcon />}
        primary="Checkout"
        collapsed={collapsed}
      />
      <ActiveNavLink
        to="/settings"
        icon={<SettingsIcon />}
        primary="Settings"
        collapsed={collapsed}
      />
    </List>
  );
}

export default FrontdeskSidebar;
