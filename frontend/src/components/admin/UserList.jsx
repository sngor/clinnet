// src/components/admin/UserList.jsx
import React, { useState, useEffect } from "react";
import { getUsers, updateUser, toggleUserStatus } from "../../utils/api";
import { showAlert } from "../../utils/alert";
import UserTable from "./UserTable";
import { Avatar, Box, Typography } from "@mui/material";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * Load users from the server
   */
  const loadUsers = async () => {
    setLoading(true);
    try {
      const userList = await getUsers();
      setUsers(userList);
    } catch (error) {
      console.error("Error loading users:", error);
      showAlert("Error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle save user
   */
  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      setSubmitting(true);

      // Ensure we have a userId
      const userId = editingUser.id || editingUser.sub;
      if (!userId) {
        showAlert("Error", "User ID is missing. Cannot update user.");
        return;
      }

      // Update the user
      await updateUser({
        ...editingUser,
        id: userId, // Make sure to include the ID explicitly
      });

      showAlert("Success", "User updated successfully");
      setShowModal(false);
    } catch (error) {
      console.error("Error saving user:", error);
      showAlert("Error", `Failed to update user: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle toggle user status (enable/disable)
   */
  const handleToggleUserStatus = async (user, enabled) => {
    try {
      // Ensure we have a userId
      const userId = user.id || user.sub;
      if (!userId) {
        showAlert("Error", "User ID is missing. Cannot update status.");
        return;
      }

      await toggleUserStatus(userId, enabled);
      showAlert(
        "Success",
        `User ${enabled ? "enabled" : "disabled"} successfully`
      );
    } catch (error) {
      console.error("Error toggling user status:", error);
      showAlert(
        "Error",
        `Failed to ${enabled ? "enable" : "disable"} user: ${error.message}`
      );
    }
  };

  // Helper function to get user initials for avatar
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

  // Render the user table
  const renderUserTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {/* ...other columns... */}
              <TableCell>Username</TableCell>
              {/* ...other columns... */}
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.uniqueId || user.id || user.sub}>
                {/* ...other cells... */}
                <TableCell>
                  {user.displayUsername ||
                    extractUsernameFromEmail(user.email) ||
                    user.username}
                </TableCell>
                {/* ...other cells... */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // In the edit user modal
  const handleEditUser = (user) => {
    // Extract username from email for consistent display
    const displayUsername = extractUsernameFromEmail(user.email);

    setEditingUser({
      ...user,
      // Use displayUsername or extract it if not already present
      username: user.displayUsername || displayUsername || user.username,
    });
    setShowModal(true);
  };

  return (
    <div>
      <h1>User List</h1>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <UserTable
          users={users}
          onEditUser={setEditingUser}
          onToggleUserStatus={handleToggleUserStatus}
        />
      )}
      {showModal && (
        <UserEditModal
          user={editingUser}
          onSave={handleSaveUser}
          onClose={() => setShowModal(false)}
          submitting={submitting}
        />
      )}
    </div>
  );
};

export default UserList;
