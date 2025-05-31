// src/components/layout/TopBar.jsx
import React from "react";
import { AppBar, Toolbar } from "@mui/material";

function TopBar() {
  return (
    <AppBar
      position="fixed"
      color="primary"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>{/* ...existing code... */}</Toolbar>
    </AppBar>
  );
}

export default TopBar;
