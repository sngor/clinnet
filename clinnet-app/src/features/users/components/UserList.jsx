// src/features/users/components/UserList.jsx (using DataGrid)
import React, { useState } from "react"; // Import useState
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, Button, IconButton } from "@mui/material"; // Import Button, IconButton
import EditIcon from "@mui/icons-material/Edit"; // Import icons
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import UserFormModal from "./UserFormModal"; // Import the modal
import ConfirmDeleteDialog from "./ConfirmDeleteDialog"; // Import the dialog

// Placeholder data - replace with API data later via React Query
const mockUsers = [
  {
    id: 1,
    username: "admin",
    firstName: "Super",
    lastName: "Admin",
    role: "admin",
  },
  {
    id: 2,
    username: "doctor1",
    firstName: "Alice",
    lastName: "Smith",
    role: "doctor",
  },
  {
    id: 3,
    username: "frontdesk1",
    firstName: "Bob",
    lastName: "Johnson",
    role: "frontdesk",
  },
  // Add more mock users as needed
];

function UserList() {
  // --- State for managing users (replace mockUsers eventually) ---
  const [users, setUsers] = useState(mockUsers);

  // --- State for modals/dialogs (to be implemented later) ---
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false); // Combined state for add/edit modal
  const [editingUser, setEditingUser] = useState(null); // User object if editing, null if adding
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null); // User object to delete

  // --- Modal/Dialog Handlers ---
  const handleAddUser = () => {
    console.log("Add New User clicked");
    setEditingUser(null); // Ensure we are in "add" mode
    setIsAddEditModalOpen(true);
  };

  const handleEditUser = (user) => {
    console.log("Edit User clicked:", user);
    setEditingUser(user); // Set the user to edit
    setIsAddEditModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    console.log("Delete User clicked:", user);
    setUserToDelete(user); // Set the user to delete
    setIsDeleteDialogOpen(true);
  };

  const handleCloseAddEditModal = () => {
    setIsAddEditModalOpen(false);
    setEditingUser(null); // Clear editing user on close
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null); // Clear user to delete on close
  };

  // --- Form Submission / Confirmation Handlers ---
  const handleSubmitUserForm = (formData) => {
    console.log("Form submitted:", formData);
    if (editingUser) {
      // Edit existing user (replace with API call)
      setUsers(
        users.map((u) => (u.id === formData.id ? { ...u, ...formData } : u))
      );
    } else {
      // Add new user (replace with API call)
      const newUser = { ...formData, id: Date.now() }; // Mock ID generation
      setUsers([...users, newUser]);
    }
    handleCloseAddEditModal(); // Close modal on success
  };

  const handleConfirmDelete = () => {
    console.log("Confirm delete for:", userToDelete);
    // Delete user (replace with API call)
    setUsers(users.filter((u) => u.id !== user.id));
    handleCloseDeleteDialog(); // Close dialog on success
  };

  // --- Define Columns for DataGrid ---
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "username", headerName: "Username", width: 150 },
    { field: "firstName", headerName: "First Name", width: 130 },
    { field: "lastName", headerName: "Last Name", width: 130 },
    {
      field: "role",
      headerName: "Role",
      width: 130,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleEditUser(params.row)} size="small">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDeleteUser(params.row)} size="small">
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">User Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
        >
          Add User
        </Button>
      </Box>
      <DataGrid
        rows={users} // Use state variable here
        columns={columns}
        pageSize={5} // Deprecated, use paginationModel
        // paginationModel={{ page: 0, pageSize: 5 }} // Preferred way for v5+
        rowsPerPageOptions={[1]} // Deprecated, use pageSizeOptions
        // pageSizeOptions={[1, 2, 3]} // Preferred way
        checkboxSelection={false} // Disable checkbox selection for MVP
        disableSelectionOnClick // Disable row selection on click for MVP
        // Add features like sorting, filtering later
      />

      {/* Render the Add/Edit Modal */}
      <UserFormModal
        open={isAddEditModalOpen}
        onClose={handleCloseAddEditModal}
        onSubmit={handleSubmitUserForm}
        initialData={editingUser} // Pass user data if editing, null if adding
      />

      {/* Render the Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        userName={userToDelete?.username} // Pass username for display
      />
    </Box>
  );
}

export default UserList;
