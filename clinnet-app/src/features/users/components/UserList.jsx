// src/features/users/components/UserList.jsx
import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogContentText
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

// Placeholder data - replace with API data later via React Query
const initialUsers = [
  {
    id: 1,
    username: "admin",
    firstName: "Super",
    lastName: "Admin",
    email: "admin@clinnet.com",
    phone: "+1 (555) 123-4567",
    role: "admin",
  },
  {
    id: 2,
    username: "doctor1",
    firstName: "Alice",
    lastName: "Smith",
    email: "alice.smith@clinnet.com",
    phone: "+1 (555) 234-5678",
    role: "doctor",
  },
  {
    id: 3,
    username: "frontdesk1",
    firstName: "Bob",
    lastName: "Johnson",
    email: "bob.johnson@clinnet.com",
    phone: "+1 (555) 345-6789",
    role: "frontdesk",
  },
];

const roles = ["admin", "doctor", "frontdesk"];

function UserList() {
  const [users, setUsers] = useState(initialUsers);
  const [openAddEdit, setOpenAddEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    password: ""
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Open add user dialog
  const handleAddUser = () => {
    setCurrentUser(null);
    setFormData({
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      password: ""
    });
    setOpenAddEdit(true);
  };

  // Open edit user dialog
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email || "",
      phone: user.phone || "",
      role: user.role,
      password: "" // Don't pre-fill password
    });
    setOpenAddEdit(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (user) => {
    setCurrentUser(user);
    setOpenDelete(true);
  };

  // Close dialogs
  const handleCloseDialog = () => {
    setOpenAddEdit(false);
    setOpenDelete(false);
  };

  // Save user (add or edit)
  const handleSaveUser = () => {
    if (currentUser) {
      // Edit existing user
      setUsers(users.map(user => 
        user.id === currentUser.id ? { ...user, ...formData, id: currentUser.id } : user
      ));
    } else {
      // Add new user
      const newUser = {
        ...formData,
        id: Math.max(...users.map(u => u.id)) + 1 // Simple ID generation
      };
      setUsers([...users, newUser]);
    }
    setOpenAddEdit(false);
  };

  // Delete user
  const handleDeleteUser = () => {
    setUsers(users.filter(user => user.id !== currentUser.id));
    setOpenDelete(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h6">
          Users
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddUser}
        >
          Add User
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="users table">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {user.id}
                </TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>{user.email || "-"}</TableCell>
                <TableCell>{user.phone || "-"}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" size="small" onClick={() => handleEditUser(user)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton color="error" size="small" onClick={() => handleDeleteClick(user)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit User Dialog */}
      <Dialog open={openAddEdit} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{currentUser ? "Edit User" : "Add New User"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              name="username"
              label="Username"
              fullWidth
              value={formData.username}
              onChange={handleInputChange}
              required
            />
            
            {!currentUser && (
              <TextField
                name="password"
                label="Password"
                type="password"
                fullWidth
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            )}
            
            <TextField
              name="firstName"
              label="First Name"
              fullWidth
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            
            <TextField
              name="lastName"
              label="Last Name"
              fullWidth
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
            
            <TextField
              name="email"
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleInputChange}
              placeholder="user@example.com"
            />
            
            <TextField
              name="phone"
              label="Phone Number"
              fullWidth
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+1 (555) 123-4567"
            />
            
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleInputChange}
              >
                {roles.map(role => (
                  <MenuItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained">
            {currentUser ? "Save Changes" : "Add User"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user "{currentUser?.username}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserList;