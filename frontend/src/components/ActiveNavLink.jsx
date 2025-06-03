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
  if (collapsed) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <ListItemButton
          component={NavLink}
          to={to}
          end={to.split("/").length <= 2}
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
            my: 0.5,
            maxWidth: "56px",
            minHeight: 48,
            transition: theme.transitions.create(
              ["width", "margin", "background-color"],
              {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.standard,
              }
            ),
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.08)",
              "& .MuiListItemIcon-root": {
                color: theme.palette.primary.main,
              },
            },
            "&.active": {
              backgroundColor: "rgba(25, 118, 210, 0.12)",
              "& .MuiListItemIcon-root": {
                color: theme.palette.primary.main,
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
                color: "text.secondary",
                fontSize: 28,
                transition: "font-size 0.2s",
              }}
            >
              {icon}
            </ListItemIcon>
          )}
        </ListItemButton>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 500,
            marginTop: 4,
            textAlign: "center",
            lineHeight: 1.2,
            whiteSpace: "normal",
            wordBreak: "break-word",
            opacity: 0.95,
            width: "100%",
            color: "#555",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {primary}
        </span>
      </div>
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
        my: 0.5,
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
          backgroundColor: "rgba(25, 118, 210, 0.08)",
          "& .MuiListItemText-primary": {
            color: theme.palette.primary.main,
          },
          "& .MuiListItemIcon-root": {
            color: theme.palette.primary.main,
          },
        },
        "&.active": {
          backgroundColor: "rgba(25, 118, 210, 0.12)",
          "& .MuiListItemIcon-root": {
            color: theme.palette.primary.main,
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
            mr: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
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
