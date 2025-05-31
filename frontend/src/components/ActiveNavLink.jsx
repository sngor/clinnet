// src/components/ActiveNavLink.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

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
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      end={to.split("/").length <= 2}
      onClick={onClick}
      className="nav-link"
      sx={(theme) => ({
        py: 1.5,
        px: collapsed ? 1.5 : 2,
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        width: "100%",
        borderRadius: "12px",
        mx: "auto",
        my: 0.5,
        maxWidth: collapsed ? "48px" : "95%",
        minHeight: 48, // Force consistent height on all screens
        [theme.breakpoints.down("sm")]: {
          minHeight: 48, // Ensure same height on mobile
        },
        transition: theme.transitions.create(
          ["width", "margin", "background-color"],
          {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }
        ),
        "&:hover": {
          backgroundColor: "rgba(25, 118, 210, 0.08)", // Light blue background on hover
          "& .MuiListItemText-primary": {
            color: theme.palette.primary.main, // Blue text on hover
          },
          "& .MuiListItemIcon-root": {
            color: theme.palette.primary.main, // Blue icon on hover
          },
        },
        "&.active": {
          backgroundColor: "rgba(25, 118, 210, 0.12)", // Slightly darker blue background
          "& .MuiListItemIcon-root": {
            color: theme.palette.primary.main, // Theme primary color for icon
          },
          "& .MuiListItemText-primary": {
            color: theme.palette.primary.main, // Theme primary color for text
            fontWeight: "bold", // Bold text for active state
          },
        },
      })}
      {...props}
    >
      {icon && (
        <ListItemIcon
          sx={{
            minWidth: collapsed ? 0 : 36, // No min width when collapsed
            mr: collapsed ? 0 : 1.5, // Reduced margin for better spacing
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary", // Consistent color for inactive state
          }}
        >
          {icon}
        </ListItemIcon>
      )}
      {!collapsed && (
        <ListItemText
          primary={primary}
          disableTypography={false}
          primaryTypographyProps={{
            fontSize: { xs: "0.9rem", sm: "1rem" }, // Responsive text size
            fontWeight: 500, // Medium weight for better readability
            variant: "body2",
          }}
          sx={{
            my: 0, // Remove default margin for better vertical alignment
            opacity: collapsed ? 0 : 1, // Hide text when collapsed
            "& .MuiListItemText-primary": {
              display: "block", // Ensure text is on its own line
              whiteSpace: "nowrap", // Prevent text wrapping
            },
          }}
        />
      )}
    </ListItemButton>
  );
}

export default ActiveNavLink;
