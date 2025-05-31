// src/features/users/components/UserList.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  TableBody,
  TableCell,
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
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  FormHelperText,
  Switch,
  FormControlLabel,
  Typography,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import TableContainer from "../../../components/TableContainer";
import ConfirmDeleteDialog from "../../../components/ui/ConfirmDeleteDialog"; // Updated path
import PasswordStrengthMeter from "../../../components/PasswordStrengthMeter";
import { validatePassword } from "../../../utils/password-validator";
import useUserManagement from "../hooks/useUserManagement";
import {
  StyledTableContainer,
  tableHeaderStyle,
  actionButtonsStyle,
} from "../../../components/ui";
import {
  PageContainer,
  SectionContainer,
  CardContainer,
  PrimaryButton,
  SecondaryButton,
  TextButton,
  DangerButton,
  AppIconButton,
  FlexBox,
} from "../../../components/ui";
import Avatar from "@mui/material/Avatar";
import LoadingIndicator from "../../../components/LoadingIndicator";

// Table column definitions
const columns = [
  { id: "username", label: "Username", numeric: false },
  { id: "firstName", label: "First Name", numeric: false },
  { id: "lastName", label: "Last Name", numeric: false },
  { id: "email", label: "Email", numeric: false },
  { id: "phone", label: "Phone", numeric: false },
  { id: "role", label: "Role", numeric: false },
  { id: "status", label: "Status", numeric: false },
];

const roles = ["admin", "doctor", "frontdesk"];

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

// When creating or updating a user, set username to the first part of the email
const getUsernameFromEmail = (email) => {
  if (!email) return "";
  return email.split("@")[0];
};

function UserList() {
  // Use the custom hook for user management
  const {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    enableUser,
    disableUser,
    refreshUsers,
  } = useUserManagement();

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
    enabled: true,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [passwordError, setPasswordError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // Sorting state
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("username");

  // Load users on component mount and when the page regains focus (automatic sync)
  useEffect(() => {
    fetchUsers();
    // Add event listener for visibility change (tab focus)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchUsers();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchUsers]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      // If adding a new user and email changes, update username too
      if (name === "email" && !currentUser) {
        return {
          ...prev,
          email: value,
          username: getUsernameFromEmail(value),
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });

    // Clear specific field error
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }

    // Clear password error when password field changes
    if (name === "password") {
      setPasswordError(null);
    }
  };

  // Handle switch toggle for enabled status
  const handleSwitchChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      enabled: e.target.checked,
    }));
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
      enabled: true,
    });
    setFormErrors({});
    setPasswordError(null);
    setOpenAddEdit(true);
  };

  // Open edit user dialog
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setFormData({
      username: user.email ? getUsernameFromEmail(user.email) : user.username,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "",
      password: "", // Don't pre-fill password
      enabled: user.enabled,
    });
    setFormErrors({});
    setPasswordError(null);
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

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Show notification
  const showNotification = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Toggle user enabled status
  const handleToggleUserStatus = async (user) => {
    setActionLoading(true);

    try {
      if (user.enabled) {
        await disableUser(user.username);
        showNotification(`User ${user.username} disabled successfully`);
      } else {
        await enableUser(user.username);
        showNotification(`User ${user.username} enabled successfully`);
      }
    } catch (err) {
      showNotification(`Failed to update user status: ${err.message}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    refreshUsers();
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.username) errors.username = "Username is required";
    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.role) errors.role = "Role is required";

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email address";
    }

    // Validate password for new users
    if (!currentUser && !formData.password) {
      errors.password = "Password is required for new users";
    }

    // Validate password strength if provided
    if (formData.password) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message;
        setPasswordError(passwordValidation.message);
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save user (add or edit)
  const handleSaveUser = async () => {
    // Validate form
    if (!validateForm()) return;

    setActionLoading(true);

    try {
      const userPayload = {
        ...formData,
        username: getUsernameFromEmail(formData.email),
      };
      if (currentUser) {
        // Edit existing user
        // Use currentUser.email as the path parameter for updateUser
        const updatedUser = await updateUser(currentUser.email, userPayload);

        showNotification(`User ${updatedUser.username} updated successfully`);
      } else {
        // Add new user
        const newUser = await createUser(userPayload);
        showNotification(`User ${newUser.username} created successfully`);
      }

      setOpenAddEdit(false);
    } catch (err) {
      showNotification(`Failed to save user: ${err.message}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    setActionLoading(true);

    try {
      await deleteUser(currentUser.username);
      showNotification(`User ${currentUser.username} deleted successfully`);
      setOpenDelete(false);
    } catch (err) {
      showNotification(`Failed to delete user: ${err.message}`, "error");
    } finally {
      setActionLoading(false);
    }
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

  // Action buttons for the table
  const actionButtons = (
    <FlexBox justify="space-between" align="center" sx={{ mb: 2 }}>
      <Tooltip title="Refresh Users">
        <AppIconButton
          onClick={handleRefresh}
          disabled={loading}
          sx={{ mr: 1 }}
          aria-label="Refresh user list"
        >
          <RefreshIcon />
        </AppIconButton>
      </Tooltip>
      <PrimaryButton
        startIcon={<AddIcon />}
        onClick={handleAddUser}
        sx={{ borderRadius: 1.5 }}
        aria-label="Add new user"
      >
        Add User
      </PrimaryButton>
    </FlexBox>
  );

  return (
    <PageContainer>
      <FlexBox justify="space-between" align="center" sx={{ mb: 2 }}>
        <Typography variant="h5">User Management</Typography>
        {/* Only keep one Add User button in the table action bar below */}
      </FlexBox>

      {/* Replace nested containers with just CardContainer */}
      <CardContainer>
        <TableContainer
          title="Users"
          action={actionButtons}
          aria-label="Users table"
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading && !openAddEdit && !openDelete ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              {/* Use the shared LoadingIndicator for consistency */}
              <LoadingIndicator size="large" message="Loading users..." />
            </Box>
          ) : (
            <StyledTableContainer>
              <TableHead sx={tableHeaderStyle}>
                <TableRow>
                  {columns.map((column) => (
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
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} align="center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  stableSort(users, getComparator(order, orderBy)).map(
                    (user) => (
                      <TableRow
                        key={user.username}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Avatar
                              src={user.profileImage || undefined}
                              alt={
                                user.firstName ||
                                user.email?.split("@")[0] ||
                                "User"
                              }
                              sx={{ width: 32, height: 32, fontSize: 16 }}
                            >
                              {user.firstName
                                ? user.firstName[0]
                                : user.email
                                ? user.email[0].toUpperCase()
                                : "U"}
                            </Avatar>
                            <span>
                              {user.email ? user.email.split("@")[0] : "-"}
                            </span>
                          </Box>
                        </TableCell>
                        <TableCell>{user.firstName || "-"}</TableCell>
                        <TableCell>{user.lastName || "-"}</TableCell>
                        <TableCell>{user.email || "-"}</TableCell>
                        <TableCell>{user.phone || "-"}</TableCell>
                        <TableCell>
                          <Chip
                            label={
                              user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)
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
                        <TableCell>
                          <Chip
                            icon={
                              user.enabled ? <CheckCircleIcon /> : <BlockIcon />
                            }
                            label={user.enabled ? "Active" : "Disabled"}
                            size="small"
                            color={user.enabled ? "success" : "default"}
                            variant={user.enabled ? "filled" : "outlined"}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit User">
                            <AppIconButton
                              icon={EditIcon}
                              color="primary"
                              size="small"
                              onClick={() => handleEditUser(user)}
                              disabled={actionLoading}
                              aria-label={`Edit user ${user.firstName} ${user.lastName}`}
                            />
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <AppIconButton
                              icon={DeleteIcon}
                              color="error"
                              size="small"
                              onClick={() => handleDeleteClick(user)}
                              disabled={actionLoading}
                              aria-label={`Delete user ${user.firstName} ${user.lastName}`}
                            />
                          </Tooltip>
                          <Tooltip
                            title={
                              user.enabled ? "Disable User" : "Enable User"
                            }
                          >
                            <AppIconButton
                              icon={user.enabled ? BlockIcon : CheckCircleIcon}
                              color={user.enabled ? "default" : "success"}
                              size="small"
                              onClick={() => handleToggleUserStatus(user)}
                              disabled={actionLoading}
                              aria-label={
                                user.enabled
                                  ? `Disable user ${user.firstName} ${user.lastName}`
                                  : `Enable user ${user.firstName} ${user.lastName}`
                              }
                            />
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  )
                )}
              </TableBody>
            </StyledTableContainer>
          )}
        </TableContainer>
      </CardContainer>

      {/* Add/Edit User Dialog */}
      <Dialog
        open={openAddEdit}
        onClose={!actionLoading ? handleCloseDialog : undefined}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentUser ? `Edit User: ${currentUser.username}` : "Add New User"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {/* Display user avatar at the top of the form if editing an existing user */}
            {currentUser && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <Avatar
                  src={currentUser.profileImage || undefined}
                  alt={
                    currentUser.firstName ||
                    getUsernameFromEmail(currentUser.email) ||
                    "User"
                  }
                  sx={{ width: 64, height: 64, fontSize: 32 }}
                >
                  {currentUser.firstName
                    ? currentUser.firstName[0]
                    : currentUser.email
                    ? currentUser.email[0].toUpperCase()
                    : "U"}
                </Avatar>
              </Box>
            )}

            <TextField
              name="username"
              label="Username"
              fullWidth
              value={
                formData.email
                  ? getUsernameFromEmail(formData.email)
                  : formData.username
              }
              InputProps={{ readOnly: true }}
              required
              error={!!formErrors.username}
              helperText={formErrors.username}
            />

            {!currentUser && (
              <>
                <TextField
                  name="password"
                  label="Password"
                  type="password"
                  fullWidth
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                />
                <PasswordStrengthMeter password={formData.password} />
                <FormHelperText>
                  Password must be at least 8 characters with uppercase,
                  lowercase, number, and special character
                </FormHelperText>
              </>
            )}

            {currentUser && (
              <TextField
                name="password"
                label="New Password (leave blank to keep current)"
                type="password"
                fullWidth
                value={formData.password}
                onChange={handleInputChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
              />
            )}

            {currentUser && formData.password && (
              <>
                <PasswordStrengthMeter password={formData.password} />
                <FormHelperText>
                  Password must be at least 8 characters with uppercase,
                  lowercase, number, and special character
                </FormHelperText>
              </>
            )}

            <TextField
              name="firstName"
              label="First Name"
              fullWidth
              value={formData.firstName}
              onChange={handleInputChange}
              required
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
            />

            <TextField
              name="lastName"
              label="Last Name"
              fullWidth
              value={formData.lastName}
              onChange={handleInputChange}
              required
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
            />

            <TextField
              name="email"
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleInputChange}
              placeholder="user@example.com"
              error={!!formErrors.email}
              helperText={formErrors.email}
            />

            <TextField
              name="phone"
              label="Phone Number"
              fullWidth
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+1 (555) 123-4567"
              error={!!formErrors.phone}
              helperText={formErrors.phone}
            />

            <FormControl fullWidth required error={!!formErrors.role}>
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
              {formErrors.role && (
                <FormHelperText>{formErrors.role}</FormHelperText>
              )}
            </FormControl>

            {currentUser && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enabled}
                    onChange={handleSwitchChange}
                    color="success"
                  />
                }
                label={
                  <Typography variant="body2">
                    {formData.enabled ? "User is active" : "User is disabled"}
                  </Typography>
                }
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <SecondaryButton onClick={handleCloseDialog} disabled={actionLoading}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            onClick={handleSaveUser}
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <CircularProgress size={24} />
            ) : currentUser ? (
              "Save Changes"
            ) : (
              "Add User"
            )}
          </PrimaryButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={openDelete}
        onClose={handleCloseDialog}
        onConfirm={handleDeleteUser}
        itemName={currentUser?.username}
        itemType="user"
        loading={actionLoading}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
}

export default UserList;
