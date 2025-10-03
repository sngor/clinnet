// src/components/ActiveNavLink.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";

/**
 * A component that combines MUI ListItemButton with React Router's NavLink
 * to create a navigation item that shows active state correctly
 */
function ActiveNavLink({
  to,
  icon,
  primary,
  onClick,
  collapsed = false,
  ...props
}) {
  const theme = useTheme(); // Added useTheme hook
  // Add hover state for collapsed mode
  const [hovered, setHovered] = useState(false);

  if (collapsed) {
    // Use NavLink to get active state for the label
    return (
      <NavLink
        to={to}
        end={to.split("/").length <= 2}
        style={{ textDecoration: "none", width: "100%" }}
      >
        {({ isActive }) => (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              marginBottom: 16,
            }}
          >
            <ListItemButton
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              onClick={onClick}
              className="nav-link"
              sx={(theme) => ({
                py: 1.5,
                px: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                width: "100%",
                borderRadius: "12px",
                mx: "auto",
                my: 0,
                maxWidth: "56px",
                minHeight: 48,
                transition: theme.transitions.create(
                  ["width", "margin", "background-color"],
                  {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.standard,
                  }
                ),
                backgroundColor: isActive
                  ? "primary.50"
                  : hovered
                  ? "action.hover"
                  : undefined,
                "& .MuiListItemIcon-root": {
                  color:
                    isActive || hovered
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                  "& .MuiSvgIcon-root": {
                    // Target the SVG icon directly for transform
                    transition: "transform 0.2s ease-in-out",
                  },
                },
                "&:hover": {
                  // Add hover effect for the icon
                  "& .MuiSvgIcon-root": {
                    transform: "scale(1.15)",
                  },
                },
              })}
              {...props}
            >
              {icon && (
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    // transition for font-size is okay, but transform is on SvgIcon now
                  }}
                >
                  {icon}
                </ListItemIcon>
              )}
            </ListItemButton>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: isActive ? 700 : 500, // Only bold when active
                marginTop: theme.spacing(0.5), // Added margin-top using theme.spacing
                textAlign: "center",
                lineHeight: 1.2,
                whiteSpace: "normal",
                wordBreak: "break-word",
                opacity: 0.95,
                width: "100%",
                color: (theme) => theme.palette.text.secondary,
                userSelect: "none",
                pointerEvents: "none",
                transition: "font-weight 0.15s",
              }}
            >
              {primary}
            </span>
          </div>
        )}
      </NavLink>
    );
  }

  return (
    <ListItemButton
      component={NavLink}
      to={to}
      end={to.split("/").length <= 2}
      onClick={onClick}
      className="nav-link"
      sx={(theme) => ({
        py: 1.5,
        px: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "row",
        width: "100%",
        borderRadius: "12px",
        mx: "auto",
        my: 1, // Increase vertical margin for more space between expanded items
        maxWidth: "95%",
        minHeight: 48,
        [theme.breakpoints.down("sm")]: {
          minHeight: 48,
        },
        transition: theme.transitions.create(
          ["width", "margin", "background-color"],
          {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }
        ),
        "&:hover": {
          backgroundColor: "action.hover",
          "& .MuiListItemText-primary": {
            color: theme.palette.primary.main,
          },
          "& .MuiListItemIcon-root": {
            color: theme.palette.primary.main,
            "& .MuiSvgIcon-root": {
              transform: "scale(1.1)", // Icon scales on parent hover
            },
          },
        },
        "&.active": {
          backgroundColor: "primary.50",
          "& .MuiListItemIcon-root": {
            color: theme.palette.primary.main,
            // No specific transform for active, hover takes precedence if also hovered
          },
          "& .MuiListItemText-primary": {
            color: theme.palette.primary.main,
            fontWeight: "bold",
          },
        },
      })}
      {...props}
    >
      {icon && (
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: 1.5, // Increased from 0.4 for better spacing
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
            "& .MuiSvgIcon-root": {
              // Target the SVG icon directly
              transition: "transform 0.2s ease-in-out",
            },
          }}
        >
          {icon}
        </ListItemIcon>
      )}
      <ListItemText
        primary={primary}
        disableTypography={false}
        primaryTypographyProps={{
          fontSize: { xs: "0.9rem", sm: "1rem" },
          fontWeight: 500,
          variant: "body2",
        }}
        sx={{
          my: 0,
          opacity: 1,
          "& .MuiListItemText-primary": {
            display: "block",
            whiteSpace: "nowrap",
          },
        }}
      />
    </ListItemButton>
  );
}

export default ActiveNavLink;
