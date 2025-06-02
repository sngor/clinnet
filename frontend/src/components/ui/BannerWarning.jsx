import React, { useState } from "react";
import { Box, Typography, Link as MuiLink, Divider, List, ListItem, IconButton, Fade } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CloseIcon from "@mui/icons-material/Close";
import { Link as RouterLink } from "react-router-dom";

function BannerWarning({ message, showDiagnosticsLink = true }) {
  // Split message into multiple errors if separated by ';'
  const errorList =
    typeof message === "string"
      ? message.split(";").map((err) => err.trim()).filter(Boolean)
      : Array.isArray(message)
      ? message
      : [message];

  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <Fade in={open}>
      <Box
        sx={{
          width: "100%",
          maxWidth: 900, // make banner even longer
          mx: "auto",
          bgcolor: "rgba(255, 235, 238, 0.98)",
          color: "#222",
          display: "flex",
          alignItems: "flex-start",
          position: "relative",
          py: 1.2,
          px: { xs: 1.5, sm: 2.5 },
          borderRadius: 1,
          border: "1px solid #f44336",
          borderLeft: "6px solid #f44336",
          fontWeight: 500,
          fontSize: "0.97rem",
          boxShadow: "0 2px 12px rgba(244, 67, 54, 0.10)",
          mb: 2,
          gap: 1.5,
          minHeight: 40,
          transition: "box-shadow 0.2s",
        }}
        role="alert"
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            bgcolor: "transparent",
            minWidth: 44,
            mr: 1.2,
            mt: 0.2,
            p: 0.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#ffcdd2",
              borderRadius: "50%",
              width: 32,
              height: 32,
              minWidth: 32,
              boxShadow: "0 1px 4px rgba(244, 67, 54, 0.10)",
            }}
          >
            <WarningAmberIcon sx={{ color: "#f44336", fontSize: 22 }} />
          </Box>
          <Typography
            variant="subtitle2"
            sx={{
              color: "#b71c1c",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 0.7,
              fontSize: "0.93rem",
              mt: 0.6,
            }}
          >
            Error
          </Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, pr: 5 /* add right padding to avoid overlap with close button */ }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.2 }}>
            {/* Removed Error title from here */}
            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderColor: "#ffcdd2", mx: 0, height: 22, display: "none" }}
            />
            {/* Removed diagnostics link from here */}
          </Box>
          <List dense sx={{ p: 0, mb: 0, ml: 1 }}>
            {errorList.map((err, idx) => (
              <ListItem
                key={idx}
                sx={{
                  py: 0.2,
                  px: 0,
                  display: "list-item",
                  listStyleType: "disc",
                  color: "#b71c1c",
                  fontWeight: 600,
                  fontSize: "0.97rem",
                  background: idx % 2 === 0 ? "rgba(255,205,210,0.10)" : "transparent",
                  borderRadius: 0.3,
                  mb: 0.2,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: "break-word" }}>
                  {err}
                </Typography>
              </ListItem>
            ))}
          </List>
          {showDiagnosticsLink && (
            <MuiLink
              component={RouterLink}
              to="/settings?tab=system-diagnostics"
              sx={{
                display: "inline-block",
                mt: 1,
                fontWeight: 600,
                color: "#1976d2",
                textDecoration: "underline",
                whiteSpace: "nowrap",
                "&:hover": { color: "#1565c0" },
                fontSize: "0.98rem",
                ml: 0,
              }}
            >
              Run System Diagnostics
            </MuiLink>
          )}
        </Box>
        <IconButton
          aria-label="close"
          onClick={() => setOpen(false)}
          size="small"
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            color: "#b71c1c",
            background: "rgba(255,255,255,0.7)",
            "&:hover": { background: "#ffcdd2" },
            zIndex: 2, // ensure button is above content
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Fade>
  );
}

export default BannerWarning;
