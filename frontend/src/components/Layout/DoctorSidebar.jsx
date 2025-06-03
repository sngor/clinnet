// src/components/Layout/DoctorSidebar.jsx
import React from "react";
import { List, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ActiveNavLink from "../ActiveNavLink";

function DoctorSidebar({ collapsed = false }) {
  return (
    <Box sx={{ m: collapsed ? 0 : 1 }}>
      <List
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: { xs: "center", sm: "center" },
          p: 0.5,
          flexGrow: { xs: 0, sm: 0 },
          justifyContent: { xs: "flex-start", sm: "flex-start" },
          "& .MuiListItemButton-root": {
            minHeight: 48,
          },
        }}
      >
        <ActiveNavLink
          to="/doctor"
          icon={<HomeIcon />}
          primary="Dashboard"
          collapsed={collapsed}
        />
        <ActiveNavLink
          to="/doctor/appointments"
          icon={<EventIcon />}
          primary="Appointments"
          collapsed={collapsed}
        />
        <ActiveNavLink
          to="/doctor/schedule"
          icon={<CalendarMonthIcon />}
          primary="My Schedule"
          collapsed={collapsed}
        />
        <ActiveNavLink
          to="/doctor/patients"
          icon={<PersonIcon />}
          primary="Patients"
          collapsed={collapsed}
        />
        <ActiveNavLink
          to="/doctor/medical-records"
          icon={<MedicalInformationIcon />}
          primary="Medical Records"
          collapsed={collapsed}
        />
      </List>
    </Box>
  );
}

export default DoctorSidebar;
