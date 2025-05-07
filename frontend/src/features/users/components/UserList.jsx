// src/features/users/components/UserList.jsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer as MuiTableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import TableContainer from "../../../components/TableContainer";
import ConfirmDeleteDialog from "../../../components/ConfirmDeleteDialog";

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
  {
    id: 4,
    username: "doctor2",
    firstName: "Carol",
    lastName: "Williams",
    email: "carol.williams@clinnet.com",
    phone: "+1 (555) 456-7890",
    role: "doctor",
  },
  {
    id: 5,
    username: "frontdesk2",
    firstName: "David",
    lastName: "Brown",
    email: "david.brown@clinnet.com",
    phone: "+1 (555) 567-8901",
    role: "frontdesk",
  },
];

const roles = ["admin", "doctor", "frontdesk"];

// Table column definitions
const columns = [
  { id: "id", label: "ID", numeric: true },
  { id: "username", label: "Username", numeric: false },
  { id: "firstName", label: "First Name", numeric: false },
  { id: "lastName", label: "Last Name", numeric: false },
  { id: "email", label: "Email", numeric: false },
  { id: "phone", label: "Phone", numeric: false },
  { id: "role", label: "Role", numeric: false },
];

function descendingComparator(a, b, orderBy) {
  // Handle null or undefined values
  if (b[orderBy] == null) return -1;
  if (a[orderBy] == null) return 1;

  // Compare based on type
  if (typeof b[orderBy] === "string") {
    return b[orderBy].toLowerCase().localeCompare(a[orderBy].toLowerCase());
  } else {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1]; // Preserve original order if values are equal
  });
  return stabilizedThis.map((el) => el[0]);
}

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
    password: "",
  });

  // Sorting state
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("id");

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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
      password: "",
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
      password: "", // Don't pre-fill password
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
      setUsers(
        users.map((user) =>
          user.id === currentUser.id
            ? { ...user, ...formData, id: currentUser.id }
            : user
        )
      );
    } else {
      // Add new user
      const newUser = {
        ...formData,
        id: Math.max(...users.map((u) => u.id)) + 1, // Simple ID generation
      };
      setUsers([...users, newUser]);
    }
    setOpenAddEdit(false);
  };

  // Delete user
  const handleDeleteUser = () => {
    setUsers(users.filter((user) => user.id !== currentUser.id));
    setOpenDelete(false);
  };

  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Create sort handler for a column
  const createSortHandler = (property) => () => {
    handleRequestSort(property);
  };

  // Action button for the table
  const actionButton = (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={handleAddUser}
      sx={{ borderRadius: 1.5 }}
    >
      Add User
    </Button>
  );

  return (
    <Box sx={{ width: "100%" }}>
      <TableContainer title="Users" action={actionButton}>
        <MuiTableContainer sx={{ boxShadow: "none" }}>
          <Table
            sx={{
              minWidth: 650,
              "& .MuiTableCell-root": {
                borderBottom: "none",
                padding: "16px",
              },
              "& tbody tr": {
                borderBottom: "1px solid rgba(224, 224, 224, 0.4)",
              },
              "& tbody tr:last-child": {
                border: 0,
              },
              borderCollapse: "separate",
              borderSpacing: 0,
              "& thead tr th:first-of-type": {
                borderRadius: "8px 0 0 8px",
              },
              "& thead tr th:last-of-type": {
                borderRadius: "0 8px 8px 0",
              },
            }}
            aria-label="users table"
          >
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                {columns.map((column, index) => (
                  <TableCell
                    key={column.id}
                    sortDirection={orderBy === column.id ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : "asc"}
                      onClick={createSortHandler(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stableSort(users, getComparator(order, orderBy)).map((user) => (
                <TableRow
                  key={user.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {user.id}
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>{user.email || "-"}</TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        user.role.charAt(0).toUpperCase() + user.role.slice(1)
                      }
                      size="small"
                      color={
                        user.role === "admin"
                          ? "error"
                          : user.role === "doctor"
                          ? "primary"
                          : "secondary"
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleEditUser(user)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDeleteClick(user)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </MuiTableContainer>
      </TableContainer>

      {/* Add/Edit User Dialog */}
      <Dialog
        open={openAddEdit}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{currentUser ? "Edit User" : "Add New User"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
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
                {roles.map((role) => (
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
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={
              !formData.username ||
              !formData.firstName ||
              !formData.lastName ||
              !formData.role
            }
          >
            {currentUser ? "Save Changes" : "Add User"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={openDelete}
        onClose={handleCloseDialog}
        onConfirm={handleDeleteUser}
        itemName={currentUser?.username}
        itemType="user"
      />
    </Box>
  );
}

export default UserList;
