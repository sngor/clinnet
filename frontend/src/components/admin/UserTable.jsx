import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Avatar,
  Tooltip,
  Box,
  Typography,
} from "@mui/material";
// Explicitly import the icons with specific paths to ensure they load properly
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const UserTable = ({ users, onEditUser, onToggleUserStatus }) => {
  // Helper function to get user initials for avatar fallback
  const getUserInitials = (user) => {
    if (!user) return "U";
    return (
      `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}` ||
      user.username?.charAt(0) ||
      "U"
    );
  };

  // Helper function to extract username from email
  const extractUsernameFromEmail = (email) => {
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return email || "";
    }
    return email.split("@")[0];
  };

  // Add a useEffect to log if icons are being loaded properly
  useEffect(() => {
    // Confirm the icons are properly imported
    console.log("Edit Icon loaded:", !!EditIcon);
    console.log("Block Icon loaded:", !!BlockIcon);
    console.log("CheckCircle Icon loaded:", !!CheckCircleIcon);

    // Log the first user to check its structure
    if (users && users.length > 0) {
      console.log("First user data:", users[0]);
    }
  }, [users]);

  // Log users to debug
  useEffect(() => {
    if (users && users.length > 0) {
      console.log(
        "Users data for avatar display:",
        users.map((u) => ({
          id: u.uniqueId || u.id || u.sub,
          profileImage: u.profileImage,
          avatar: u.avatar,
          customProfileImage: u.custom_profile_image || u.customProfileImage,
        }))
      );
    }
  }, [users]);

  // Helper function to get user avatar image source
  const getUserAvatarSrc = (user) => {
    // Check all possible places where profile image URL might be stored
    return (
      user.profileImage ||
      user.avatar ||
      user.custom_profile_image ||
      user.customProfileImage ||
      null
    );
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.uniqueId || user.id || user.sub}>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Avatar
                    src={getUserAvatarSrc(user)}
                    alt={getUserInitials(user)}
                    variant="rounded"
                    sx={{ mr: 2, borderRadius: 2 }}
                  >
                    {getUserInitials(user)}
                  </Avatar>
                  <Typography>
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.displayUsername ||
                        extractUsernameFromEmail(user.email) ||
                        user.username}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role || "User"}</TableCell>
              <TableCell>
                {user.enabled !== false ? "Active" : "Disabled"}
              </TableCell>
              <TableCell align="right">
                {/* Action Icons with explicit styling to ensure visibility */}
                <Box display="flex" justifyContent="flex-end">
                  <Tooltip title="Edit User">
                    <IconButton
                      onClick={() => onEditUser(user)}
                      color="primary"
                      aria-label="edit user"
                      sx={{
                        color: "primary.main",
                        visibility: "visible",
                        "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                      }}
                    >
                      <EditIcon sx={{ fontSize: 24, display: "block" }} />
                    </IconButton>
                  </Tooltip>

                  {user.enabled !== false ? (
                    <Tooltip title="Disable User">
                      <IconButton
                        onClick={() => onToggleUserStatus(user, false)}
                        color="warning"
                        aria-label="disable user"
                        sx={{
                          color: "warning.main",
                          visibility: "visible",
                          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                        }}
                      >
                        <BlockIcon sx={{ fontSize: 24, display: "block" }} />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Enable User">
                      <IconButton
                        onClick={() => onToggleUserStatus(user, true)}
                        color="success"
                        aria-label="enable user"
                        sx={{
                          color: "success.main",
                          visibility: "visible",
                          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                        }}
                      >
                        <CheckCircleIcon
                          sx={{ fontSize: 24, display: "block" }}
                        />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;
