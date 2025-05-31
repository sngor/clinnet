import React from "react";
import { Drawer } from "@mui/material";

function AppBar(props) {
  const { menuOpen, handleMenuClose } = props;

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1100, // ensure it stays above other content
        // ...existing styles...
      }}
      // ...existing props...
    >
      {/* ...existing code before menu icon... */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          background: "rgba(255,255,255,0.5)", // adjust for your theme
          padding: 8,
        }}
      >
        {/* Menu Icon */}
        {/* ...existing menu icon code... */}
      </div>
      {/* ...existing code after menu icon... */}

      <Drawer
        anchor="left"
        open={menuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          className: "css-inuwyx",
          style: {
            width: "100vw",
            height: "100vh",
            // ...existing styles...
          },
        }}
        ModalProps={{
          // Remove backdrop on mobile
          BackdropProps: {
            style: {
              display: window.innerWidth <= 600 ? "none" : undefined,
            },
          },
        }}
      >
        {/* ...existing menu content... */}
      </Drawer>
    </div>
  );
}

export default AppBar;
