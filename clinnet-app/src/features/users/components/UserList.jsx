// src/features/users/components/UserList.jsx (using DataGrid)
import React, { useState } from "react"; // Import useState
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, Button, IconButton, useMediaQuery, useTheme } from "@mui/material"; // Import Button, IconButton
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
    email: "admin@clinnet.com",
    phone: "+1 (555) 123-4567",
    gender: "Male",
    role: "admin",
  },
  {
    id: 2,
    username: "doctor1",
    firstName: "Alice",
    lastName: "Smith",
    email: "alice.smith@clinnet.com",
    phone: "+1 (555) 234-5678",
    gender: "Female",
    role: "doctor",
  },
  {
    id: 3,
    username: "frontdesk1",
    firstName: "Bob",
    lastName: "Johnson",
    email: "bob.johnson@clinnet.com",
    phone: "+1 (555) 345-6789",
    gender: "Male",
    role: "frontdesk",
  },
  // Add more mock users as needed
];

function UserList() {
  // --- State for managing users (replace mockUsers eventually) ---
  const [users, setUsers] = useState(mockUsers);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

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
    setUsers(users.filter((u) => u.id !== userToDelete.id)); // Use userToDelete instead
    handleCloseDeleteDialog();
  };

  // --- Define Columns for DataGrid ---
  const getColumns = () => {
    // Base columns that are always shown
    const baseColumns = [
      { field: "id", headerName: "ID", width: 70, flex: isMobile ? 0 : 0.3 },
      { 
        field: "username", 
        headerName: "Username", 
        width: 150, 
        flex: isMobile ? 1 : 0.7,
        minWidth: 120
      },
    ];
    
    // Columns that may be hidden on mobile
    const responsiveColumns = [
      { 
        field: "firstName", 
        headerName: "First Name", 
        width: 130, 
        flex: 0.7,
        minWidth: 100,
        hide: isMobile 
      },
      { 
        field: "lastName", 
        headerName: "Last Name", 
        width: 130, 
        flex: 0.7,
        minWidth: 100,
        hide: isMobile 
      },
      {
        field: "email",
        headerName: "Email",
        width: 200,
        flex: 1,
        minWidth: 180,
        hide: isMobile
      },
      {
        field: "phone",
        headerName: "Phone",
        width: 150,
        flex: 0.8,
        minWidth: 130,
        hide: isMobile || isTablet
      },
      {
        field: "gender",
        headerName: "Gender",
        width: 100,
        flex: 0.5,
        minWidth: 90,
        hide: isMobile || isTablet
      },
      {
        field: "role",
        headerName: "Role",
        width: 130,
        flex: 0.5,
        minWidth: 90,
        hide: isMobile && isTablet
      },
    ];
    
    // Actions column
    const actionsColumn = {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      disableColumnMenu: true,
      flex: isMobile ? 0.5 : 0.4,
      minWidth: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={() => handleEditUser(params.row)} size="small">
            <EditIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
          <IconButton onClick={() => handleDeleteUser(params.row)} size="small">
            <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        </Box>
      ),
    };
    
    return [...baseColumns, ...responsiveColumns, actionsColumn];
  };

  return (
    <Box sx={{ height: { xs: 350, sm: 400 }, width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: { xs: 1.5, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            mb: { xs: 1, sm: 0 }
          }}
        >
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
          size={isMobile ? "small" : "medium"}
          sx={{ 
            minWidth: { xs: '100%', sm: 'auto' },
            py: { xs: 0.75, sm: 1 }
          }}
        >
          Add User
        </Button>
      </Box>
      <DataGrid
        rows={users}
        columns={getColumns()}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        disableRowSelectionOnClick
        autoHeight
        sx={{
          '& .MuiDataGrid-cell': {
            fontSize: { xs: '0.875rem', sm: '1rem' }
          },
          '& .MuiDataGrid-columnHeader': {
            fontSize: { xs: '0.875rem', sm: '1rem' }
          },
          '& .MuiDataGrid-footerContainer': {
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: { xs: 1, sm: 0 }
          }
        }}
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