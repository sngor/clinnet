import React, { useState } from "react";
import {
  Box,
  Typography,
  Link as MuiLink,
  Divider,
  List,
  ListItem,
  IconButton,
  Fade,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CloseIcon from "@mui/icons-material/Close";
import { Link as RouterLink } from "react-router-dom";

function BannerWarning({ message, showDiagnosticsLink = true }) {
  // Split message into multiple errors if separated by ';'
  const errorList =
    typeof message === "string"
      ? message
          .split(";")
          .map((err) => err.trim())
          .filter(Boolean)
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
          maxWidth: 900,
          mx: "auto",
          bgcolor: "error.50",
          color: "text.primary",
          display: "flex",
          alignItems: "flex-start",
          position: "relative",
          py: 1.2,
          px: { xs: 1.5, sm: 2.5 },
          borderRadius: 1,
          border: "1px solid",
          borderColor: "error.main",
          borderLeft: "6px solid",
          borderLeftColor: "error.main",
          fontWeight: 500,
          fontSize: "0.97rem",
          boxShadow: 2,
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
              bgcolor: "error.100",
              borderRadius: "50%",
              width: 32,
              height: 32,
              minWidth: 32,
              boxShadow: 1,
            }}
          >
            <WarningAmberIcon sx={{ color: "error.main", fontSize: 22 }} />
          </Box>
          <Typography
            variant="subtitle2"
            sx={{
              color: "error.dark",
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
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            pr: 5 /* add right padding to avoid overlap with close button */,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.2 }}>
            {/* Removed Error title from here */}
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                borderColor: "#ffcdd2",
                mx: 0,
                height: 22,
                display: "none",
              }}
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
                  color: "error.dark",
                  fontWeight: 600,
                  fontSize: "0.97rem",
                  background: idx % 2 === 0 ? "error.50" : "transparent",
                  borderRadius: 0.3,
                  mb: 0.2,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, wordBreak: "break-word" }}
                >
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
                color: "primary.main",
                textDecoration: "underline",
                whiteSpace: "nowrap",
                "&:hover": { color: "primary.dark" },
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
            color: "error.dark",
            backgroundColor: "background.paper",
            opacity: 0.9,
            "&:hover": { backgroundColor: "error.100" },
            zIndex: 2,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Fade>
  );
}

export default BannerWarning;
