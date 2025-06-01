// src/components/Layout/FrontdeskSidebar.jsx
import React from "react";
import { List, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import PaymentIcon from "@mui/icons-material/Payment";
import ActiveNavLink from "../ActiveNavLink";

function FrontdeskSidebar({ collapsed = false }) {
  return (
    <Box sx={{ m: 1 }}>
      {" "}
      {/* Add margin around the sidebar menu */}
      <List
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: { xs: "center", sm: "center" }, // always center
          p: 0.5, // Reduced padding to give more space to buttons
          flexGrow: { xs: 0, sm: 0 }, // Don't stretch vertically on mobile
          justifyContent: { xs: "flex-start", sm: "flex-start" }, // Start from top
          "& .MuiListItemButton-root": {
            minHeight: 48, // Consistent height
          },
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
      </List>
    </Box>
  );
}

export default FrontdeskSidebar;
